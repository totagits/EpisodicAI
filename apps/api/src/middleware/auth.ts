import { initializeApp, getApps, cert, applicationDefault, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { Request, Response, NextFunction } from 'express';

// Initialize Firebase Admin once — gracefully handles missing credentials
if (!getApps().length) {
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    // Explicit service account credentials (production via Cloud Run env vars)
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Cloud Run stores the private key with literal \n — replace them
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Application Default Credentials — works on GCP if the service account has Firebase roles
    // Also used in development with `gcloud auth application-default login`
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'episodic-ai-studio-2026',
    });
  }
}

// Initialize secondary app for Auth (verifies tokens for 'episodicai')
const authProjectId = process.env.FIREBASE_AUTH_PROJECT_ID || 'episodicai';
let authApp = getApps().find(app => app.name === 'authApp');
if (!authApp) {
  if (authProjectId && authProjectId !== (process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'episodic-ai-studio-2026')) {
    authApp = initializeApp({
      credential: applicationDefault(),
      projectId: authProjectId,
    }, 'authApp');
  }
}

export const adminAuth = authApp ? getAuth(authApp) : getAuth();
export const adminDb = getFirestore();

// Extend Express Request with user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        workspaceId: string;
      };
      isDemoMode?: boolean;
    }
  }
}

/**
 * Auth middleware — verifies Firebase JWT token on every protected route.
 * If the request carries `X-Demo-Mode: true`, bypasses auth and injects demo workspace.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Allow demo mode — bypass auth entirely
  if (req.headers['x-demo-mode'] === 'true' || req.query.demo === 'true') {
    req.isDemoMode = true;
    req.user = { uid: 'demo-user', email: 'demo@episodic.ai', workspaceId: 'wsp-default' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    // workspaceId is stored as a custom claim after onboarding, defaulting to uid-based workspace
    const workspaceId = (decoded['workspaceId'] as string) || `wsp-${decoded.uid}`;
    req.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      workspaceId,
    };
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token', details: err.message });
  }
}

/**
 * Sets workspaceId as a custom claim on the Firebase user token.
 * Called after workspace creation so subsequent tokens carry the workspaceId.
 */
export async function setWorkspaceClaim(uid: string, workspaceId: string): Promise<void> {
  try {
    await adminAuth.setCustomUserClaims(uid, { workspaceId });
  } catch (err: any) {
    console.warn(`[Firebase Auth] Failed to set custom user claims for workspace: ${err.message}. Defaulting to wsp-uid.`);
  }
}
