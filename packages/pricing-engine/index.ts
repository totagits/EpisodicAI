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

export interface ParsedRequest {
  durationSeconds: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  style: string;
  qualityTier: 'DRAFT' | 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'HERO';
  maxCost: number;
}

export class CostAwareRouter {
  private static wordToNumber: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15
  };

  /**
   * Parses natural language internal requests into structured constraints.
   */
  public static parseInternalRequest(requestText: string): ParsedRequest {
    const text = requestText.toLowerCase();

    // 1. Parse duration
    let durationSeconds = 4; // default
    const durationMatch = text.match(/(\w+|\d+)-second/);
    if (durationMatch) {
      const durStr = durationMatch[1];
      if (this.wordToNumber[durStr] !== undefined) {
        durationSeconds = this.wordToNumber[durStr];
      } else {
        const parsedVal = parseInt(durStr, 10);
        if (!isNaN(parsedVal)) {
          durationSeconds = parsedVal;
        }
      }
    }

    // 2. Parse aspect ratio
    let aspectRatio: '16:9' | '9:16' | '1:1' = '16:9';
    if (text.includes('16:9')) aspectRatio = '16:9';
    else if (text.includes('9:16')) aspectRatio = '9:16';
    else if (text.includes('1:1')) aspectRatio = '1:1';

    // 3. Parse quality tier
    let qualityTier: 'DRAFT' | 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'HERO' = 'STANDARD';
    if (text.includes('draft')) qualityTier = 'DRAFT';
    else if (text.includes('economy')) qualityTier = 'ECONOMY';
    else if (text.includes('medium') || text.includes('standard')) qualityTier = 'STANDARD';
    else if (text.includes('high') || text.includes('premium')) qualityTier = 'PREMIUM';
    else if (text.includes('hero')) qualityTier = 'HERO';

    // 4. Parse max cost
    let maxCost = Infinity;
    const costMatch = text.match(/under\s+\$?(\d+(?:\.\d+)?)/);
    if (costMatch) {
      maxCost = parseFloat(costMatch[1]);
    }

    // 5. Parse style (extract content between aspect ratio and "at ... quality" or "under ...")
    let style = 'dramatic shot';
    const styleMatch = requestText.match(/(?:16:9|9:16|1:1)\s+(.*?)\s+at\s+/i) || requestText.match(/(?:16:9|9:16|1:1)\s+(.*?)\s+under/i);
    if (styleMatch) {
      style = styleMatch[1].trim();
    }

    return {
      durationSeconds,
      aspectRatio,
      style,
      qualityTier,
      maxCost
    };
  }

  /**
   * Routes an internal request to the optimal video provider using pricing engine database constraints.
   */
  public static selectRouteForInternalRequest(
    requestText: string,
    pricingList: ProviderPricing[],
    healthMetrics: ProviderHealthMetric[],
    historicalStats: Record<string, { successRate: number; qcPassRate: number }> = {}
  ): {
    selectedPricing: ProviderPricing;
    estimatedCostCredits: number;
    parsed: ParsedRequest;
  } {
    const parsed = this.parseInternalRequest(requestText);

    // 1. Filter candidates supporting the required capability (video-generation)
    const candidates = pricingList.filter(p => p.capability === 'video-generation');
    if (candidates.length === 0) {
      throw new Error(`No video-generation providers found in pricing list`);
    }

    // 2. Select only healthy ones
    const healthyCandidates = candidates.filter(pricing => {
      const health = healthMetrics.find(h => h.providerName === pricing.providerName) || {
        isHealthy: true,
        latencyMs: 500,
        failureRate: 0.05
      };
      return health.isHealthy;
    });

    if (healthyCandidates.length === 0) {
      throw new Error("No healthy video-generation providers available.");
    }

    // 3. Compute cost for each candidate based on duration and optional resolution multipliers
    const scoredCandidates = healthyCandidates.map(pricing => {
      const stats = historicalStats[pricing.providerName] || { successRate: 0.95, qcPassRate: 0.90 };
      const expectedAttempts = Math.ceil(1 / stats.successRate);
      const baseCost = pricing.costPerUnit * parsed.durationSeconds * expectedAttempts;
      
      // Let's check for standard resolution (720p)
      let multiplier = 1.0;
      const expectedTotalCost = baseCost * multiplier;

      return {
        pricing,
        estimatedCost: expectedTotalCost
      };
    });

    // 4. Filter candidates that fit the maxCost constraint
    const eligible = scoredCandidates.filter(c => c.estimatedCost <= parsed.maxCost);

    if (eligible.length === 0) {
      // Fallback: pick the cheapest available candidate
      const sortedByCost = [...scoredCandidates].sort((a, b) => a.estimatedCost - b.estimatedCost);
      return {
        selectedPricing: sortedByCost[0].pricing,
        estimatedCostCredits: parseFloat(sortedByCost[0].estimatedCost.toFixed(2)),
        parsed
      };
    }

    // 5. Select the best model among eligible based on quality score
    // Quality ratings: Runway: 98, Veo: 95, Luma: 90, Kling Pro: 89, Kling: 88, MiniMax: 88, HunyuanVideo: 87, Wan 2.1: 86, Seedance: 85, MockAI: 50
    const getQualityScore = (providerName: string, modelName: string): number => {
      const name = (providerName + ' ' + modelName).toLowerCase();
      if (name.includes('runway')) return 98;
      if (name.includes('veo')) return 95;
      if (name.includes('luma')) return 90;
      if (name.includes('kling-pro') || name.includes('pro-v3')) return 89;
      if (name.includes('kling')) return 88;
      if (name.includes('minimax')) return 88;
      if (name.includes('hunyuan') || name.includes('tencent')) return 87;
      if (name.includes('wan-2.1') || name.includes('wan') || name.includes('runpod')) return 86;
      if (name.includes('seedance')) return 85;
      return 50; // default for MockAI
    };

    const sortedByQuality = eligible.sort((a, b) => {
      const qA = getQualityScore(a.pricing.providerName, a.pricing.modelName);
      const qB = getQualityScore(b.pricing.providerName, b.pricing.modelName);
      if (qB !== qA) return qB - qA; // Higher quality first
      return a.estimatedCost - b.estimatedCost; // If same quality, cheaper first
    });

    return {
      selectedPricing: sortedByQuality[0].pricing,
      estimatedCostCredits: parseFloat(sortedByQuality[0].estimatedCost.toFixed(2)),
      parsed
    };
  }

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
