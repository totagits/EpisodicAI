import type {
  ProviderPricing,
  ProviderCapability,
  Shot,
  ProviderHealthMetric
} from '@episodic-ai/types';

export interface RouteRequest {
  capability: ProviderCapability;
  durationSeconds?: number;
  resolution?: '512p' | '720p' | '1080p' | '4k';
  qualityTier: 'DRAFT' | 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'HERO';
  remainingEpisodeBudget: number;
}

export interface RouteResult {
  selectedPricing: ProviderPricing;
  estimatedCostCredits: number;
  grossMarginPercentage: number;
  warningAlert: boolean;
  hardStopAlert: boolean;
}

export class CostAwareRouter {
  private static TARGET_MARGIN = 0.65;
  private static WARNING_THRESHOLD = 0.55;
  private static HARD_STOP_THRESHOLD = 0.40;

  /**
   * Evaluates and routes a shot to the best provider based on cost, quality, and margins.
   */
  public static selectProviderRoute(
    request: RouteRequest,
    pricingList: ProviderPricing[],
    healthMetrics: ProviderHealthMetric[],
    historicalStats: Record<string, { successRate: number; qcPassRate: number }>
  ): RouteResult {
    // 1. Filter candidates supporting the required capability
    const candidates = pricingList.filter(p => p.capability === request.capability);
    if (candidates.length === 0) {
      throw new Error(`No providers found with capability: ${request.capability}`);
    }

    let bestPricing: ProviderPricing | null = null;
    let lowestCostPerUsableSecond = Infinity;
    let estimatedCost = 0;

    // 2. Select the optimal provider based on score
    candidates.forEach(pricing => {
      const health = healthMetrics.find(h => h.providerName === pricing.providerName) || {
        isHealthy: true,
        latencyMs: 500,
        failureRate: 0.05
      };

      if (!health.isHealthy) return; // Skip unhealthy providers

      const stats = historicalStats[pricing.providerName] || { successRate: 0.95, qcPassRate: 0.90 };

      // Calculate unit count
      let units = 1;
      if (pricing.costUnit === 'second' && request.durationSeconds) {
        units = request.durationSeconds;
      }

      // Cost calculation formulas:
      // expected_generation_cost = provider_unit_cost * requested_units * expected_attempt_count
      const expectedAttempts = Math.ceil(1 / stats.successRate);
      const generationCost = pricing.costPerUnit * units * expectedAttempts;

      // Adjust for resolution multipliers
      let resolutionMultiplier = 1.0;
      if (request.resolution === '1080p') resolutionMultiplier = 1.25;
      if (request.resolution === '4k') resolutionMultiplier = 2.0;

      const expectedTotalCost = generationCost * resolutionMultiplier;

      // cost_per_usable_second = expected_total_cost / (requested_duration * historical_success_rate * historical_qc_pass_rate)
      const duration = request.durationSeconds || 1;
      const costPerUsableSecond =
        expectedTotalCost / (duration * stats.successRate * stats.qcPassRate);

      // Filter by Quality Tier restrictions
      if (request.qualityTier === 'DRAFT' && pricing.providerName !== 'MockAI') {
        return; // Draft tier uses MockAI only to preserve production credits
      }

      if (costPerUsableSecond < lowestCostPerUsableSecond) {
        lowestCostPerUsableSecond = costPerUsableSecond;
        bestPricing = pricing;
        estimatedCost = expectedTotalCost;
      }
    });

    // Fallback if no matching provider found
    if (!bestPricing) {
      bestPricing = candidates[0];
      estimatedCost = bestPricing.costPerUnit * (request.durationSeconds || 1);
    }

    // 3. Profitability margin controls
    // gross_margin = (retail_price - cost) / retail_price
    // Since we charge user credits, let's assume the "retail price" charged is the Episode budget allocation
    const retailCreditCharge = request.remainingEpisodeBudget > 0 ? request.remainingEpisodeBudget : estimatedCost * 1.5;
    const grossMargin = retailCreditCharge > 0 ? (retailCreditCharge - estimatedCost) / retailCreditCharge : 0.65;

    const marginPercentage = Math.round(grossMargin * 100);
    const warningAlert = grossMargin < CostAwareRouter.WARNING_THRESHOLD;
    const hardStopAlert = grossMargin < CostAwareRouter.HARD_STOP_THRESHOLD;

    return {
      selectedPricing: bestPricing,
      estimatedCostCredits: parseFloat(estimatedCost.toFixed(2)),
      grossMarginPercentage: marginPercentage,
      warningAlert,
      hardStopAlert
    };
  }

  /**
   * Reconciles credits reserved vs actual costs, updates provider history metrics.
   */
  public static reconcileLedger(
    reservedCredits: number,
    actualCost: number
  ): { refundAmount: number; isOverBudget: boolean } {
    const refundAmount = Math.max(0, reservedCredits - actualCost);
    const isOverBudget = actualCost > reservedCredits;
    return { refundAmount, isOverBudget };
  }
}
