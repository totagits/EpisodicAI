'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  Film, 
  Cpu, 
  Sliders, 
  ShieldCheck, 
  Coins, 
  Play, 
  RotateCw, 
  History, 
  LineChart, 
  Users, 
  MapPin, 
  FileText,
  AlertTriangle,
  LogOut,
  FolderOpen,
  ArrowLeft,
  DollarSign,
  Workflow,
  Plus,
  Edit3,
  Check,
  X,
  BookOpen,
  Layers,
  Eye,
  ChevronDown,
  ChevronUp,
  Zap,
  Globe,
  Target,
  Mic,
  Camera,
  Settings,
  RefreshCw,
  Server,
  Lock,
  ExternalLink
} from 'lucide-react';
import TimelineEditor from '@/components/TimelineEditor';
import StoryGraph from '@/components/StoryGraph';
import { Shot } from '@episodic-ai/types';
import { CostAwareRouter } from '@episodic-ai/pricing-engine';
import { useAuth } from '@/lib/auth-context';

const PROVIDER_REGISTRY = [
  { id: 'p1', providerName: 'fal.ai', modelName: 'Luma-DreamMachine', capability: 'video-generation', costUnit: 'second', costPerUnit: 2.0, qualityTier: 'HIGH', maxDuration: 120, notes: 'Requires FAL_AI_KEY env var' },
  { id: 'p2', providerName: 'fal.ai', modelName: 'Kling-v1', capability: 'video-generation', costUnit: 'second', costPerUnit: 1.5, qualityTier: 'HIGH', maxDuration: 300, notes: 'Requires FAL_AI_KEY env var' },
  { id: 'p3', providerName: 'ElevenLabs', modelName: 'TTS-Multilingual-v2', capability: 'text-to-speech', costUnit: 'character', costPerUnit: 0.05, qualityTier: 'HIGH', maxDuration: null, notes: 'Requires ELEVENLABS_API_KEY env var' },
  { id: 'p4', providerName: 'OpenAI', modelName: 'gpt-4o', capability: 'llm', costUnit: 'token', costPerUnit: 0.01, qualityTier: 'HIGH', maxDuration: null, notes: 'Requires OPENAI_API_KEY env var' },
  { id: 'p5', providerName: 'MockAI', modelName: 'MockImageGen-v2', capability: 'image-generation', costUnit: 'image', costPerUnit: 0.2, qualityTier: 'DEMO', maxDuration: null, notes: 'Built-in simulation. No API key required.' },
  { id: 'p6', providerName: 'MockAI', modelName: 'MockVideoGen-v2', capability: 'video-generation', costUnit: 'second', costPerUnit: 1.0, qualityTier: 'DEMO', maxDuration: 30, notes: 'Built-in simulation. No API key required. Returns sample video.' },
  { id: 'p7', providerName: 'MockAI', modelName: 'MockLipSync-v2', capability: 'lip-sync', costUnit: 'second', costPerUnit: 0.8, qualityTier: 'DEMO', maxDuration: 30, notes: 'Built-in simulation. No API key required.' },
  { id: 'p8', providerName: 'Google', modelName: 'Veo-2.0-Generate', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.12, qualityTier: 'ULTRA', maxDuration: 60, notes: 'Requires GOOGLE_AI_STUDIO_KEY env var. Waitlist access required.' },
  { id: 'p9', providerName: 'Runway', modelName: 'Runway-Gen3-Alpha', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.20, qualityTier: 'ULTRA', maxDuration: 60, notes: 'Requires RUNWAY_API_KEY env var.' },
  { id: 'p10', providerName: 'Seedance', modelName: 'Seedance-Video-v1', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.10, qualityTier: 'HIGH', maxDuration: 120, notes: 'Requires SEEDANCE_API_KEY env var.' },
  { id: 'p11', providerName: 'Kling AI', modelName: 'Kling-Pro-v3', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.08, qualityTier: 'HIGH', maxDuration: 300, notes: 'Requires KLING_API_KEY env var. Best for continuation/extend workflows.' },
  { id: 'p12', providerName: 'fal.ai', modelName: 'Wan-2.1-Cinematic', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.02, qualityTier: 'MEDIUM', maxDuration: 600, notes: 'Requires FAL_AI_KEY. Excellent for bulk B-roll at low cost.' },
  { id: 'p13', providerName: 'MiniMax', modelName: 'MiniMax-Video-v2', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.08, qualityTier: 'HIGH', maxDuration: 300, notes: 'Requires MINIMAX_API_KEY. Excellent for action/character consistency.' },
  { id: 'p14', providerName: 'Tencent', modelName: 'HunyuanVideo', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.025, qualityTier: 'MEDIUM', maxDuration: 600, notes: 'Requires TENCENT_CLOUD_KEY via fal.ai. Good for long-form B-roll.' },
  { id: 'p15', providerName: 'RunPod', modelName: 'Wan-2.1-SelfHosted', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.001, qualityTier: 'MEDIUM', maxDuration: 3600, notes: 'Self-hosted on RunPod GPU cluster. Cheapest option for 1–5 min video. Requires RunPod setup.' },
];

const seedPricing = PROVIDER_REGISTRY.map(p => ({
  id: p.id, providerName: p.providerName, modelName: p.modelName,
  capability: p.capability, costUnit: p.costUnit, costPerUnit: p.costPerUnit
}));

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('run.app')) {
      if (window.location.hostname.includes('episodic-ai-web')) {
        return window.location.origin.replace('episodic-ai-web', 'episodic-ai-api');
      }
      return 'https://episodic-ai-api-26273727080.us-central1.run.app';
    }
  }
  return 'http://localhost:4000';
};

const numToWord = (n: number) => {
  const words = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen'];
  return words[n] || n.toString();
};

// --- Editable Field Component ---
function EditableField({ value, onSave, multiline = false, className = '' }: { value: string; onSave: (v: string) => void; multiline?: boolean; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<any>(null);

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  if (!editing) {
    return (
      <span className={`group relative inline-block ${className}`} onClick={() => { setDraft(value); setEditing(true); }}>
        {value}
        <Edit3 className="w-3 h-3 text-brand-violet opacity-0 group-hover:opacity-100 inline ml-1.5 transition cursor-pointer" />
      </span>
    );
  }

  return (
    <span className="relative inline-block w-full">
      {multiline ? (
        <textarea
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="w-full bg-brand-bg border border-brand-violet/60 rounded p-2 text-xs text-white focus:outline-none focus:border-brand-violet resize-none min-h-[80px]"
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="w-full bg-brand-bg border border-brand-violet/60 rounded p-1.5 text-xs text-white focus:outline-none focus:border-brand-violet"
        />
      )}
      <span className="flex gap-1.5 mt-1">
        <button onClick={() => { onSave(draft); setEditing(false); }} className="px-2 py-1 rounded bg-brand-violet text-white text-[10px] font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Save</button>
        <button onClick={() => setEditing(false)} className="px-2 py-1 rounded bg-brand-border text-gray-300 text-[10px] font-bold flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
      </span>
    </span>
  );
}

// --- Collapsible Section ---
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, badge }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
      <button onClick={() => setOpen((v: boolean) => !v)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-brand-border/20 transition text-left">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-brand-cyan" />
          <span className="text-sm font-bold text-white">{title}</span>
          {badge && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-violet/20 border border-brand-violet/30 text-brand-violet">{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-brand-border/50">{children}</div>}
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getAuthHeaders, user } = useAuth();

  const isDemoMode = !user || searchParams.get('demo') === 'true';

  // Authenticated fetch wrapper — auto-injects auth header or demo-mode header
  const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const authHeaders = isDemoMode
      ? { 'X-Demo-Mode': 'true' }
      : await getAuthHeaders();
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {}),
      },
    });
  };

  const showId = searchParams.get('showId') || 'shw-default';
  const seasonId = searchParams.get('seasonId') || 'sea-default';
  const episodeId = searchParams.get('episodeId') || 'eps-default';
  const [activeTab, setActiveTab] = useState<'overview' | 'bible' | 'timeline' | 'graph' | 'cost' | 'admin'>('overview');

  const [show, setShow] = useState<any>(null);
  const [bible, setBible] = useState<any>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [qualityReport, setQualityReport] = useState<any>(null);
  const [episode, setEpisode] = useState<any>(null);
  const [script, setScript] = useState<any>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [creditBalance, setCreditBalance] = useState(250.0);
  const [creditReserved, setCreditReserved] = useState(0.0);
  const [ledger, setLedger] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState('50');
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [newPlatform, setNewPlatform] = useState<'youtube' | 'tiktok' | 'instagram'>('youtube');
  const [newHandle, setNewHandle] = useState('');
  const [newMonetize, setNewMonetize] = useState(true);
  const [connectingSocial, setConnectingSocial] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDesc, setPublishDesc] = useState('');
  const [publishMonetize, setPublishMonetize] = useState(true);
  const [selectedPublishPlatforms, setSelectedPublishPlatforms] = useState<string[]>([]);
  const [publishProgress, setPublishProgress] = useState<{
    status: 'idle' | 'running' | 'completed' | 'failed';
    step: string;
    progress: number;
    publications?: any[];
  }>({ status: 'idle', step: '', progress: 0 });

  // Bible editing state
  const [editedBible, setEditedBible] = useState<any>(null);
  const [bibleLoading, setBibleLoading] = useState(false);

  const resolveActiveEpisode = async () => {
    if (showId && episodeId === 'eps-default') {
      try {
        const seasonsRes = await apiFetch(`${getApiUrl()}/api/seasons/${showId}`);
        if (seasonsRes.ok) {
          const seasons = await seasonsRes.json();
          if (seasons.length > 0) {
            const firstSeason = seasons[0];
            const epsRes = await apiFetch(`${getApiUrl()}/api/episodes/${firstSeason.id}`);
            if (epsRes.ok) {
              const eps = await epsRes.json();
              if (eps.length > 0) {
                router.replace(`/dashboard?showId=${showId}&seasonId=${firstSeason.id}&episodeId=${eps[0].id}${searchParams.get('userEmail') ? `&userEmail=${encodeURIComponent(searchParams.get('userEmail')!)}` : ''}`);
                return;
              }
            }
          } else {
            const createRes = await apiFetch(`${getApiUrl()}/api/seasons`, {
              method: 'POST',
              body: JSON.stringify({ showId, seasonNumber: 1 })
            });
            if (createRes.ok) {
              const data = await createRes.json();
              router.replace(`/dashboard?showId=${showId}&seasonId=${data.season.id}&episodeId=${data.episodes[0].id}${searchParams.get('userEmail') ? `&userEmail=${encodeURIComponent(searchParams.get('userEmail')!)}` : ''}`);
              return;
            }
          }
        }
      } catch (e) { console.error('Error resolving episode', e); }
    }
  };

  useEffect(() => {
    if (showId && episodeId === 'eps-default') {
      resolveActiveEpisode();
    } else {
      fetchShowData();
      fetchBillingData();
      fetchProductionTimeline();
      fetchSocialAccounts();
    }
    const userEmail = searchParams.get('userEmail');
    if (userEmail) autoConnectGoogleYouTube(userEmail);
  }, [showId, episodeId]);

  useEffect(() => {
    if (bible && !editedBible) setEditedBible(bible);
  }, [bible]);

  // Check for Stripe payment redirect parameters
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      const credits = searchParams.get('credits') || '0';
      alert(`🎉 Payment successful! Added ${credits} credits to your workspace.`);
      router.replace('/dashboard');
      fetchBillingData();
    } else if (payment === 'cancelled') {
      alert('❌ Payment cancelled. No charges were made.');
      router.replace('/dashboard');
    }
  }, [searchParams]);

  const fetchShowData = async () => {
    try {
      const response = await apiFetch(`${getApiUrl()}/api/shows/${showId}`);
      if (response.ok) {
        const data = await response.json();
        setShow(data.show);
        setBible(data.bible);
        setCharacters(data.characters || []);
        setLocations(data.locations || []);
      }
    } catch (e) {
      setShow({ id: 'shw-default', title: "Gravity's Belief", premise: "A young mechanic discovers boots that control vertical gravity vectors.", genre: "Science Fiction", ageRating: "PG-13", automationLevel: "Copilot", budgetPerEpisode: 50.0, qualityTier: "STANDARD" });
      setBible({ summary: "In a world where gravity is directional based on belief, a young mechanic designs boots that allow her to walk on walls, uncovering a corporate conspiracy.", worldRules: [{ id: 'law-001', category: 'Physics', rule: "Gravity vectors are determined by spiritual alignment.", implications: ["Walking on the ceiling requires mental concentration."], visual_cue: "Characters in focus when aligned" }], themes: [{ theme: 'Identity Under Pressure', central_question: 'Who does a person become when the thing that defined them is taken away?', how_explored: 'The protagonist must confront a moment where their self-concept shatters.', season_escalation: 'S1: Crisis introduced. S2: False identity constructed. S3: True self found.' }], character_profiles: [{ name: 'Protagonist Luna', role: 'Primary Protagonist', archetype: 'Reluctant Catalyst', age_range: '17-19', core_wound: 'Left her family to pursue mechanics; never went back.', core_desire: 'Recognition that her existence matters.', voice_profile: 'Terse under stress; unexpectedly lyrical when emotionally safe.', visual_signature: 'Always has grease on her hands.', story_function: 'Forces the audience to ask what they would sacrifice.' }], forbiddenContradictions: ["Characters cannot change gravity direction instantly without a belief-shift."], visualIdentityNotes: "Deep purples, electric blues, neon light trails.", voiceIdentityNotes: "Cinematic, reverb-heavy dialogue.", logline: "One girl's boots could rewrite gravity — if she can survive the people who want to stop her.", tone_spectrum: "Grounded Techno-Thriller with moments of awe", audience_promise: "Every detail planted in Episode 1 pays off in Season 3.", showrunner_intent: "The goal is to make a show viewers rewatch after the finale." });
      setCharacters([{ id: 'char-luna', name: 'Protagonist Luna', role: 'primary', age: 17, biography: 'Slum mechanic who built the gravity boots.' }]);
      setLocations([{ id: 'loc-workshop', name: "Luna's Workshop", description: 'steampunk industrial shop' }]);
    }
  };

  const fetchBillingData = async () => {
    try {
      const response = await apiFetch(`${getApiUrl()}/api/billing/ledger`);
      if (response.ok) {
        const data = await response.json();
        setCreditBalance(data.account.balance);
        setCreditReserved(data.account.reserved);
        setLedger(data.ledger || []);
      }
    } catch (e) {
      setLedger([{ id: 'led-1', type: 'grant', amount: 250.0, description: 'Initial workspace credits grant', createdAt: new Date() }]);
    }
  };

  const handleRegenerateBible = async () => {
    if (!show) return;
    setBibleLoading(true);
    try {
      const response = await apiFetch(`${getApiUrl()}/api/shows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: show.title, premise: show.premise, fullConcept: show.premise, genre: show.genre, targetAudience: show.targetAudience, ageRating: show.ageRating })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.bible) { setBible(data.bible); setEditedBible(data.bible); }
      }
    } catch (e) {
      console.error('Failed to regenerate bible:', e);
    } finally {
      setBibleLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`${getApiUrl()}/api/episodes/${episodeId}/script`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setScript(data.script);
      setQualityReport(data.report);
      fetchProductionTimeline();
    } catch (e) {
      setScript({ content: "FADE IN:\n\nINT. WORKSPACE — DAY\n\nThe space is organized chaos. Tools arranged with obsessive precision.\n\nPROTAGONIST\n(muttering)\nAlmost there. Just need to align these core channels.\n\nA door opens. The COUNTERPART enters.\n\nCOUNTERPART\nWe don't have much time. They've moved the patrol.\n\nFADE TO BLACK." });
      setShots([
        { id: 'sht-mock1', sceneId: 'sce-mock', shotNumber: 1, durationSeconds: 5, shotType: 'Close Up', cameraAngle: 'Eye Level', cameraMovement: 'Static', compositionDescription: 'Extreme close on hands working on a device.', subjectDescription: 'Protagonist hands, skilled precision.', actionDescription: 'Final precise connection made. Device hums.', promptText: 'Cinematic close-up of skilled hands working on intricate technical device, warm tungsten light, shallow depth of field, film grain', productionMethod: 'image-to-video', providerName: 'Seedance', modelName: 'Seedance-Video-v1', estimatedCostCredits: 0.5, status: 'pending', internalRequest: 'Generate a five-second 16:9 character-consistent dramatic shot at medium quality under $1.20.' },
        { id: 'sht-mock2', sceneId: 'sce-mock', shotNumber: 2, durationSeconds: 4, shotType: 'Medium Shot', cameraAngle: 'Eye Level', cameraMovement: 'Zoom', compositionDescription: 'Protagonist steps back, watching device hum.', subjectDescription: 'Protagonist, 20s, determined.', actionDescription: 'Steps back, allows fractional satisfaction.', dialogue: { characterId: 'char-protagonist', text: 'Almost there. Just need to align these core channels.', voiceId: 'voice-protagonist', emotion: 'focused' }, promptText: 'Medium cinematic shot of person stepping back in detailed workshop, warm natural light, photorealistic', productionMethod: 'talking-character', providerName: 'MockAI', modelName: 'MockLipSync-v2', estimatedCostCredits: 3.2, status: 'pending' },
        { id: 'sht-mock3', sceneId: 'sce-mock', shotNumber: 3, durationSeconds: 3, shotType: 'Wide Shot', cameraAngle: 'High Angle', cameraMovement: 'Static', compositionDescription: "Bird's eye of entire workspace — reveals scale and isolation.", subjectDescription: 'Workspace with protagonist.', actionDescription: 'Door opens. Counterpart enters. Energy shifts.', promptText: 'Overhead cinematic shot of cluttered technical workshop, person working, second figure entering through door, dramatic cinematic lighting', productionMethod: 'image-to-video', providerName: 'Kling AI', modelName: 'Kling-Pro-v3', estimatedCostCredits: 0.24, status: 'pending', internalRequest: 'Generate a three-second 16:9 character-consistent dramatic shot at medium quality under $1.20.' },
        { id: 'sht-mock4', sceneId: 'sce-mock', shotNumber: 4, durationSeconds: 4, shotType: 'Medium Shot', cameraAngle: 'Low Angle', cameraMovement: 'Static', compositionDescription: 'Low angle on counterpart in doorway — slightly imposing even as ally.', subjectDescription: 'Counterpart, 20s, controlled.', actionDescription: 'Closes door without looking. Eyes on protagonist.', dialogue: { characterId: 'char-counterpart', text: "We don't have much time. They've moved the patrol rotation forward.", voiceId: 'voice-counterpart', emotion: 'controlled urgency' }, promptText: 'Low angle medium shot of person in doorway, conveying quiet urgency, cool backlight from exterior, cinematic depth of field', productionMethod: 'talking-character', providerName: 'MockAI', modelName: 'MockLipSync-v2', estimatedCostCredits: 3.2, status: 'pending' },
        { id: 'sht-mock5', sceneId: 'sce-mock', shotNumber: 5, durationSeconds: 6, shotType: 'Close Up', cameraAngle: 'Eye Level', cameraMovement: 'Tracking', compositionDescription: "Close on protagonist's face — we watch them decide.", subjectDescription: 'Protagonist face, moment of realization.', actionDescription: 'Holds device. Looks at counterpart. Makes the decision.', dialogue: { characterId: 'char-protagonist', text: "That's when they would have seen it.", voiceId: 'voice-protagonist', emotion: 'realization' }, promptText: 'Extreme close-up of person face in moment of realization, warm light, slight motion blur from camera push, cinematic film look', productionMethod: 'talking-character', providerName: 'MockAI', modelName: 'MockLipSync-v2', estimatedCostCredits: 4.8, status: 'pending' },
      ]);
      setQualityReport({ overallScore: 97, findings: [{ category: 'script_continuity', severity: 'low', description: 'Active High-Priority story thread "Institutional Surveillance" is not directly referenced — implied only.', suggestedFix: 'Consider adding a single visual reference to surveillance equipment in the workspace environment dressing.' }] });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductionTimeline = async () => {
    try {
      const response = await apiFetch(`${getApiUrl()}/api/episodes/${episodeId}/production`);
      if (response.ok) {
        const data = await response.json();
        setShots(data.shots || []);
        if (data.qualityReport) setQualityReport(data.qualityReport);
        if (data.script) setScript(data.script);
        if (data.episode) setEpisode(data.episode);
      }
    } catch (e) {
      setEpisode({ id: episodeId, title: "S1E01 — Gravity Zero", number: 1, status: 'Idea', summary: 'We meet our protagonist living in the complicated equilibrium of the world.' });
    }
  };

  const handleUpdateShot = (id: string, updates: Partial<Shot>) => {
    setShots(prev => prev.map(sh => {
      if (sh.id !== id) return sh;
      const mergedShot = { ...sh, ...updates };

      if (mergedShot.productionMethod === 'talking-character') {
        mergedShot.providerName = 'MockAI';
        mergedShot.modelName = 'MockLipSync-v2';
        mergedShot.estimatedCostCredits = mergedShot.durationSeconds * 0.8;
        mergedShot.internalRequest = undefined;
      } else {
        const durSecs = mergedShot.durationSeconds || 8;
        const aspect = show?.aspectRatio || '16:9';
        const qTier = show?.qualityTier || 'STANDARD';
        const qLabel = (qTier === 'PREMIUM' || qTier === 'HERO') ? 'high' : 'medium';
        const internalRequest = `Generate an ${numToWord(durSecs)}-second ${aspect} character-consistent dramatic shot at ${qLabel} quality under $1.20.`;
        try {
          const routeResult = CostAwareRouter.selectRouteForInternalRequest(internalRequest, seedPricing as any, [
            { providerName: 'Google', isHealthy: true, latencyMs: 300, failureRate: 0.01, lastChecked: new Date() },
            { providerName: 'Runway', isHealthy: true, latencyMs: 400, failureRate: 0.02, lastChecked: new Date() },
            { providerName: 'Seedance', isHealthy: true, latencyMs: 200, failureRate: 0.01, lastChecked: new Date() },
            { providerName: 'Kling AI', isHealthy: true, latencyMs: 250, failureRate: 0.01, lastChecked: new Date() },
            { providerName: 'fal.ai', isHealthy: true, latencyMs: 600, failureRate: 0.03, lastChecked: new Date() },
            { providerName: 'MockAI', isHealthy: true, latencyMs: 10, failureRate: 0.00, lastChecked: new Date() }
          ]);
          mergedShot.providerName = routeResult.selectedPricing.providerName;
          mergedShot.modelName = routeResult.selectedPricing.modelName;
          mergedShot.estimatedCostCredits = routeResult.estimatedCostCredits;
          mergedShot.internalRequest = internalRequest;
        } catch (e) { console.error(e); }
      }

      fetch(`${getApiUrl()}/api/shots/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationSeconds: mergedShot.durationSeconds, productionMethod: mergedShot.productionMethod, promptText: mergedShot.promptText, providerName: mergedShot.providerName, modelName: mergedShot.modelName, estimatedCostCredits: mergedShot.estimatedCostCredits, internalRequest: mergedShot.internalRequest })
      }).catch(e => console.error("Failed to sync shot updates", e));

      return mergedShot;
    }));
  };

  const handleRegenerateShot = (shot: Shot) => {
    alert(`Re-queuing Shot ${shot.shotNumber} for generation via ${shot.providerName} → ${shot.modelName}\n\nNote: Live API generation requires provider API keys configured in environment variables.`);
  };

  const handleTriggerRender = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`${getApiUrl()}/api/episodes/${episodeId}/render`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setJobStatus({ progress: 10, status: 'running' });
        pollJobStatus(data.jobId);
      } else {
        alert(data.error || 'Failed to trigger render');
      }
    } catch (e) {
      // Simulate rendering with visual demo
      let prog = 10;
      const interval = setInterval(() => {
        prog += Math.floor(Math.random() * 20) + 10;
        if (prog >= 100) {
          clearInterval(interval);
          setJobStatus({ progress: 100, status: 'completed' });
          setCreditBalance(prev => prev - 5.5);
          const DEMO_VIDEOS = [
            'https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-43959-large.mp4',
            'https://assets.mixkit.co/videos/preview/mixkit-flying-through-clouds-in-a-blue-sky-41440-large.mp4',
            'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-42065-large.mp4',
          ];
          setShots(prev => prev.map((sh, i) => ({ ...sh, status: 'completed', mediaUrl: DEMO_VIDEOS[i % DEMO_VIDEOS.length] })));
          fetchBillingData();
        } else {
          setJobStatus({ progress: Math.min(prog, 95), status: 'running' });
        }
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const pollJobStatus = (jobId: string) => {
    const timer = setInterval(async () => {
      try {
        const response = await apiFetch(`${getApiUrl()}/api/jobs/${jobId}`);
        const data = await response.json();
        setJobStatus(data);
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(timer);
          fetchBillingData();
          fetchProductionTimeline();
        }
      } catch (e) { clearInterval(timer); }
    }, 1500);
  };

  const fetchSocialAccounts = async () => {
    try {
      const response = await apiFetch(`${getApiUrl()}/api/social-accounts`);
      if (response.ok) { const data = await response.json(); setSocialAccounts(data); }
    } catch (e) { console.error("Failed to fetch social accounts:", e); }
  };

  const autoConnectGoogleYouTube = async (email: string) => {
    try {
      const response = await apiFetch(`${getApiUrl()}/api/social-accounts`);
      if (response.ok) {
        const accounts = await response.json();
        const hasYouTube = accounts.some((a: any) => a.platform === 'youtube');
        if (!hasYouTube) {
          const defaultHandle = email.toLowerCase() === 'rtalk4348@gmail.com'
            ? '@REALTALK-xi4vs'
            : `@${email.split('@')[0]}`;
          await apiFetch(`${getApiUrl()}/api/social-accounts`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform: 'youtube', handle: defaultHandle, monetizationEnabled: true })
          });
          fetchSocialAccounts();
        }
      }
    } catch (e) { console.error("Auto-connect YouTube failed:", e); }
  };

  const handleConnectSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle) return;
    setConnectingSocial(true);
    try {
      const response = await apiFetch(`${getApiUrl()}/api/social-accounts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: newPlatform, handle: newHandle, monetizationEnabled: newMonetize })
      });
      if (response.ok) {
        const data = await response.json();
        setSocialAccounts(prev => [...prev, data]);
        setNewHandle('');
        alert(`Successfully connected ${newPlatform} account: ${newHandle}`);
      }
    } catch (e) {
      setSocialAccounts(prev => [...prev, { id: `acc-mock-${Date.now()}`, platform: newPlatform, handle: newHandle, monetizationEnabled: newMonetize, connectedAt: new Date() }]);
      setNewHandle('');
      alert(`Simulation Mode: connected ${newPlatform} account: ${newHandle}`);
    } finally {
      setConnectingSocial(false);
    }
  };

  const handleDisconnectSocial = async (id: string) => {
    if (!confirm('Disconnect this social account?')) return;
    try {
      const response = await apiFetch(`${getApiUrl()}/api/social-accounts/${id}`, { method: 'DELETE' });
      if (response.ok) setSocialAccounts(prev => prev.filter(a => a.id !== id));
    } catch (e) { setSocialAccounts(prev => prev.filter(a => a.id !== id)); }
  };

  const handlePublish = () => {
    setPublishTitle(episode?.title || "S1E01 — Gravity Zero");
    setPublishDesc(episode?.summary || "An episode about choices that cannot be undone.");
    const connected = socialAccounts.map(a => a.platform);
    setSelectedPublishPlatforms(connected.length > 0 ? connected : ['youtube']);
    setPublishProgress({ status: 'idle', step: '', progress: 0 });
    setIsPublishModalOpen(true);
  };

  const handleStartPublishing = async () => {
    if (selectedPublishPlatforms.length === 0) { alert("Please select at least one platform."); return; }
    setPublishProgress({ status: 'running', step: 'Stitching shot clips into H.264 master video...', progress: 20 });
    setTimeout(() => setPublishProgress(prev => ({ ...prev, step: `Uploading to ${selectedPublishPlatforms.join(', ')} Partner APIs...`, progress: 50 })), 1500);
    setTimeout(() => setPublishProgress(prev => ({ ...prev, step: 'Registering copyright fingerprint & validating monetization...', progress: 80 })), 3000);

    try {
      const response = await apiFetch(`${getApiUrl()}/api/episodes/${episodeId}/publish`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms: selectedPublishPlatforms, title: publishTitle, description: publishDesc, monetizationOptions: { adsEnabled: publishMonetize } })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTimeout(() => { setPublishProgress({ status: 'completed', step: 'Distribution and monetization active! Video successfully published.', progress: 100, publications: data.publications || [] }); fetchProductionTimeline(); }, 4500);
      } else {
        throw new Error(data.error || 'Failed to publish');
      }
    } catch (e: any) {
      setTimeout(() => {
        const platformUrls: Record<string, string> = { youtube: `https://youtube.com/watch?v=ep-${episodeId}`, tiktok: `https://tiktok.com/@creator/video/ep-${episodeId}`, instagram: `https://instagram.com/p/ep-${episodeId}` };
        const mockPublications = selectedPublishPlatforms.map(platform => ({ id: `pub-${Math.random().toString(36).substr(2, 9)}`, platform, publishedUrl: platformUrls[platform] || `https://${platform}.com/video/ep-${episodeId}`, publishedTime: new Date(), title: publishTitle, description: publishDesc, monetizationEnabled: publishMonetize }));
        setPublishProgress({ status: 'completed', step: 'Distribution active! (Simulation mode — connect real API keys to publish live)', progress: 100, publications: mockPublications });
      }, 4500);
    }
  };

  const handleBuyCredits = async (packageId: string) => {
    try {
      const response = await apiFetch(`${getApiUrl()}/api/billing/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to initialize checkout');
      }
    } catch (e: any) {
      alert(`Stripe checkout error: ${e.message}`);
    }
  };

  const handleOpenBillingPortal = async () => {
    try {
      const response = await apiFetch(`${getApiUrl()}/api/billing/portal`);
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to open billing portal');
      }
    } catch (e: any) {
      alert(`Billing portal error: ${e.message}`);
    }
  };

  const updateBibleField = (path: string[], value: string) => {
    setEditedBible((prev: any) => {
      const next = { ...prev };
      let cur: any = next;
      for (let i = 0; i < path.length - 1; i++) { cur[path[i]] = { ...cur[path[i]] }; cur = cur[path[i]]; }
      cur[path[path.length - 1]] = value;
      return next;
    });
  };

  const b = editedBible || bible;

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      {/* Sidebar */}
      <aside className="w-64 border-r border-brand-border bg-brand-card flex flex-col">
        <div className="p-4 border-b border-brand-border flex items-center gap-3">
          <img src="/logo.png" alt="EpisodicAI Logo" className="w-9 h-9 rounded-lg object-cover shadow-md ring-1 ring-brand-violet/30" />
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">Original Studio</h4>
            <span className="text-[10px] text-brand-violet font-bold uppercase tracking-wider">Workspace Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 text-sm text-gray-300">
          {[
            { id: 'overview', label: 'Series Overview', icon: Film },
            { id: 'bible', label: 'Series Bible', icon: BookOpen },
            { id: 'timeline', label: 'Writers & Timeline', icon: Sliders },
            { id: 'graph', label: 'Canon Story Graph', icon: Workflow },
            { id: 'cost', label: 'Cost & Margins', icon: Coins },
            { id: 'admin', label: 'Admin & Providers', icon: Cpu }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition text-left ${activeTab === item.id ? 'bg-brand-violet/15 text-brand-violet border-l-2 border-brand-violet' : 'hover:bg-brand-border/40 hover:text-white text-gray-400'}`}>
                <Icon className="w-4 h-4 shrink-0" /> {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-border bg-brand-bg/40 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-bold">Credit Balance</span>
            <span className="text-brand-cyan font-bold font-mono">{creditBalance.toFixed(2)} cr</span>
          </div>
          {creditReserved > 0 && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500 font-bold uppercase">Reserved</span>
              <span className="text-brand-amber font-mono">{creditReserved.toFixed(2)} cr</span>
            </div>
          )}
          <button onClick={() => setActiveTab('cost')} className="w-full text-center text-xs font-bold py-2 bg-brand-border/50 border border-brand-border/80 rounded-lg hover:bg-brand-border text-gray-300 transition">
            Deposit Credits
          </button>
          <Link href="/" className="w-full text-center text-xs font-bold py-2 bg-red-950/20 border border-red-900/30 rounded-lg hover:bg-red-950/40 text-red-400 transition flex items-center justify-center gap-1.5 mt-2">
            <LogOut className="w-3.5 h-3.5" /> Logout to Home
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-brand-bg">
        <header className="h-14 border-b border-brand-border bg-brand-card/75 flex items-center justify-between px-8 text-xs font-semibold">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-border hover:bg-[#1a1b2e] border border-brand-border hover:text-white text-gray-300 font-bold transition">
              <ArrowLeft className="w-3.5 h-3.5 text-brand-cyan" /> Back to Home
            </Link>
            <span className="text-gray-700">|</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Active Show:</span>
              <span className="text-white font-bold text-sm bg-brand-border px-3 py-1 rounded-lg">{show?.title || "Gravity's Belief"}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">Autopilot:</span>
            <span className="px-2 py-0.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-bold">{show?.automationLevel || "Copilot"}</span>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto">

          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {socialAccounts.length === 0 && (
                <div className="p-4 rounded-xl border border-brand-amber/20 bg-brand-amber/5 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Distribution Accounts Required</h4>
                      <p className="text-[11px] text-gray-400">Connect a social media account to stream and monetize your created stories.</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('admin')} className="px-3 py-1.5 rounded-lg bg-brand-amber hover:bg-brand-amber/90 text-white font-bold text-xs shrink-0 transition">Connect Channels</button>
                </div>
              )}

              <div className="p-6 rounded-xl border border-brand-border bg-gradient-to-r from-brand-card to-brand-border/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white">S1 E{episode?.number || 1}: "{episode?.title || "S1E01 — Gravity Zero"}"</h2>
                  <p className="text-sm text-gray-400">{episode?.summary || 'Active drafting and rendering cycle. Generating production pipeline...'}</p>
                </div>
                <div className="flex gap-2.5 shrink-0">
                  <button onClick={handleGenerateScript} disabled={loading} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-bold transition disabled:opacity-50">
                    <RotateCw className="w-4 h-4" />
                    {shots.length > 0 ? 'Re-Draft Script' : 'Generate Outline & Script'}
                  </button>
                  {shots.length > 0 && (
                    <button onClick={handleTriggerRender} disabled={loading || (jobStatus?.status === 'running')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-violet to-brand-cyan hover:brightness-110 text-white font-bold transition disabled:opacity-50">
                      <Sparkles className="w-4 h-4" /> Render Episode
                    </button>
                  )}
                </div>
              </div>

              {jobStatus && (
                <div className="p-4 rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
                      Render Job: {jobStatus.status === 'completed' ? '✓ Complete' : `${jobStatus.progress}%`}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {jobStatus.status === 'completed' 
                        ? 'All shot clips rendered. Master video cut assembled and ready to publish.' 
                        : 'Processing shot clips through provider routing engine...'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-brand-border/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-brand-violet to-brand-cyan h-full transition-all duration-500" style={{ width: `${jobStatus.progress}%` }} />
                    </div>
                    {jobStatus.status === 'completed' && (
                      <button onClick={handlePublish} className="px-4 py-1.5 rounded-lg bg-brand-amber hover:bg-brand-amber/90 text-white font-bold text-xs">
                        Publish Episode
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-2">
                  <div className="text-gray-500 font-bold uppercase text-[10px]">Episode Budget</div>
                  <div className="text-3xl font-extrabold text-white">{show?.budgetPerEpisode || 50.0} cr</div>
                  <div className="text-xs text-brand-cyan">Reserved: {creditReserved.toFixed(2)} cr</div>
                </div>
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-2">
                  <div className="text-gray-500 font-bold uppercase text-[10px]">Actual Episode Cost</div>
                  <div className="text-3xl font-extrabold text-white">
                    {shots.some(s => s.status === 'completed') ? shots.reduce((acc, s) => acc + (s.actualCostCredits || 0), 0).toFixed(2) : shots.length > 0 ? `≈${shots.reduce((acc, s) => acc + (s.estimatedCostCredits || 0), 0).toFixed(2)}` : '0.00'} cr
                  </div>
                  <div className="text-xs text-gray-400">{shots.some(s => s.status === 'completed') ? 'Reconciled via Cost-Aware Router' : 'Estimated from routing engine'}</div>
                </div>
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-2">
                  <div className="text-gray-500 font-bold uppercase text-[10px]">Expected Gross Margin</div>
                  <div className="text-3xl font-extrabold text-brand-cyan">74%</div>
                  <div className="text-xs text-gray-400">Autopilot hard-stop threshold: 40%</div>
                </div>
              </div>

              {/* Shot Provider Routing Table */}
              {shots.length > 0 && (
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-brand-border pb-2">
                    <Zap className="w-4 h-4 text-brand-violet" /> Provider Routing Summary — Shot Assignment
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border/60 text-gray-400 text-[10px] uppercase">
                          <th className="py-2 pr-4">Shot</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Method</th>
                          <th className="py-2 pr-4">Provider → Model</th>
                          <th className="py-2 pr-4 text-right">Est. Cost</th>
                          <th className="py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shots.map(shot => (
                          <tr key={shot.id} className="border-b border-brand-border/20">
                            <td className="py-2 pr-4 font-bold text-white">#{shot.shotNumber}</td>
                            <td className="py-2 pr-4 text-gray-400">{shot.shotType}</td>
                            <td className="py-2 pr-4">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-border text-gray-300">{shot.productionMethod}</span>
                            </td>
                            <td className="py-2 pr-4">
                              <span className="font-bold text-white">{shot.providerName}</span>
                              <span className="text-gray-500 ml-1">→ {shot.modelName}</span>
                            </td>
                            <td className="py-2 pr-4 text-right font-mono text-brand-cyan">{shot.estimatedCostCredits?.toFixed(2)} cr</td>
                            <td className="py-2 text-right">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${shot.status === 'completed' ? 'bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan' : shot.status === 'failed' ? 'bg-red-900/20 border border-red-900/30 text-red-400' : 'bg-brand-border text-gray-400'}`}>
                                {shot.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Master Video Preview */}
              {shots.some(s => s.status === 'completed' && s.mediaUrl) && (
                <div className="p-6 rounded-xl border border-brand-border bg-brand-card space-y-4">
                  <div className="flex justify-between items-center border-b border-brand-border pb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Play className="w-4 h-4 text-brand-cyan" /> Master Video Cut Preview
                    </h3>
                    <span className="text-[10px] text-brand-cyan font-bold uppercase bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-full">• Stored & Ready to Publish</span>
                  </div>
                  <div className="text-xs text-gray-400 bg-brand-bg/60 border border-brand-border/40 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-brand-amber shrink-0 mt-0.5" />
                    <span><strong className="text-white">Demo Mode:</strong> Previewing representative video sample. Live generation uses your configured provider APIs (Veo, Runway, Kling AI, etc.). To enable live video, add provider API keys to your environment variables in Admin Settings.</span>
                  </div>
                  <div className="aspect-video max-w-2xl mx-auto rounded-xl overflow-hidden border border-brand-border bg-[#020306]">
                    <video src={shots.find(s => s.mediaUrl)?.mediaUrl} controls className="w-full h-full object-cover" />
                  </div>
                  {shots.filter(s => s.status === 'completed' && s.mediaUrl).length > 1 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {shots.filter(s => s.status === 'completed' && s.mediaUrl).slice(0, 6).map((shot, i) => (
                        <div key={shot.id} className="relative rounded-lg overflow-hidden border border-brand-border bg-[#020306] aspect-video">
                          <video src={shot.mediaUrl} className="w-full h-full object-cover opacity-80" />
                          <div className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">Shot #{shot.shotNumber}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Script & QC */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card flex flex-col h-[380px]">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-violet" /> Screenplay Draft
                    {script && <span className="ml-auto text-[9px] text-gray-500 font-normal">v1 · Generated</span>}
                  </h3>
                  <div className="flex-1 bg-[#020306] border border-brand-border/60 rounded-lg p-4 overflow-y-auto font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {script ? script.content : <span className="text-gray-500">[Click 'Generate Outline & Script' to construct the screenplay draft. The AI writers' room will generate a full screenplay with scenes, shots, dialogue, and production direction.]</span>}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-brand-border bg-brand-card flex flex-col h-[380px]">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-cyan" /> Continuity & Quality Report
                  </h3>
                  {qualityReport ? (
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-3 mb-3">
                        <span className="text-xs font-semibold text-gray-400">Overall QC Score</span>
                        <span className={`text-2xl font-extrabold ${qualityReport.overallScore >= 90 ? 'text-brand-cyan' : 'text-brand-amber'}`}>
                          {qualityReport.overallScore} <span className="text-xs text-gray-500">/ 100</span>
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3">
                        {qualityReport.findings.map((f: any, idx: number) => (
                          <div key={idx} className="p-3.5 rounded-lg bg-brand-border/40 border border-brand-border/60 space-y-1 text-xs">
                            <div className="flex justify-between font-bold">
                              <span className="text-brand-amber flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {f.category}</span>
                              <span className="uppercase text-[9px] text-gray-500">{f.severity}</span>
                            </div>
                            <p className="text-gray-300">{f.description}</p>
                            <p className="text-gray-500 italic">Fix: {f.suggestedFix}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-gray-500 space-y-2">
                      <ShieldCheck className="w-10 h-10 text-brand-border mb-2" />
                      <p>Run Outline & Script generation to activate the automated continuity and visual consistency checker.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ BIBLE TAB ═══ */}
          {activeTab === 'bible' && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Series Bible</h2>
                  <p className="text-sm text-gray-400">The authoritative document for everything '{show?.title}' must be, must never be, and must become. Click any field to edit.</p>
                </div>
                <div className="flex gap-2.5">
                  <button onClick={handleRegenerateBible} disabled={bibleLoading} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-border hover:bg-brand-border/70 border border-brand-border text-gray-200 font-bold text-xs transition disabled:opacity-50">
                    <RefreshCw className={`w-3.5 h-3.5 ${bibleLoading ? 'animate-spin' : ''}`} /> {bibleLoading ? 'Regenerating...' : 'Regenerate Bible'}
                  </button>
                </div>
              </div>

              {/* Logline */}
              {b?.logline && (
                <div className="p-5 rounded-xl border border-brand-violet/30 bg-gradient-to-r from-brand-violet/10 to-transparent">
                  <div className="text-[10px] text-brand-violet font-bold uppercase tracking-wider mb-2">Series Logline</div>
                  <p className="text-white font-semibold text-sm leading-relaxed">
                    <EditableField value={b.logline} onSave={v => updateBibleField(['logline'], v)} />
                  </p>
                </div>
              )}

              {/* Showrunner Intent & Tone */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {b?.showrunner_intent && (
                  <CollapsibleSection title="Showrunner Intent" icon={Target}>
                    <p className="text-xs text-gray-300 leading-relaxed mt-3">
                      <EditableField value={b.showrunner_intent} onSave={v => updateBibleField(['showrunner_intent'], v)} multiline className="block" />
                    </p>
                  </CollapsibleSection>
                )}
                {b?.audience_promise && (
                  <CollapsibleSection title="Audience Promise" icon={Eye}>
                    <p className="text-xs text-gray-300 leading-relaxed mt-3">
                      <EditableField value={b.audience_promise} onSave={v => updateBibleField(['audience_promise'], v)} multiline className="block" />
                    </p>
                  </CollapsibleSection>
                )}
              </div>

              {/* Summary */}
              <CollapsibleSection title="Series Summary" icon={BookOpen} badge={show?.genre}>
                <p className="text-xs text-gray-300 leading-relaxed mt-3">
                  <EditableField value={b?.summary || ''} onSave={v => updateBibleField(['summary'], v)} multiline className="block" />
                </p>
              </CollapsibleSection>

              {/* World Rules */}
              <CollapsibleSection title="World Laws & Rules" icon={Layers} badge={`${(b?.worldRules || b?.world_rules || []).length} laws`}>
                <div className="space-y-4 mt-3">
                  {(b?.worldRules || b?.world_rules || []).map((rule: any, idx: number) => (
                    <div key={rule.id || idx} className="p-4 rounded-lg bg-brand-border/30 border border-brand-border/60 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-brand-violet/20 border border-brand-violet/30 text-brand-violet">{rule.category || `Law ${idx + 1}`}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{rule.id || `law-${String(idx + 1).padStart(3, '0')}`}</span>
                        </div>
                      </div>
                      <p className="text-xs text-white font-semibold leading-relaxed">
                        <EditableField value={typeof rule === 'string' ? rule : rule.rule || rule} onSave={v => {
                          const rules = [...(b?.worldRules || b?.world_rules || [])];
                          if (typeof rules[idx] === 'string') { rules[idx] = v; } else { rules[idx] = { ...rules[idx], rule: v }; }
                          setEditedBible((prev: any) => ({ ...prev, worldRules: rules, world_rules: rules }));
                        }} multiline />
                      </p>
                      {rule.implications && rule.implications.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Story Implications</div>
                          <ul className="space-y-1">
                            {rule.implications.map((imp: string, iIdx: number) => (
                              <li key={iIdx} className="text-[11px] text-gray-400 flex gap-2">
                                <span className="text-brand-cyan mt-0.5 shrink-0">▸</span>
                                <EditableField value={imp} onSave={v => {
                                  const rules = [...(b?.worldRules || b?.world_rules || [])];
                                  const imps = [...(rules[idx].implications || [])];
                                  imps[iIdx] = v;
                                  rules[idx] = { ...rules[idx], implications: imps };
                                  setEditedBible((prev: any) => ({ ...prev, worldRules: rules, world_rules: rules }));
                                }} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {rule.visual_cue && (
                        <div className="text-[10px] text-brand-cyan/80 flex items-start gap-1.5 border-t border-brand-border/40 pt-2 mt-2">
                          <Camera className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>Visual cue: <EditableField value={rule.visual_cue} onSave={v => {
                            const rules = [...(b?.worldRules || b?.world_rules || [])];
                            rules[idx] = { ...rules[idx], visual_cue: v };
                            setEditedBible((prev: any) => ({ ...prev, worldRules: rules, world_rules: rules }));
                          }} /></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Themes */}
              {(b?.themes || []).length > 0 && typeof b?.themes[0] === 'object' && b?.themes[0]?.central_question ? (
                <CollapsibleSection title="Thematic Pillars" icon={Zap} badge={`${(b?.themes || []).length} themes`}>
                  <div className="space-y-4 mt-3">
                    {(b?.themes || []).map((theme: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg bg-brand-border/20 border border-brand-border/50 space-y-2">
                        <div className="text-sm font-bold text-white">
                          <EditableField value={theme.theme || theme} onSave={v => {
                            const themes = [...b.themes];
                            themes[idx] = { ...themes[idx], theme: v };
                            setEditedBible((prev: any) => ({ ...prev, themes }));
                          }} />
                        </div>
                        {theme.central_question && (
                          <div className="space-y-1">
                            <div className="text-[9px] text-brand-amber font-bold uppercase tracking-wider">Central Question</div>
                            <p className="text-xs text-gray-300 italic">
                              "<EditableField value={theme.central_question} onSave={v => {
                                const themes = [...b.themes];
                                themes[idx] = { ...themes[idx], central_question: v };
                                setEditedBible((prev: any) => ({ ...prev, themes }));
                              }} />"
                            </p>
                          </div>
                        )}
                        {theme.how_explored && (
                          <div className="space-y-1">
                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">How It's Explored</div>
                            <p className="text-xs text-gray-400">
                              <EditableField value={theme.how_explored} onSave={v => {
                                const themes = [...b.themes];
                                themes[idx] = { ...themes[idx], how_explored: v };
                                setEditedBible((prev: any) => ({ ...prev, themes }));
                              }} multiline />
                            </p>
                          </div>
                        )}
                        {theme.season_escalation && (
                          <div className="text-[10px] text-brand-violet/80 border-t border-brand-border/40 pt-2 mt-1">
                            Season Arc: <EditableField value={theme.season_escalation} onSave={v => {
                              const themes = [...b.themes];
                              themes[idx] = { ...themes[idx], season_escalation: v };
                              setEditedBible((prev: any) => ({ ...prev, themes }));
                            }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              ) : (
                <CollapsibleSection title="Themes" icon={Zap}>
                  <ul className="space-y-2 mt-3">
                    {(b?.themes || []).map((t: any, i: number) => (
                      <li key={i} className="text-xs text-gray-300 flex gap-2 items-center">
                        <span className="text-brand-violet">◆</span>
                        <EditableField value={typeof t === 'string' ? t : t.theme || ''} onSave={v => {
                          const themes = [...b.themes];
                          themes[i] = typeof themes[i] === 'string' ? v : { ...themes[i], theme: v };
                          setEditedBible((prev: any) => ({ ...prev, themes }));
                        }} />
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              {/* Character Profiles */}
              {(b?.character_profiles || []).length > 0 && (
                <CollapsibleSection title="Character Archetypes & Psychology" icon={Users} badge={`${(b?.character_profiles || []).length} profiles`}>
                  <div className="space-y-4 mt-3">
                    {(b?.character_profiles || []).map((cp: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg bg-brand-border/25 border border-brand-border/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white text-sm">
                              <EditableField value={cp.name} onSave={v => {
                                const cps = [...b.character_profiles];
                                cps[idx] = { ...cps[idx], name: v };
                                setEditedBible((prev: any) => ({ ...prev, character_profiles: cps }));
                              }} />
                            </div>
                            <div className="flex gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">{cp.role}</span>
                              {cp.archetype && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-brand-violet/10 border border-brand-violet/20 text-brand-violet">{cp.archetype}</span>}
                              {cp.age_range && <span className="text-[9px] text-gray-500">{cp.age_range} yrs</span>}
                            </div>
                          </div>
                        </div>
                        {cp.core_wound && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="text-[9px] text-red-400/80 font-bold uppercase">Core Wound</div>
                              <p className="text-gray-300"><EditableField value={cp.core_wound} onSave={v => { const cps = [...b.character_profiles]; cps[idx] = { ...cps[idx], core_wound: v }; setEditedBible((prev: any) => ({ ...prev, character_profiles: cps })); }} multiline /></p>
                            </div>
                            <div className="space-y-1">
                              <div className="text-[9px] text-brand-cyan/80 font-bold uppercase">Core Desire</div>
                              <p className="text-gray-300"><EditableField value={cp.core_desire} onSave={v => { const cps = [...b.character_profiles]; cps[idx] = { ...cps[idx], core_desire: v }; setEditedBible((prev: any) => ({ ...prev, character_profiles: cps })); }} multiline /></p>
                            </div>
                            {cp.voice_profile && (
                              <div className="space-y-1">
                                <div className="text-[9px] text-brand-amber/80 font-bold uppercase">Voice Profile</div>
                                <p className="text-gray-400"><EditableField value={cp.voice_profile} onSave={v => { const cps = [...b.character_profiles]; cps[idx] = { ...cps[idx], voice_profile: v }; setEditedBible((prev: any) => ({ ...prev, character_profiles: cps })); }} multiline /></p>
                              </div>
                            )}
                            {cp.visual_signature && (
                              <div className="space-y-1">
                                <div className="text-[9px] text-brand-violet/80 font-bold uppercase">Visual Signature</div>
                                <p className="text-gray-400"><EditableField value={cp.visual_signature} onSave={v => { const cps = [...b.character_profiles]; cps[idx] = { ...cps[idx], visual_signature: v }; setEditedBible((prev: any) => ({ ...prev, character_profiles: cps })); }} multiline /></p>
                              </div>
                            )}
                          </div>
                        )}
                        {cp.story_function && (
                          <div className="text-[10px] text-gray-500 border-t border-brand-border/40 pt-2 mt-1 italic">
                            Story function: <EditableField value={cp.story_function} onSave={v => { const cps = [...b.character_profiles]; cps[idx] = { ...cps[idx], story_function: v }; setEditedBible((prev: any) => ({ ...prev, character_profiles: cps })); }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Character Registry (from API) */}
              {characters.length > 0 && (
                <CollapsibleSection title="Character Registry" icon={Users} badge={`${characters.length} characters`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {characters.map((char, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-brand-border/40 border border-brand-border/60 flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-brand-violet/30 to-brand-cyan/20 border border-brand-violet/30 flex items-center justify-center font-bold text-brand-cyan text-lg shrink-0">
                          {char.name?.charAt(0) || '?'}
                        </div>
                        <div className="text-xs space-y-1 min-w-0">
                          <h4 className="font-bold text-white">{char.name} <span className="text-gray-500">({char.age} yrs)</span></h4>
                          <span className="uppercase text-[9px] text-brand-violet font-semibold block">{char.role}</span>
                          <p className="text-gray-400 leading-relaxed">{char.biography}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Visual Guidelines */}
              {(b?.visual_guidelines || []).length > 0 && (
                <CollapsibleSection title="Visual Production Guidelines" icon={Camera} badge={`${(b?.visual_guidelines || []).length} directives`}>
                  <div className="space-y-3 mt-3">
                    {(b?.visual_guidelines || []).map((vg: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg bg-brand-border/20 border border-brand-border/40">
                        <div className="text-[10px] text-brand-cyan/80 font-bold uppercase tracking-wider mb-2">{vg.aspect}</div>
                        <p className="text-xs text-gray-200 mb-2">
                          <EditableField value={vg.direction} onSave={v => {
                            const vgs = [...b.visual_guidelines];
                            vgs[idx] = { ...vgs[idx], direction: v };
                            setEditedBible((prev: any) => ({ ...prev, visual_guidelines: vgs }));
                          }} multiline />
                        </p>
                        {vg.examples && vg.examples.length > 0 && (
                          <ul className="space-y-1 border-t border-brand-border/30 pt-2 mt-2">
                            {vg.examples.map((ex: string, eIdx: number) => (
                              <li key={eIdx} className="text-[11px] text-gray-500 flex gap-1.5">
                                <span className="text-brand-violet shrink-0">→</span> {ex}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Visual & Voice Identity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <CollapsibleSection title="Visual Identity" icon={Globe}>
                  <div className="space-y-2 mt-3 text-xs text-gray-300">
                    <p><EditableField value={b?.visualIdentityNotes || b?.visual_identity || ''} onSave={v => updateBibleField(['visualIdentityNotes'], v)} multiline className="block" /></p>
                    {b?.tone_spectrum && (
                      <div className="mt-2 pt-2 border-t border-brand-border/40">
                        <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">Tone Spectrum</div>
                        <p className="text-brand-amber text-xs"><EditableField value={b.tone_spectrum} onSave={v => updateBibleField(['tone_spectrum'], v)} /></p>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
                <CollapsibleSection title="Voice & Dialogue Identity" icon={Mic}>
                  <div className="mt-3 text-xs text-gray-300">
                    <p><EditableField value={b?.voiceIdentityNotes || b?.voice_identity || ''} onSave={v => updateBibleField(['voiceIdentityNotes'], v)} multiline className="block" /></p>
                  </div>
                </CollapsibleSection>
              </div>

              {/* Forbidden Contradictions */}
              <CollapsibleSection title="Forbidden Contradictions" icon={ShieldCheck} badge={`${(b?.forbiddenContradictions || b?.forbidden_contradictions || []).length} rules`}>
                <ul className="space-y-2 mt-3">
                  {(b?.forbiddenContradictions || b?.forbidden_contradictions || []).map((fc: string, idx: number) => (
                    <li key={idx} className="flex gap-3 p-3 rounded-lg bg-red-950/10 border border-red-900/20 text-xs text-gray-300">
                      <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <EditableField value={fc} onSave={v => {
                        const fcs = [...(b?.forbiddenContradictions || b?.forbidden_contradictions || [])];
                        fcs[idx] = v;
                        setEditedBible((prev: any) => ({ ...prev, forbiddenContradictions: fcs, forbidden_contradictions: fcs }));
                      }} multiline />
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>

              {/* Season Opportunities */}
              <CollapsibleSection title="Season Opportunities" icon={Sparkles}>
                <ul className="space-y-2 mt-3">
                  {(b?.seasonOpportunities || b?.season_opportunities || []).map((so: string, idx: number) => (
                    <li key={idx} className="flex gap-3 p-3 rounded-lg bg-brand-violet/5 border border-brand-violet/15 text-xs text-gray-300">
                      <Sparkles className="w-3.5 h-3.5 text-brand-violet shrink-0 mt-0.5" />
                      <EditableField value={so} onSave={v => {
                        const sos = [...(b?.seasonOpportunities || b?.season_opportunities || [])];
                        sos[idx] = v;
                        setEditedBible((prev: any) => ({ ...prev, seasonOpportunities: sos, season_opportunities: sos }));
                      }} multiline />
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            </div>
          )}

          {/* ═══ TIMELINE TAB ═══ */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-brand-border bg-gradient-to-r from-brand-card to-brand-border/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white">Production Studio Timeline</h2>
                  <p className="text-sm text-gray-400">Edit script layout, swap providers, adjust shot parameters, and generate preview cuts.</p>
                </div>
                {shots.length > 0 && (
                  <button onClick={handleTriggerRender} disabled={loading || (jobStatus?.status === 'running')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-bold transition">
                    <Sparkles className="w-4 h-4" /> Render Timeline Preview
                  </button>
                )}
              </div>

              {shots.length > 0 ? (
                <TimelineEditor shots={shots} onUpdateShot={handleUpdateShot} onRegenerateShot={handleRegenerateShot} />
              ) : (
                <div className="p-16 text-center border border-dashed border-brand-border rounded-xl bg-brand-card space-y-3">
                  <Film className="w-12 h-12 text-brand-border mx-auto" />
                  <p className="text-sm text-gray-500">No screenplay shots loaded yet.</p>
                  <button onClick={handleGenerateScript} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-border hover:bg-brand-border/90 border border-brand-border/80 text-gray-200 text-xs font-bold transition">
                    Generate Script Outline
                  </button>
                </div>
              )}

              {shots.some(s => s.status === 'completed' && s.mediaUrl) && (
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-2"><Play className="w-4 h-4 text-brand-cyan" /> Master Video Cut</h3>
                  <div className="aspect-video max-w-2xl mx-auto rounded-xl overflow-hidden border border-brand-border bg-[#020306]">
                    <video src={shots.find(s => s.mediaUrl)?.mediaUrl} controls className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'graph' && <StoryGraph />}

          {/* ═══ COST TAB ═══ */}
          {activeTab === 'cost' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-brand-border bg-brand-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Production Billing</h3>
                  <p className="text-xs text-gray-400">Manage your subscription, view payment history, and update payment methods.</p>
                </div>
                <button 
                  onClick={handleOpenBillingPortal} 
                  disabled={isDemoMode}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-border hover:bg-brand-border/90 border border-brand-border/80 text-white font-bold text-sm transition ${isDemoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ExternalLink className="w-4 h-4" /> Open Stripe Customer Portal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'credits_100',
                    label: 'Starter Pack',
                    credits: 100,
                    price: '$9.00',
                    description: 'Starter pack — good for ~2 short episodes',
                    popular: false,
                    accentColor: 'border-brand-border',
                  },
                  {
                    id: 'credits_500',
                    label: 'Creator Pack',
                    credits: 500,
                    price: '$39.00',
                    description: 'Creator pack — good for a full season',
                    popular: true,
                    accentColor: 'border-brand-violet shadow-lg shadow-brand-violet/10',
                  },
                  {
                    id: 'credits_2000',
                    label: 'Studio Pack',
                    credits: 2000,
                    price: '$129.00',
                    description: 'Studio pack — unlimited production at scale',
                    popular: false,
                    accentColor: 'border-brand-border',
                  }
                ].map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className={`relative p-6 rounded-xl border bg-brand-card flex flex-col justify-between space-y-6 transition hover:scale-[1.02] duration-200 ${pkg.accentColor}`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-brand-violet text-[10px] font-bold text-white uppercase tracking-wider">
                        Most Popular
                      </span>
                    )}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{pkg.label}</h4>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-black text-white">{pkg.credits}</span>
                          <span className="text-xs text-gray-500 font-medium">Credits</span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-brand-cyan">{pkg.price}</div>
                      <p className="text-xs text-gray-400 leading-relaxed">{pkg.description}</p>
                    </div>
                    <button 
                      onClick={() => handleBuyCredits(pkg.id)} 
                      disabled={isDemoMode}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        pkg.popular 
                          ? 'bg-brand-violet hover:bg-brand-violet/90 text-white' 
                          : 'bg-brand-border hover:bg-brand-border/90 border border-brand-border/80 text-white'
                      } ${isDemoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Zap className="w-3.5 h-3.5" /> {isDemoMode ? 'Buy Credits (Sign in required)' : `Buy ${pkg.label}`}
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-brand-cyan" /> Workspace Credit Ledger (Immutable)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border/60 text-gray-400">
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Type</th>
                        <th className="py-2.5">Description</th>
                        <th className="py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.length === 0 ? (
                        <tr><td colSpan={4} className="py-4 text-center text-gray-500">No ledger transactions recorded.</td></tr>
                      ) : (
                        ledger.map((log: any, idx: number) => (
                          <tr key={idx} className="border-b border-brand-border/20">
                            <td className="py-2.5 text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                            <td className="py-2.5">
                              <span className={`uppercase text-[9px] font-bold px-1.5 py-0.5 rounded ${log.type === 'purchase' || log.type === 'grant' || log.type === 'refund' ? 'bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan' : 'bg-brand-amber/10 border border-brand-amber/20 text-brand-amber'}`}>{log.type}</span>
                            </td>
                            <td className="py-2.5 text-gray-300">{log.description}</td>
                            <td className={`py-2.5 text-right font-bold font-mono ${log.type === 'purchase' || log.type === 'grant' || log.type === 'refund' ? 'text-brand-cyan' : 'text-brand-amber'}`}>
                              {log.type === 'purchase' || log.type === 'grant' || log.type === 'refund' ? '+' : '-'}{log.amount?.toFixed(2)} cr
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══ ADMIN TAB ═══ */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              {/* Social Accounts */}
              <div className="p-6 rounded-xl border border-brand-border bg-brand-card space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Social Media Distribution Channels</h3>
                  <p className="text-xs text-gray-400">Connect your YouTube, TikTok, and Instagram accounts to automatically publish, distribute, and monetize generated stories.</p>
                </div>
                <form onSubmit={handleConnectSocial} className="bg-brand-bg/40 border border-brand-border/60 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Connect New Channel</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Platform</label>
                      <select value={newPlatform} onChange={e => setNewPlatform(e.target.value as any)} className="w-full rounded-lg bg-brand-bg border border-brand-border p-2 text-xs text-white focus:outline-none focus:border-brand-violet">
                        <option value="youtube">YouTube (Partnership Program)</option>
                        <option value="tiktok">TikTok (Creator Rewards Program)</option>
                        <option value="instagram">Instagram (Reels Play Bonus)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Channel Handle / Username</label>
                      <input type="text" placeholder="e.g. @MyStudio" value={newHandle} onChange={e => setNewHandle(e.target.value)} className="w-full rounded-lg bg-brand-bg border border-brand-border p-2 text-xs text-white focus:outline-none focus:border-brand-violet" required />
                    </div>
                    <div className="flex items-end pb-1.5">
                      <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={newMonetize} onChange={e => setNewMonetize(e.target.checked)} className="rounded border-brand-border bg-brand-bg text-brand-violet focus:ring-0" />
                        <span>Enable Auto-Monetization</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={connectingSocial} className="px-4 py-2 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-bold text-xs transition disabled:opacity-50">
                      {connectingSocial ? 'Connecting API...' : 'Connect Channel'}
                    </button>
                  </div>
                </form>
                {socialAccounts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Connected Accounts ({socialAccounts.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {socialAccounts.map(account => (
                        <div key={account.id} className="flex justify-between items-center bg-brand-bg/50 border border-brand-border p-3.5 rounded-xl">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${account.platform === 'youtube' ? 'bg-red-500/10 border border-red-500/20 text-red-500' : account.platform === 'tiktok' ? 'bg-pink-500/10 border border-pink-500/20 text-pink-500' : 'bg-purple-500/10 border border-purple-500/20 text-purple-500'}`}>{account.platform}</span>
                              <span className="text-xs font-bold text-white">{account.handle}</span>
                            </div>
                            <div className="text-[10px] text-gray-500">Connected {new Date(account.connectedAt).toLocaleDateString()}{account.monetizationEnabled && <span className="text-brand-cyan font-bold ml-2">• Monetization Enabled</span>}</div>
                          </div>
                          <button type="button" onClick={() => handleDisconnectSocial(account.id)} className="text-[10px] font-bold text-red-400 hover:text-red-300 border border-red-500/20 bg-red-950/20 px-2 py-1 rounded-lg">Disconnect</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Provider Registry & API Key Status */}
              <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-brand-violet" /> Provider Registry & API Key Status
                  </h3>
                  <p className="text-xs text-gray-400 mt-2">The routing engine selects the optimal provider per shot based on cost, quality, and health metrics. Configure API keys as environment variables to enable live generation.</p>
                </div>

                <div className="p-3 rounded-lg border border-brand-amber/20 bg-brand-amber/5 text-xs text-brand-amber flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Demo Mode Active:</strong> All video generation currently uses MockAI simulation (sample video playback). To enable live generation, add the required environment variables to your deployment configuration. The routing engine is fully implemented and will automatically select the best live provider once API keys are present.
                  </div>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border/60 text-gray-400 text-[10px] uppercase">
                        <th className="py-2 pr-3">Provider</th>
                        <th className="py-2 pr-3">Model</th>
                        <th className="py-2 pr-3">Capability</th>
                        <th className="py-2 pr-3">Quality</th>
                        <th className="py-2 pr-3 text-right">Cost / Unit</th>
                        <th className="py-2">API Key Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PROVIDER_REGISTRY.map(p => (
                        <tr key={p.id} className="border-b border-brand-border/20 hover:bg-brand-border/10 transition">
                          <td className="py-2 pr-3 font-bold text-white">{p.providerName}</td>
                          <td className="py-2 pr-3 text-gray-300">{p.modelName}</td>
                          <td className="py-2 pr-3 text-gray-500 uppercase text-[9px]">{p.capability}</td>
                          <td className="py-2 pr-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${p.qualityTier === 'ULTRA' ? 'bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan' : p.qualityTier === 'HIGH' ? 'bg-brand-violet/10 border border-brand-violet/20 text-brand-violet' : p.qualityTier === 'DEMO' ? 'bg-green-900/20 border border-green-800/30 text-green-400' : 'bg-brand-border text-gray-400'}`}>
                              {p.qualityTier}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-right font-mono text-brand-cyan">{p.costPerUnit} cr/{p.costUnit}</td>
                          <td className="py-2 text-[10px] text-gray-500">
                            {p.qualityTier === 'DEMO' ? (
                              <span className="text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> No key needed</span>
                            ) : (
                              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-gray-600" />{p.notes?.split('.')[0]}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-brand-card border border-brand-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-bg/40">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-brand-cyan" /> Social Media Publishing Wizard</h3>
                <p className="text-xs text-gray-400">Distribute your fully rendered video to your connected social channels.</p>
              </div>
              <button type="button" onClick={() => { if (publishProgress.status !== 'running') setIsPublishModalOpen(false); }} disabled={publishProgress.status === 'running'} className="text-gray-500 hover:text-white transition text-lg font-bold disabled:opacity-30">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-300">
              {publishProgress.status === 'idle' ? (
                <div className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Video Title</label>
                      <input type="text" value={publishTitle} onChange={e => setPublishTitle(e.target.value)} className="w-full rounded-lg bg-brand-bg border border-brand-border p-3 text-xs text-white focus:outline-none focus:border-brand-violet font-semibold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Description / Caption</label>
                      <textarea value={publishDesc} onChange={e => setPublishDesc(e.target.value)} rows={4} className="w-full rounded-lg bg-brand-bg border border-brand-border p-3 text-xs text-white focus:outline-none focus:border-brand-violet" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Target Platforms</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['youtube', 'tiktok', 'instagram'].map(platform => (
                        <button key={platform} type="button" onClick={() => setSelectedPublishPlatforms(prev => prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform])}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${selectedPublishPlatforms.includes(platform) ? 'bg-brand-violet/10 border-brand-violet text-white' : 'bg-brand-bg/50 border-brand-border text-gray-400 hover:text-gray-300'}`}>
                          <span className="capitalize font-bold text-xs">{platform}</span>
                          <span className={`w-2 h-2 rounded-full ${selectedPublishPlatforms.includes(platform) ? 'bg-brand-cyan' : 'bg-gray-700'}`}></span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-brand-border bg-brand-bg/30 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Enable Creator Partner Monetization</h4>
                      <p className="text-[11px] text-gray-500">Inject dynamic mid-roll/overlay ads and submit to platform Creator Pools.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={publishMonetize} onChange={e => setPublishMonetize(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-violet"></div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-white uppercase">
                      <span>{publishProgress.status === 'completed' ? '✓ Published' : 'Publishing Episode...'}</span>
                      <span className="font-mono text-brand-cyan">{publishProgress.progress}%</span>
                    </div>
                    <div className="w-full bg-brand-border/60 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-brand-violet to-brand-cyan h-full transition-all duration-300" style={{ width: `${publishProgress.progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 animate-pulse">{publishProgress.step}</p>
                  </div>
                  {publishProgress.status === 'completed' && (
                    <div className="p-4 rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand-cyan" /> Distributed Production URLs</h4>
                      <p className="text-[11px] text-gray-400">Your episode is live and active for monetization on the selected platforms:</p>
                      <div className="space-y-2">
                        {publishProgress.publications?.map((pub: any) => (
                          <a key={pub.id} href={pub.publishedUrl} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center p-3 rounded-lg bg-brand-card hover:bg-brand-border/60 border border-brand-border transition group">
                            <div className="flex items-center gap-2">
                              <span className="capitalize font-bold text-xs text-white">{pub.platform}</span>
                              <span className="text-[10px] text-gray-500 font-mono">ID: {pub.id}</span>
                            </div>
                            <span className="text-xs text-brand-cyan group-hover:underline font-bold flex items-center gap-1">Open Video <ExternalLink className="w-3 h-3" /></span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-brand-border flex justify-end gap-3 bg-brand-bg/40">
              {publishProgress.status === 'idle' && (
                <>
                  <button type="button" onClick={() => setIsPublishModalOpen(false)} className="px-4 py-2 rounded-lg border border-brand-border bg-transparent hover:bg-brand-border text-gray-300 font-bold text-xs transition">Cancel</button>
                  <button type="button" onClick={handleStartPublishing} className="px-5 py-2 rounded-lg bg-brand-amber hover:bg-brand-amber/95 text-white font-bold text-xs transition flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Start Production Distribution
                  </button>
                </>
              )}
              {publishProgress.status === 'completed' && (
                <button type="button" onClick={() => setIsPublishModalOpen(false)} className="px-5 py-2 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-bold text-xs transition">Close Wizard</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatorDashboard() {
  return (
    <React.Suspense fallback={<div className="h-screen bg-[#05060b] flex items-center justify-center text-xs text-gray-500">Loading Workspace...</div>}>
      <DashboardContent />
    </React.Suspense>
  );
}
