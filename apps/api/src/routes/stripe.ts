import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { adjustCredits, addDoc, getDoc } from '../db/firestore';

const router = Router();

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2026-05-27.dahlia' });
};

// Pocket FM Coin Packages (9 coins per episode unlock)
const CREDIT_PACKAGES = [
  {
    id: 'coins_9',
    label: '9 Coins (1 Episode)',
    credits: 9,
    priceUsd: 100, // $1.00 in cents
    description: 'Single episode unlock — 9 coins ($1.00)',
    priceId: process.env.STRIPE_PRICE_ID_9COINS,
  },
  {
    id: 'coins_165',
    label: '165 Coins (Binge Pack)',
    credits: 165,
    priceUsd: 1999, // $19.99
    description: '136 + 29 free coins (20% Bonus + No Ads for 2 Weeks)',
    priceId: process.env.STRIPE_PRICE_ID_165COINS,
  },
  {
    id: 'coins_212',
    label: '212 Coins (Pro Binge Pack)',
    credits: 212,
    priceUsd: 2499, // $24.99
    description: '170 + 42 free coins (20% Bonus + No Ads for 1 Month)',
    priceId: process.env.STRIPE_PRICE_ID_212COINS,
    popular: true,
  },
  {
    id: 'coins_255',
    label: '255 Coins (Ultra Binge Pack)',
    credits: 255,
    priceUsd: 2999, // $29.99
    description: '204 + 51 free coins (25% Bonus + No Ads for 1 Month)',
    priceId: process.env.STRIPE_PRICE_ID_255COINS,
  },
  // Legacy aliases for backward compatibility
  {
    id: 'credits_100',
    label: '9 Coins (1 Episode)',
    credits: 9,
    priceUsd: 100,
    description: 'Single episode unlock — 9 coins ($1.00)',
  },
  {
    id: 'credits_500',
    label: '212 Coins (Pro Binge Pack)',
    credits: 212,
    priceUsd: 2499,
    description: '170 + 42 free coins (20% Bonus + No Ads for 1 Month)',
    popular: true,
  },
  {
    id: 'credits_2000',
    label: '255 Coins (Ultra Binge Pack)',
    credits: 255,
    priceUsd: 2999,
    description: '204 + 51 free coins (25% Bonus + No Ads for 1 Month)',
  },
];

// GET /api/billing/packages — list available credit packages
router.get('/packages', (_req: Request, res: Response) => {
  res.json(CREDIT_PACKAGES.map(p => ({ ...p, priceId: undefined }))); // never expose price IDs
});

// POST /api/billing/create-checkout-session
router.post('/create-checkout-session', requireAuth, async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    const { packageId } = req.body;
    const { workspaceId, email } = req.user!;

    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return res.status(400).json({ error: 'Invalid package ID' });

    // Get or create Stripe customer
    const workspace = await getDoc('workspaces', workspaceId);
    let customerId: string | undefined = workspace?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { workspaceId },
      });
      customerId = customer.id;
      // Save customerId for future sessions
      const { adminDb } = await import('../middleware/auth');
      await adminDb.collection('workspaces').doc(workspaceId).update({ stripeCustomerId: customerId });
    }

    // Create Stripe Checkout session
    const baseUrl = process.env.WEB_BASE_URL || 'https://episodic-ai-web-26273727080.us-central1.run.app';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        pkg.priceId
          ? { price: pkg.priceId, quantity: 1 }
          : {
              price_data: {
                currency: 'usd',
                unit_amount: pkg.priceUsd,
                product_data: {
                  name: `EpisodicAI — ${pkg.label}`,
                  description: pkg.description,
                },
              },
              quantity: 1,
            },
      ],
      metadata: {
        workspaceId,
        credits: pkg.credits.toString(),
        packageId,
      },
      success_url: `${baseUrl}/dashboard?payment=success&credits=${pkg.credits}`,
      cancel_url: `${baseUrl}/dashboard?payment=cancelled`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (e: any) {
    console.error('[Stripe checkout]', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/billing/webhook — Stripe event handler
// Raw body required for signature verification
import express from 'express';

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || !sig) {
      return res.status(400).json({ error: 'Missing webhook configuration' });
    }

    let event: Stripe.Event;
    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('[Stripe webhook] Signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { workspaceId, credits } = session.metadata || {};

        if (workspaceId && credits) {
          const creditAmount = parseInt(credits, 10);
          await adjustCredits(workspaceId, creditAmount);
          await addDoc('ledger', {
            workspaceId,
            type: 'purchase',
            amount: creditAmount,
            description: `Stripe purchase — ${creditAmount} credits`,
            stripeSessionId: session.id,
            amountPaidUsd: (session.amount_total || 0) / 100,
          });
          console.log(`[Stripe] Deposited ${creditAmount} credits to workspace ${workspaceId}`);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.warn('[Stripe] Payment failed:', pi.id, pi.last_payment_error?.message);
        break;
      }
      default:
        // Unhandled events are fine — we just acknowledge them
        break;
    }

    res.json({ received: true });
  },
);

// GET /api/billing/portal — Stripe Customer Portal
router.get('/portal', requireAuth, async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    const workspace = await getDoc('workspaces', req.user!.workspaceId);
    if (!workspace?.stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found. Make a purchase first.' });
    }

    const baseUrl = process.env.WEB_BASE_URL || 'https://episodic-ai-web-26273727080.us-central1.run.app';
    const session = await stripe.billingPortal.sessions.create({
      customer: workspace.stripeCustomerId,
      return_url: `${baseUrl}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
