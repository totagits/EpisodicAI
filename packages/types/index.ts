// --- Core User & Workspace Types ---

export type WorkspaceRole =
  | 'Workspace Owner'
  | 'Workspace Administrator'
  | 'Executive Producer'
  | 'Showrunner'
  | 'Writer'
  | 'Story Editor'
  | 'Director'
  | 'Visual Artist'
  | 'Voice Director'
  | 'Video Editor'
  | 'Quality Reviewer'
  | 'Publisher'
  | 'Analyst'
  | 'Billing Manager'
  | 'Viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  studioName: string;
  teamSize: number;
  timeZone: string;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  createdAt: Date;
}

export interface CreditAccount {
  id: string;
  workspaceId: string;
  balance: number; // in credits
  reserved: number; // currently locked credits for active production
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditLedgerEntry {
  id: string;
  accountId: string;
  type: 'purchase' | 'grant' | 'reservation' | 'consumption' | 'release' | 'refund' | 'adjustment';
  amount: number;
  description: string;
  referenceId?: string; // Job ID, Session ID, etc.
  createdAt: Date;
}

// --- Series Bible & Canon Engine Types ---

export interface Show {
  id: string;
  workspaceId: string;
  title: string;
  tagline?: string;
  premise: string;
  fullConcept: string;
  genre: string;
  subgenres: string[];
  targetAudience: string;
  ageRating: string;
  durationMinutes: number;
  seasonLength: number;
  releaseCadence: string; // e.g. weekly, biweekly
  visualFormat: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  influences: string[];
  avoidTopics: string[];
  automationLevel: 'Copilot' | 'Supervised Autopilot' | 'Full Autopilot';
  budgetPerEpisode: number;
  monthlyBudget: number;
  qualityTier: 'DRAFT' | 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'HERO';
  createdAt: Date;
  updatedAt: Date;
}

export interface SeriesBible {
  id: string;
  showId: string;
  version: number;
  summary: string;
  worldRules: string[];
  themes: string[];
  forbiddenContradictions: string[];
  seasonOpportunities: string[];
  visualIdentityNotes: string;
  voiceIdentityNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CanonStatus = 'draft' | 'proposed' | 'approved' | 'retconned' | 'archived';

export interface CanonFact {
  id: string;
  showId: string;
  subject: string; // e.g., "John Doe"
  predicate: string; // e.g., "isMarriedTo"
  object: string; // e.g., "Jane Smith" or literal values
  status: CanonStatus;
  effectiveStoryDate: string; // e.g., "Season 1, Episode 1, Day 2"
  endDate?: string;
  isPrivate: boolean;
  knownByCharacters: string[]; // character IDs
  sourceEpisodeId?: string;
  sourceSceneId?: string;
  confidence: number; // 0.0 to 1.0
  version: number;
  createdBy: string; // user ID
  approvedBy?: string; // user ID
  retconId?: string;
}

export interface CanonEvent {
  id: string;
  showId: string;
  episodeId: string;
  type: string; // e.g., "CharacterDeath", "ItemLost", "SecretRevealed"
  description: string;
  timestamp: Date;
  impactedFacts: string[]; // CanonFact IDs
}

export interface CanonRetcon {
  id: string;
  showId: string;
  originalFactId: string;
  replacementFactId?: string;
  reason: string;
  approvedBy: string;
  createdAt: Date;
}

// --- Character, Location, Object Registries ---

export interface Character {
  id: string;
  showId: string;
  name: string;
  aliases: string[];
  role: 'primary' | 'supporting' | 'antagonist' | 'background';
  age: number;
  biography: string;
  personalityTraits: string[];
  appearance: {
    height: string;
    build: string;
    hair: string;
    eyes: string;
    clothingStyle: string;
    mannerisms: string[];
  };
  voiceId?: string;
  referenceImageUrls: string[];
  lockedTraits: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Relationship {
  id: string;
  showId: string;
  characterAId: string;
  characterBId: string;
  type: string; // e.g., "spouse", "rival", "parent"
  description: string;
  dynamicScore: number; // -10 (extremely hostile) to +10 (extremely cooperative)
}

export interface Location {
  id: string;
  showId: string;
  name: string;
  description: string;
  geography: string;
  architecture: string;
  referenceImageUrls: string[];
  floorPlanUrl?: string;
  storySignificance: string;
}

export interface StoryObject {
  id: string;
  showId: string;
  name: string;
  description: string;
  ownerId?: string; // Character ID
  currentLocationId?: string; // Location ID
  condition: string; // e.g. pristine, damaged, destroyed
  referenceImageUrls: string[];
}

// --- Script & Screenplay Types ---

export interface Season {
  id: string;
  showId: string;
  number: number;
  status: 'Concept' | 'Drafting' | 'Approved' | 'In Production' | 'Releasing' | 'Completed' | 'Renewed' | 'Archived';
  seasonQuestion: string;
  centralConflict: string;
  summary: string;
  createdAt: Date;
}

export type EpisodeStatus =
  | 'Idea'
  | 'Planned'
  | 'Outlined'
  | 'Script Draft'
  | 'Continuity Review'
  | 'Script Approved'
  | 'Storyboard'
  | 'Asset Preparation'
  | 'Generating'
  | 'Editing'
  | 'Quality Review'
  | 'Final Approval'
  | 'Scheduled'
  | 'Published'
  | 'Failed'
  | 'Paused';

export interface Episode {
  id: string;
  seasonId: string;
  number: number;
  title: string;
  status: EpisodeStatus;
  objectives: string[];
  summary: string;
  budgetCredits: number;
  actualCostCredits: number;
  publishedUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Script {
  id: string;
  episodeId: string;
  version: number;
  content: string; // Fully formatted Fountain/Markdown Script
  scenes: Scene[];
  createdAt: Date;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  locationId: string;
  timeOfDay: 'day' | 'night' | 'dusk' | 'dawn';
  description: string;
  beats: string[];
  shots: Shot[];
}

export type ProductionMethod =
  | 'text-to-video'
  | 'image-to-video'
  | 'reference-to-video'
  | 'talking-character'
  | 'lip-sync'
  | 'parallax-still'
  | 'motion-graphics'
  | 'b-roll'
  | 'stock-footage';

export interface Shot {
  id: string;
  sceneId: string;
  shotNumber: number;
  durationSeconds: number;
  shotType: 'Extreme Close Up' | 'Close Up' | 'Medium Shot' | 'Full Shot' | 'Wide Shot' | 'Establishing Shot';
  cameraAngle: 'Eye Level' | 'Low Angle' | 'High Angle' | 'Bird Eye' | 'Dutch Angle';
  cameraMovement: 'Static' | 'Pan' | 'Tilt' | 'Zoom' | 'Tracking' | 'Crane' | 'Handheld';
  compositionDescription: string;
  subjectDescription: string;
  actionDescription: string;
  dialogue?: {
    characterId: string;
    text: string;
    voiceId: string;
    emotion: string;
  };
  promptText: string;
  productionMethod: ProductionMethod;
  providerName: string;
  modelName: string;
  estimatedCostCredits: number;
  actualCostCredits?: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  mediaUrl?: string;
  internalRequest?: string;
}

export interface StoryboardFrame {
  id: string;
  shotId: string;
  imageUrl: string;
  provider: string;
  costCredits: number;
  feedbackComments?: string;
  isApproved: boolean;
}

// --- Provider & Pricing Engine Types ---

export type ProviderCapability =
  | 'llm'
  | 'image-generation'
  | 'video-generation'
  | 'image-to-video'
  | 'lip-sync'
  | 'text-to-speech'
  | 'speech-to-speech'
  | 'music'
  | 'sound-effects'
  | 'upscale'
  | 'moderation';

export interface ProviderPricing {
  id: string;
  providerName: string;
  modelName: string;
  capability: ProviderCapability;
  costUnit: 'second' | 'image' | 'token' | 'character';
  costPerUnit: number; // in credits
  resolutionMultiplier: number;
  effectiveDate: Date;
  expirationDate?: Date;
}

export interface ProviderHealthMetric {
  providerName: string;
  isHealthy: boolean;
  latencyMs: number;
  failureRate: number; // 0.0 to 1.0
  lastChecked: Date;
}

// --- Quality Control & Jobs Types ---

export interface QualityReport {
  id: string;
  targetId: string; // Episode, Script, or Shot ID
  targetType: 'script' | 'shot' | 'episode';
  overallScore: number; // 0 to 100
  findings: QualityFinding[];
  createdAt: Date;
}

export interface QualityFinding {
  category: 'script_continuity' | 'visual_consistency' | 'audio_clipping' | 'technical_format' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timecode?: number; // seconds into clip/episode
  description: string;
  suggestedFix?: string;
}

export interface GenerationJob {
  id: string;
  workspaceId: string;
  episodeId: string;
  type: 'bible' | 'script' | 'storyboard' | 'assets' | 'rendering' | 'publish';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number; // 0 to 100
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicationJob {
  id: string;
  episodeId: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'direct-download';
  status: 'pending' | 'running' | 'success' | 'failed';
  publishedUrl?: string;
  platformPostId?: string;
  errorDetails?: string;
  scheduledTime?: Date;
  publishedTime?: Date;
}

export interface AudienceSignal {
  id: string;
  episodeId: string;
  views: number;
  watchTimeMinutes: number;
  retentionFirst30s: number; // 0.0 to 1.0
  likes: number;
  shares: number;
  commentsSentimentScore: number; // -1.0 to 1.0
  gainedSubscribers: number;
  collectedAt: Date;
}

export interface StoryThread {
  id: string;
  showId: string;
  name: string;
  type: string;
  characters: string[];
  introductionEpisode: string;
  status: 'active' | 'resolved' | 'abandoned';
  importance: 'low' | 'medium' | 'high';
  plannedEscalation?: string;
  requiredPayoff?: string;
  targetPayoffEpisode?: string;
  resolution?: string;
}

