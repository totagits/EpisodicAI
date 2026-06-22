import type {
  ProviderCapability,
  ProviderPricing,
  ProviderHealthMetric
} from '@episodic-ai/types';

export interface ProviderResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    isRetryable: boolean;
  };
  costCredits: number;
  latencyMs: number;
  providerVersion: string;
}

export interface GenerationRequest {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  resolution?: '512p' | '720p' | '1080p' | '4k';
  durationSeconds?: number;
  seed?: number;
  characterReferenceUrl?: string;
  voiceId?: string;
}

// --- Interfaces for AI Operations ---

export interface ILLMProvider {
  generateText(prompt: string, schema?: object): Promise<ProviderResponse<string>>;
}

export interface IImageGenerationProvider {
  generateImage(request: GenerationRequest): Promise<ProviderResponse<{ imageUrl: string }>>;
}

export interface IVideoGenerationProvider {
  generateVideo(request: GenerationRequest): Promise<ProviderResponse<{ videoUrl: string }>>;
}

export interface ITextToSpeechProvider {
  generateSpeech(text: string, voiceId: string): Promise<ProviderResponse<{ audioUrl: string; durationSeconds: number }>>;
}

export interface ILipSyncProvider {
  syncAudioToVideo(videoUrl: string, audioUrl: string): Promise<ProviderResponse<{ syncedVideoUrl: string }>>;
}

export interface IModerationProvider {
  moderateContent(text: string): Promise<ProviderResponse<{ flagged: boolean; categories: string[] }>>;
}

// --- Standard Mock Provider implementation ---
// This enables complete end-to-end runs without requiring API keys or spending credits.
export class MockProvider implements ILLMProvider, IImageGenerationProvider, IVideoGenerationProvider, ITextToSpeechProvider, ILipSyncProvider, IModerationProvider {
  private name = 'MockAI';
  private version = 'v1.2.0';

  private trackCost(capability: ProviderCapability, durationOrUnits: number = 1): number {
    // Simple mock credit costing
    const costs: Record<ProviderCapability, number> = {
      'llm': 0.05, // per 1k tokens (mocked)
      'image-generation': 0.2, // per image
      'video-generation': 1.5, // per second
      'image-to-video': 1.0, // per second
      'lip-sync': 0.8, // per second
      'text-to-speech': 0.1, // per character
      'speech-to-speech': 0.2,
      'music': 1.0,
      'sound-effects': 0.5,
      'upscale': 0.3,
      'moderation': 0.01
    };
    return (costs[capability] || 0.1) * durationOrUnits;
  }

  public async generateText(prompt: string, schema?: object): Promise<ProviderResponse<string>> {
    const start = Date.now();
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let output = '';
    if (prompt.toLowerCase().includes('bible')) {
      output = JSON.stringify({
        summary: "In a world where gravity is directional based on belief, a young mechanic designs boots that allow her to walk on walls, uncovering a corporate conspiracy that controls the sky.",
        worldRules: [
          "Gravity vectors are determined by spiritual alignment and conviction.",
          "Walking on the ceiling requires strict mental concentration.",
          "Corporate factions control the local vertical fields."
        ],
        themes: ["Belief shape reality", "Class struggles in literal heights", "Found family"],
        forbiddenContradictions: [
          "Characters cannot change gravity direction instantly without a belief-shift or a magnetic amplifier boot.",
          "The Sky Faction cannot possess mechanical wings."
        ],
        visualIdentityNotes: "Deep purples, electric blues, neon light trails against absolute black sky backgrounds.",
        voiceIdentityNotes: "Cinematic, reverb-heavy dialogue with soft ambient whispers in outdoor scenes."
      });
    } else if (prompt.toLowerCase().includes('screenplay') || prompt.toLowerCase().includes('script')) {
      output = JSON.stringify({
        title: "The Upward Fall",
        scenes: [
          {
            sceneNumber: 1,
            locationId: "loc-workshop",
            timeOfDay: "day",
            description: "Luna's crowded workshop, filled with hovering metal scraps and ticking gears.",
            beats: ["Luna adjusts her boots", "Boots spark, causing her to float", "Leo warns her of the Sky Guard patrol"],
            shots: [
              {
                shotNumber: 1,
                durationSeconds: 4,
                shotType: "Medium Shot",
                cameraAngle: "Eye Level",
                cameraMovement: "Static",
                compositionDescription: "Luna standing at her workbench, soldering a pair of heavy boots.",
                subjectDescription: "A determined teenage girl with messy dark hair and goggles.",
                actionDescription: "Luna solders a copper coil on the side of her leather boot.",
                dialogue: {
                  characterId: "char-luna",
                  text: "If I get the frequency right, we won't need their gravity lifts anymore.",
                  voiceId: "voice-luna",
                  emotion: "hopeful"
                },
                promptText: "Medium shot of young female mechanic, goggles on forehead, soldering glowing sci-fi boot in cluttered workshop, photorealistic, cinematic lighting.",
                productionMethod: "talking-character",
                providerName: "MockAI",
                modelName: "MockImageGen-v2",
                estimatedCostCredits: 1.0
              },
              {
                shotNumber: 2,
                durationSeconds: 3,
                shotType: "Close Up",
                cameraAngle: "Low Angle",
                cameraMovement: "Zoom",
                compositionDescription: "Close up on the boots as they begin to hum and emit blue light.",
                subjectDescription: "Heavy leather boots with copper plates and glowing vacuum tubes.",
                actionDescription: "The boot sparks blue and rises two inches off the workbench.",
                promptText: "Close up on heavy retro-futuristic boot sparking with blue energy on wooden bench, rising slightly, vapor, depth of field.",
                productionMethod: "image-to-video",
                providerName: "MockAI",
                modelName: "MockVideoGen-v2",
                estimatedCostCredits: 4.5
              }
            ]
          }
        ]
      });
    } else {
      output = `Generic mock output responding to: "${prompt.substring(0, 30)}..."`;
    }

    return {
      success: true,
      data: output,
      costCredits: this.trackCost('llm'),
      latencyMs: Date.now() - start,
      providerVersion: this.version
    };
  }

  public async generateImage(request: GenerationRequest): Promise<ProviderResponse<{ imageUrl: string }>> {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 600));

    // Return gorgeous royalty-free Unsplash images matching topics to look beautiful
    let url = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop'; // Colorful art
    const promptLower = request.prompt.toLowerCase();
    if (promptLower.includes('character') || promptLower.includes('girl') || promptLower.includes('luna')) {
      url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'; // Portrait
    } else if (promptLower.includes('workshop') || promptLower.includes('sci-fi')) {
      url = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop'; // Lab/tech
    } else if (promptLower.includes('boot') || promptLower.includes('spark')) {
      url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'; // Red shoe / tech item
    } else if (promptLower.includes('sky') || promptLower.includes('city')) {
      url = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=600&auto=format&fit=crop'; // City skyline
    }

    return {
      success: true,
      data: { imageUrl: url },
      costCredits: this.trackCost('image-generation'),
      latencyMs: Date.now() - start,
      providerVersion: this.version
    };
  }

  public async generateVideo(request: GenerationRequest): Promise<ProviderResponse<{ videoUrl: string }>> {
    const start = Date.now();
    const seconds = request.durationSeconds || 4;

    if (seconds >= 60) {
      console.log(`[Strategy A Chaining] Simulating sequential video chaining for ${seconds} seconds...`);
      const segmentDuration = 8;
      const totalSegments = Math.ceil(seconds / segmentDuration);
      console.log(`[Strategy A] Generating ${totalSegments} segments of ${segmentDuration}s each.`);
      let lastFrameUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop";
      
      for (let s = 1; s <= totalSegments; s++) {
        console.log(`  - Segment ${s}/${totalSegments}: Chaining with last frame reference: ${lastFrameUrl}`);
        // Simulate minor delay per segment build
        await new Promise(resolve => setTimeout(resolve, 50));
        lastFrameUrl = `https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop#segment-${s}`;
      }
      console.log(`[Strategy A] Stitching completed. Stitched video URL generated.`);
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Standard mock videos
    const mockVideos = [
      'https://assets.mixkit.co/videos/preview/mixkit-flying-through-clouds-in-a-blue-sky-41440-large.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-43959-large.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-42065-large.mp4'
    ];
    const videoUrl = mockVideos[Math.floor(Math.random() * mockVideos.length)];

    return {
      success: true,
      data: { videoUrl },
      costCredits: this.trackCost('video-generation', seconds),
      latencyMs: Date.now() - start,
      providerVersion: this.version
    };
  }

  public async generateSpeech(text: string, voiceId: string): Promise<ProviderResponse<{ audioUrl: string; durationSeconds: number }>> {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Standard audio stream
    const chars = text.length;

    return {
      success: true,
      data: { audioUrl, durationSeconds: Math.ceil(chars / 15) },
      costCredits: this.trackCost('text-to-speech', chars),
      latencyMs: Date.now() - start,
      providerVersion: this.version
    };
  }

  public async syncAudioToVideo(videoUrl: string, audioUrl: string): Promise<ProviderResponse<{ syncedVideoUrl: string }>> {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      data: { syncedVideoUrl: videoUrl }, // Mock bypasses actual stitching
      costCredits: this.trackCost('lip-sync', 4),
      latencyMs: Date.now() - start,
      providerVersion: this.version
    };
  }

  public async moderateContent(text: string): Promise<ProviderResponse<{ flagged: boolean; categories: string[] }>> {
    const start = Date.now();
    const flagged = text.toLowerCase().includes('unlawful') || text.toLowerCase().includes('hack');
    return {
      success: true,
      data: { flagged, categories: flagged ? ['harassment', 'policy_violation'] : [] },
      costCredits: this.trackCost('moderation'),
      latencyMs: Date.now() - start,
      providerVersion: this.version
    };
  }
}

// --- Provider Registry for the App Router to Query ---
export class ProviderRegistry {
  public static getPricingList(): ProviderPricing[] {
    return [
      { id: 'p1', providerName: 'fal.ai', modelName: 'Luma-DreamMachine', capability: 'video-generation', costUnit: 'second', costPerUnit: 2.0, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p2', providerName: 'fal.ai', modelName: 'Kling-v1', capability: 'video-generation', costUnit: 'second', costPerUnit: 1.5, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p3', providerName: 'ElevenLabs', modelName: 'TTS-Multilingual-v2', capability: 'text-to-speech', costUnit: 'character', costPerUnit: 0.05, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p4', providerName: 'OpenAI', modelName: 'gpt-4o', capability: 'llm', costUnit: 'token', costPerUnit: 0.01, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p5', providerName: 'MockAI', modelName: 'MockImageGen-v2', capability: 'image-generation', costUnit: 'image', costPerUnit: 0.2, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p6', providerName: 'MockAI', modelName: 'MockVideoGen-v2', capability: 'video-generation', costUnit: 'second', costPerUnit: 1.0, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p7', providerName: 'MockAI', modelName: 'MockLipSync-v2', capability: 'lip-sync', costUnit: 'second', costPerUnit: 0.8, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p8', providerName: 'Google', modelName: 'Veo-2.0-Generate', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.12, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p9', providerName: 'Runway', modelName: 'Runway-Gen3-Alpha', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.20, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p10', providerName: 'Seedance', modelName: 'Seedance-Video-v1', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.10, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p11', providerName: 'Kling AI', modelName: 'Kling-Pro-v3', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.08, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p12', providerName: 'fal.ai', modelName: 'Wan-2.1-Cinematic', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.02, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p13', providerName: 'MiniMax', modelName: 'MiniMax-Video-v2', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.08, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p14', providerName: 'Tencent', modelName: 'HunyuanVideo', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.025, resolutionMultiplier: 1.0, effectiveDate: new Date() },
      { id: 'p15', providerName: 'RunPod', modelName: 'Wan-2.1-SelfHosted', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.001, resolutionMultiplier: 1.0, effectiveDate: new Date() }
    ];
  }

  public static getHealthMetrics(): ProviderHealthMetric[] {
    return [
      { providerName: 'OpenAI', isHealthy: true, latencyMs: 250, failureRate: 0.01, lastChecked: new Date() },
      { providerName: 'fal.ai', isHealthy: true, latencyMs: 900, failureRate: 0.04, lastChecked: new Date() },
      { providerName: 'ElevenLabs', isHealthy: true, latencyMs: 350, failureRate: 0.02, lastChecked: new Date() },
      { providerName: 'MockAI', isHealthy: true, latencyMs: 20, failureRate: 0.00, lastChecked: new Date() }
    ];
  }
}

// ─── fal.ai Video Provider ────────────────────────────────────────────────────

export class FalAiProvider implements IVideoGenerationProvider {
  private apiKey: string;
  private version = 'fal-wan-2.1-cinematic';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FAL_AI_KEY || '';
    if (!this.apiKey) throw new Error('FAL_AI_KEY not set');
  }

  public async generateVideo(request: GenerationRequest): Promise<ProviderResponse<{ videoUrl: string }>> {
    const start = Date.now();
    const duration = request.durationSeconds || 5;

    try {
      // Submit job to fal.ai queue
      const submitRes = await fetch('https://queue.fal.run/fal-ai/wan-v2.1/text-to-video', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          duration: duration <= 5 ? '5s' : '10s',
          aspect_ratio: request.aspectRatio === '9:16' ? '9:16' : '16:9',
          resolution: '720p',
          num_inference_steps: 20,
        }),
      });

      if (!submitRes.ok) {
        const err = await submitRes.text();
        throw new Error(`fal.ai submit failed: ${err}`);
      }

      const { request_id } = await submitRes.json();

      // Poll for completion (max 3 minutes)
      const pollUrl = `https://queue.fal.run/fal-ai/wan-v2.1/requests/${request_id}`;
      for (let attempt = 0; attempt < 36; attempt++) {
        await new Promise(r => setTimeout(r, 5000));
        const pollRes = await fetch(pollUrl, {
          headers: { 'Authorization': `Key ${this.apiKey}` },
        });
        const pollData = await pollRes.json();

        if (pollData.status === 'COMPLETED') {
          const videoUrl = pollData.output?.video?.url || pollData.output?.video_url;
          return {
            success: true,
            data: { videoUrl },
            costCredits: 0.02 * duration,
            latencyMs: Date.now() - start,
            providerVersion: this.version,
          };
        }
        if (pollData.status === 'FAILED') {
          throw new Error(`fal.ai job failed: ${JSON.stringify(pollData.error)}`);
        }
      }

      throw new Error('fal.ai generation timed out after 3 minutes');
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FAL_AI_ERROR', message: err.message, isRetryable: true },
        costCredits: 0,
        latencyMs: Date.now() - start,
        providerVersion: this.version,
      };
    }
  }
}

// ─── ElevenLabs TTS Provider ──────────────────────────────────────────────────

export class ElevenLabsProvider implements ITextToSpeechProvider {
  private apiKey: string;
  private version = 'elevenlabs-v2';
  private defaultVoiceId = '21m00Tcm4TlvDq8ikWAM'; // "Rachel" — professional, clear

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
    if (!this.apiKey) throw new Error('ELEVENLABS_API_KEY not set');
  }

  public async generateSpeech(text: string, voiceId: string): Promise<ProviderResponse<{ audioUrl: string; durationSeconds: number }>> {
    const start = Date.now();
    // ElevenLabs voice IDs are UUIDs; fall back to default if we're passed a custom format
    const resolvedVoiceId = voiceId?.match(/^[0-9a-f]{20,}$/) ? voiceId : this.defaultVoiceId;

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`ElevenLabs TTS failed: ${errText}`);
      }

      // ElevenLabs returns audio bytes directly — for Cloud Run, we'd upload to GCS
      // For now, return a data URL from the buffer (works for short clips)
      const audioBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(audioBuffer).toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${base64}`;
      const durationSeconds = Math.ceil(text.length / 15); // ~15 chars/sec estimate

      return {
        success: true,
        data: { audioUrl, durationSeconds },
        costCredits: 0.05 * text.length,
        latencyMs: Date.now() - start,
        providerVersion: this.version,
      };
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'ELEVENLABS_ERROR', message: err.message, isRetryable: true },
        costCredits: 0,
        latencyMs: Date.now() - start,
        providerVersion: this.version,
      };
    }
  }
}

// ─── Provider Factory ─────────────────────────────────────────────────────────

export class ProviderFactory {
  /**
   * Returns fal.ai if FAL_AI_KEY is set, otherwise falls back to MockProvider.
   */
  public static getVideoProvider(): IVideoGenerationProvider {
    if (process.env.FAL_AI_KEY) {
      try { return new FalAiProvider(); } catch { /* fall through */ }
    }
    return new MockProvider();
  }

  /**
   * Returns ElevenLabs if ELEVENLABS_API_KEY is set, otherwise falls back to MockProvider.
   */
  public static getSpeechProvider(): ITextToSpeechProvider {
    if (process.env.ELEVENLABS_API_KEY) {
      try { return new ElevenLabsProvider(); } catch { /* fall through */ }
    }
    return new MockProvider();
  }

  /**
   * Returns the full MockProvider for operations not yet covered by live providers.
   */
  public static getMockProvider(): MockProvider {
    return new MockProvider();
  }

  public static isLive(): boolean {
    return process.env.PROVIDER_MODE === 'live' && !!process.env.FAL_AI_KEY;
  }
}

