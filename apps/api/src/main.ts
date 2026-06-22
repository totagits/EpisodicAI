import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { MockProvider } from '@episodic-ai/provider-sdk';
import { ContinuityChecker } from '@episodic-ai/canon-engine';
import { CostAwareRouter } from '@episodic-ai/pricing-engine';
import { requireAuth, setWorkspaceClaim, adminDb } from './middleware/auth';
import {
  getDoc, setDoc, addDoc, updateDoc, deleteDoc, queryDocs,
  getOrCreateWorkspace, getCredits, adjustCredits,
  getShowsByWorkspace, getShow,
  getCharactersByShow, getLocationsByShow, getCanonFactsByShow,
  getSeasonsByShow, getEpisodesBySeason,
  getScenesByScript, getShotsByScenes,
} from './db/firestore';

// ─── Provider Factory (live vs demo) ─────────────────────────────────────────
import { ProviderFactory } from '@episodic-ai/provider-sdk';

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Cloud Run sits behind a Google load balancer — trust one proxy level
app.set('trust proxy', 1);
app.use(express.json());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  // Use the real client IP from X-Forwarded-For (trust proxy is set above)
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.ip || 'unknown';
  },
});
app.use(limiter);

const PORT = process.env.PORT || 4000;

const getOrchestratorUrl = () => process.env.AI_ORCHESTRATOR_URL || 'http://localhost:8000';
const getInternalKey = () => process.env.INTERNAL_ORCHESTRATOR_KEY || 'dev-internal-key';

const mockProvider = new MockProvider();

const numToWord = (n: number): string => {
  const words = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen'];
  return words[n] || n.toString();
};

const seedPricing = [
  { id: 'p1', providerName: 'fal.ai', modelName: 'Luma-DreamMachine', capability: 'video-generation', costUnit: 'second', costPerUnit: 2.0 },
  { id: 'p2', providerName: 'fal.ai', modelName: 'Kling-v1', capability: 'video-generation', costUnit: 'second', costPerUnit: 1.5 },
  { id: 'p3', providerName: 'ElevenLabs', modelName: 'TTS-Multilingual-v2', capability: 'text-to-speech', costUnit: 'character', costPerUnit: 0.05 },
  { id: 'p4', providerName: 'OpenAI', modelName: 'gpt-4o', capability: 'llm', costUnit: 'token', costPerUnit: 0.01 },
  { id: 'p5', providerName: 'MockAI', modelName: 'MockImageGen-v2', capability: 'image-generation', costUnit: 'image', costPerUnit: 0.2 },
  { id: 'p6', providerName: 'MockAI', modelName: 'MockVideoGen-v2', capability: 'video-generation', costUnit: 'second', costPerUnit: 1.0 },
  { id: 'p7', providerName: 'MockAI', modelName: 'MockLipSync-v2', capability: 'lip-sync', costUnit: 'second', costPerUnit: 0.8 },
  { id: 'p8', providerName: 'Google', modelName: 'Veo-2.0-Generate', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.12 },
  { id: 'p9', providerName: 'Runway', modelName: 'Runway-Gen3-Alpha', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.20 },
  { id: 'p10', providerName: 'Seedance', modelName: 'Seedance-Video-v1', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.10 },
  { id: 'p11', providerName: 'Kling AI', modelName: 'Kling-Pro-v3', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.08 },
  { id: 'p12', providerName: 'fal.ai', modelName: 'Wan-2.1-Cinematic', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.02 },
  { id: 'p13', providerName: 'MiniMax', modelName: 'MiniMax-Video-v2', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.08 },
  { id: 'p14', providerName: 'Tencent', modelName: 'HunyuanVideo', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.025 },
  { id: 'p15', providerName: 'RunPod', modelName: 'Wan-2.1-SelfHosted', capability: 'video-generation', costUnit: 'second', costPerUnit: 0.001 },
];

// ─── Health Check (public) ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.0.0', mode: process.env.PROVIDER_MODE || 'demo' });
});

// ─── Auth & Workspaces ────────────────────────────────────────────────────────

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const { uid, email, workspaceId } = req.user!;
    const workspace = await getOrCreateWorkspace(uid, email);
    const credits = await getCredits(workspaceId);
    const user = { id: uid, email, name: email.split('@')[0] };
    res.json({ user, workspace, credits });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/workspaces', requireAuth, async (req, res) => {
  try {
    const { uid, email, workspaceId } = req.user!;
    const { name, studioName, teamSize, timeZone, preferredLanguage } = req.body;

    const workspace = {
      id: workspaceId,
      name: name || 'My Studio',
      studioName: studioName || 'Studio',
      teamSize: Number(teamSize) || 1,
      timeZone: timeZone || 'UTC',
      preferredLanguage: preferredLanguage || 'en',
      ownerUid: uid,
      ownerEmail: email,
    };

    await setDoc('workspaces', workspaceId, workspace);

    // Ensure credit account exists
    const existingCredits = await getCredits(workspaceId);
    if (!existingCredits.balance && existingCredits.balance !== 0) {
      await setDoc('credits', workspaceId, { workspaceId, balance: 100.0, reserved: 0.0 });
      await addDoc('ledger', {
        workspaceId,
        type: 'grant',
        amount: 100.0,
        description: 'Welcome credits — new workspace',
      });
    }

    // Set workspaceId as a custom claim on the Firebase user token
    await setWorkspaceClaim(uid, workspaceId);

    res.json(workspace);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Shows ────────────────────────────────────────────────────────────────────

app.get('/api/shows', requireAuth, async (req, res) => {
  try {
    const shows = await getShowsByWorkspace(req.user!.workspaceId);
    res.json(shows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/shows/:id', requireAuth, async (req, res) => {
  try {
    const { workspaceId } = req.user!;
    const show = await getShow(req.params.id);
    if (!show || show.workspaceId !== workspaceId) return res.status(404).json({ error: 'Show not found' });

    const [bible, characters, locations, canonFacts] = await Promise.all([
      getDoc('bibles', req.params.id),
      getCharactersByShow(req.params.id),
      getLocationsByShow(req.params.id),
      getCanonFactsByShow(req.params.id),
    ]);

    res.json({ show, bible, characters, locations, canonFacts });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/shows', requireAuth, async (req, res) => {
  try {
    const { workspaceId } = req.user!;
    const showData = req.body;
    const showId = `shw-${uuidv4().substring(0, 8)}`;

    const newShow = {
      id: showId,
      workspaceId,
      ...showData,
    };
    await setDoc('shows', showId, newShow);

    // Call AI Genesis agent
    let bibleData: any = {};
    try {
      const aiResponse = await fetch(`${getOrchestratorUrl()}/agents/genesis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Key': getInternalKey() },
        body: JSON.stringify({
          title: newShow.title,
          premise: newShow.premise,
          concept: newShow.fullConcept,
          genre: newShow.genre,
          target_audience: newShow.targetAudience || 'General',
          age_rating: newShow.ageRating || 'PG-13',
        }),
      });
      bibleData = await aiResponse.json();
    } catch {
      const fallback = await mockProvider.generateText(`bible for ${newShow.title}`);
      try { bibleData = JSON.parse(fallback.data || '{}'); } catch { bibleData = {}; }
    }

    // Store Bible in Firestore
    const bible = {
      id: `bib-${uuidv4().substring(0, 8)}`,
      showId,
      workspaceId,
      version: 1,
      summary: bibleData.summary || '',
      logline: bibleData.logline || '',
      worldRules: bibleData.world_rules || [],
      themes: bibleData.themes || [],
      forbiddenContradictions: bibleData.forbidden_contradictions || [],
      seasonOpportunities: bibleData.season_opportunities || [],
      visualIdentityNotes: bibleData.visual_identity || '',
      voiceIdentityNotes: bibleData.voice_identity || '',
    };
    await setDoc('bibles', showId, bible);

    // Seed characters
    const characterName = showData.characterName || 'Luna';
    const supportingName = characterName.toLowerCase() === 'leo' ? 'Alex' : 'Leo';

    const charId = `char-${uuidv4().substring(0, 8)}`;
    const defaultChar = {
      id: charId, showId, workspaceId,
      name: `Protagonist ${characterName}`, aliases: [characterName], role: 'primary', age: 17,
      biography: 'A resourceful and determined individual who drives the core narrative.',
      personalityTraits: ['Curious', 'Stubborn', 'Optimistic'],
      appearance: { height: "5'6\"", build: 'slender', hair: 'dark brown', eyes: 'hazel', clothingStyle: 'practical attire' },
      voiceId: `voice-${characterName.toLowerCase()}`,
      referenceImageUrls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'],
      lockedTraits: ['determination', 'focus'],
    };
    await setDoc('characters', charId, defaultChar);

    const suppCharId = `char-${uuidv4().substring(0, 8)}`;
    const supportingChar = {
      id: suppCharId, showId, workspaceId,
      name: `Supporting ${supportingName}`, aliases: [supportingName], role: 'supporting', age: 18,
      biography: 'A reliable partner and confidant who assists the protagonist.',
      personalityTraits: ['Cautious', 'Loyal', 'Pragmatic'],
      appearance: { height: "5'10\"", build: 'average', hair: 'sandy brown', eyes: 'blue', clothingStyle: 'sturdy clothes' },
      voiceId: `voice-${supportingName.toLowerCase()}`,
      referenceImageUrls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop'],
      lockedTraits: ['loyalty', 'caution'],
    };
    await setDoc('characters', suppCharId, supportingChar);

    // Seed location
    const locId = `loc-${uuidv4().substring(0, 8)}`;
    await setDoc('locations', locId, {
      id: locId, showId, workspaceId,
      name: `${characterName}'s Workshop`,
      description: 'A cluttered workspace filled with equipment, components, and tools.',
      geography: 'Lower District', architecture: 'Industrial functional',
      referenceImageUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop'],
      storySignificance: 'The birthplace of the main project/discovery.',
    });

    // Seed canon fact
    const factId = `fct-${uuidv4().substring(0, 8)}`;
    await setDoc('canonFacts', factId, {
      id: factId, showId, workspaceId,
      subject: charId, predicate: 'livesIn', object: 'Lower District',
      status: 'approved', effectiveStoryDate: 'Season 1, Episode 1, Day 1',
      isPrivate: false, knownByCharacters: [charId, suppCharId],
      confidence: 1.0, version: 1, createdBy: req.user!.uid,
    });

    res.json({ show: newShow, bible, characters: [defaultChar, supportingChar] });
  } catch (e: any) {
    console.error('[POST /api/shows]', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── Seasons ──────────────────────────────────────────────────────────────────

app.get('/api/seasons/:showId', requireAuth, async (req, res) => {
  try {
    const seasons = await getSeasonsByShow(req.params.showId);
    res.json(seasons);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/seasons', requireAuth, async (req, res) => {
  try {
    const { workspaceId } = req.user!;
    const { showId, seasonNumber } = req.body;
    const show = await getShow(showId);
    if (!show || show.workspaceId !== workspaceId) return res.status(403).json({ error: 'Forbidden' });
    const bible = await getDoc('bibles', showId);

    let seasonData: any;
    try {
      const aiResponse = await fetch(`${getOrchestratorUrl()}/agents/season`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Key': getInternalKey() },
        body: JSON.stringify({
          show_id: showId, bible_summary: bible?.summary || '',
          genre: show?.genre || 'Sci-Fi', season_number: seasonNumber || 1,
        }),
      });
      seasonData = await aiResponse.json();
    } catch {
      const chars = await getCharactersByShow(showId);
      const primaryName = chars[0]?.aliases?.[0] || 'Luna';
      const supportingName = chars[1]?.aliases?.[0] || 'Leo';
      seasonData = {
        season_question: `Will ${primaryName} succeed?`,
        central_conflict: `${primaryName} vs the central challenge`,
        summary: show?.premise || 'A compelling narrative.',
        episodes: [
          { number: 1, title: `Genesis of ${primaryName}'s Journey`, objectives: ['Establish stakes', 'Introduce key characters'], summary: `${primaryName} discovers the path forward.`, climax: 'A tense confrontation.' },
          { number: 2, title: 'Tensions & Infiltration', objectives: [`Team up with ${supportingName}`, 'Acquire assets'], summary: `${primaryName} and ${supportingName} plan their move.`, climax: 'A narrow escape.' },
          { number: 3, title: 'The Daring Resolution', objectives: [`Save ${supportingName}`, 'Overcome the barrier'], summary: `${primaryName} launches the rescue.`, climax: 'A dramatic escape.' },
        ],
      };
    }

    const seasonId = `sea-${uuidv4().substring(0, 8)}`;
    const newSeason = {
      id: seasonId, showId, workspaceId,
      number: seasonNumber || 1, status: 'Drafting',
      seasonQuestion: seasonData.season_question,
      centralConflict: seasonData.central_conflict,
      summary: seasonData.summary,
    };
    await setDoc('seasons', seasonId, newSeason);

    const newEpisodes = await Promise.all(seasonData.episodes.map(async (ep: any) => {
      const epId = `eps-${uuidv4().substring(0, 8)}`;
      const newEp = {
        id: epId, seasonId, showId, workspaceId,
        number: ep.number, title: ep.title, status: 'Idea',
        objectives: ep.objectives, summary: ep.summary,
        budgetCredits: 50.0, actualCostCredits: 0.0,
      };
      await setDoc('episodes', epId, newEp);
      return newEp;
    }));

    res.json({ season: newSeason, episodes: newEpisodes });
  } catch (e: any) {
    console.error('[POST /api/seasons]', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── Episodes ─────────────────────────────────────────────────────────────────

app.get('/api/episodes/:seasonId', requireAuth, async (req, res) => {
  try {
    const eps = await getEpisodesBySeason(req.params.seasonId);
    res.json(eps);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Script Generation ────────────────────────────────────────────────────────

app.post('/api/episodes/:id/script', requireAuth, async (req, res) => {
  try {
    const { workspaceId } = req.user!;
    const epId = req.params.id;
    const episode = await getDoc('episodes', epId);
    if (!episode || episode.workspaceId !== workspaceId) return res.status(403).json({ error: 'Forbidden' });

    const season = await getDoc('seasons', episode.seasonId);
    const bible = season ? await getDoc('bibles', season.showId) : null;
    const chars = season ? await getCharactersByShow(season.showId) : [];
    const show = season ? await getShow(season.showId) : null;

    let scriptData: any;
    try {
      const response = await fetch(`${getOrchestratorUrl()}/agents/screenplay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Key': getInternalKey() },
        body: JSON.stringify({
          episode_id: epId,
          outline: { number: episode.number, title: episode.title, objectives: episode.objectives, summary: episode.summary, climax: 'Hero resolution' },
          bible_summary: bible?.summary || '',
          characters: chars,
        }),
      });
      scriptData = await response.json();
    } catch {
      const primaryName = chars[0]?.aliases?.[0] || 'Luna';
      const supportingName = chars[1]?.aliases?.[0] || 'Leo';
      const locs = season ? await getLocationsByShow(season.showId) : [];
      const locId = locs[0]?.id || 'loc-workshop';
      scriptData = {
        title: episode.title,
        content: `${primaryName.toUpperCase()}\nAlmost there. Just need to align these core channels.\n\n${supportingName.toUpperCase()}\nWe don't have much time. They're patrolling.`,
        scenes: [{
          scene_number: 1, location_id: locId, time_of_day: 'day',
          description: `Int. ${primaryName}'s Workshop`,
          beats: [`${primaryName} works`, `${supportingName} warns`],
          shots: [
            { shot_number: 1, duration_seconds: 4, shot_type: 'Medium Shot', camera_angle: 'Eye Level', camera_movement: 'Static', composition: `${primaryName} at workbench`, subject: primaryName, action: 'Connects wiring.', dialogue: { character_id: chars[0]?.id || 'char-1', text: 'Almost there.', voice_id: `voice-${primaryName.toLowerCase()}`, emotion: 'focused' }, prompt_text: `Medium shot of ${primaryName} working on a device, cinematic lighting`, production_method: 'talking-character' },
            { shot_number: 2, duration_seconds: 3, shot_type: 'Close Up', camera_angle: 'Low Angle', camera_movement: 'Zoom', composition: `${supportingName} in doorway`, subject: supportingName, action: 'Looks out.', dialogue: { character_id: chars[1]?.id || 'char-2', text: "We don't have much time.", voice_id: `voice-${supportingName.toLowerCase()}`, emotion: 'anxious' }, prompt_text: `Close up of ${supportingName} looking anxious, warm cinematic lighting`, production_method: 'talking-character' },
          ],
        }],
      };
    }

    // Store script
    const scriptId = `scr-${uuidv4().substring(0, 8)}`;
    const script = { id: scriptId, episodeId: epId, workspaceId, version: 1, content: scriptData.content };
    await setDoc('scripts', scriptId, script);

    // Store scenes + shots
    const allScenes: any[] = [];
    const allShots: any[] = [];

    for (const sc of scriptData.scenes) {
      const sceneId = `sce-${uuidv4().substring(0, 8)}`;
      const scene = {
        id: sceneId, scriptId, episodeId: epId, workspaceId,
        sceneNumber: sc.scene_number, locationId: sc.location_id,
        timeOfDay: sc.time_of_day, description: sc.description, beats: sc.beats,
      };
      await setDoc('scenes', sceneId, scene);
      allScenes.push(scene);

      for (const sh of sc.shots) {
        const durSecs = sh.duration_seconds || 8;
        const aspect = show?.aspectRatio || '16:9';
        const qTier = show?.qualityTier || 'STANDARD';
        const qLabel = (qTier === 'PREMIUM' || qTier === 'HERO') ? 'high' : 'medium';
        const internalRequest = `Generate an ${numToWord(durSecs)}-second ${aspect} character-consistent dramatic shot at ${qLabel} quality under $1.20.`;

        let selectedProvider = 'MockAI', selectedModel = 'MockVideoGen-v2', estimatedCost = 1.5;

        if (sh.production_method !== 'talking-character') {
          try {
            const routeResult = CostAwareRouter.selectRouteForInternalRequest(internalRequest, seedPricing as any, [
              { providerName: 'Google', isHealthy: true, latencyMs: 300, failureRate: 0.01, lastChecked: new Date() },
              { providerName: 'fal.ai', isHealthy: true, latencyMs: 600, failureRate: 0.03, lastChecked: new Date() },
              { providerName: 'MockAI', isHealthy: true, latencyMs: 10, failureRate: 0.00, lastChecked: new Date() },
            ]);
            selectedProvider = routeResult.selectedPricing.providerName;
            selectedModel = routeResult.selectedPricing.modelName;
            estimatedCost = routeResult.estimatedCostCredits;
          } catch { /* keep defaults */ }
        } else {
          selectedProvider = 'MockAI'; selectedModel = 'MockLipSync-v2'; estimatedCost = durSecs * 0.8;
        }

        const shotId = `sht-${uuidv4().substring(0, 8)}`;
        const shot = {
          id: shotId, sceneId, scriptId, episodeId: epId, workspaceId,
          shotNumber: sh.shot_number, durationSeconds: durSecs,
          shotType: sh.shot_type, cameraAngle: sh.camera_angle, cameraMovement: sh.camera_movement,
          compositionDescription: sh.composition, subjectDescription: sh.subject, actionDescription: sh.action,
          dialogueCharacterId: sh.dialogue?.character_id, dialogueText: sh.dialogue?.text,
          dialogueVoiceId: sh.dialogue?.voice_id, dialogueEmotion: sh.dialogue?.emotion,
          promptText: sh.prompt_text, productionMethod: sh.production_method,
          providerName: selectedProvider, modelName: selectedModel,
          estimatedCostCredits: estimatedCost, actualCostCredits: null,
          status: 'pending', mediaUrl: null, internalRequest,
        };
        await setDoc('shots', shotId, shot);
        allShots.push(shot);
      }
    }

    // Continuity check
    const facts = season ? await getCanonFactsByShow(season.showId) : [];
    const locs = season ? await getLocationsByShow(season.showId) : [];
    const scriptForCheck = { ...script, scenes: allScenes.map(sc => ({ ...sc, shots: allShots.filter(sh => sh.sceneId === sc.id) })) };
    const report = ContinuityChecker.validateScript(scriptForCheck as any, facts, chars, locs, [], []);
    const reportId = `qr-${uuidv4().substring(0, 8)}`;
    await setDoc('qualityReports', reportId, { ...report, id: reportId, episodeId: epId, scriptId, workspaceId });

    await updateDoc('episodes', epId, { status: 'Script Draft' });

    res.json({ script, scenes: allScenes, shots: allShots, report });
  } catch (e: any) {
    console.error('[POST script]', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── Production Timeline ──────────────────────────────────────────────────────

app.get('/api/episodes/:id/production', requireAuth, async (req, res) => {
  try {
    const { workspaceId } = req.user!;
    const epId = req.params.id;
    const episode = await getDoc('episodes', epId);
    if (!episode || episode.workspaceId !== workspaceId) return res.status(403).json({ error: 'Forbidden' });

    const scripts = await queryDocs('scripts', [['episodeId', '==', epId]]);
    const script = scripts[0] || null;

    let scenes: any[] = [], shots: any[] = [];
    if (script) {
      scenes = await queryDocs('scenes', [['scriptId', '==', script.id]]);
      const sceneIds = scenes.map(s => s.id);
      shots = sceneIds.length ? await getShotsByScenes(sceneIds) : [];
    }

    const reports = await queryDocs('qualityReports', [['episodeId', '==', epId]]);
    res.json({ episode, script, scenes, shots, qualityReport: reports[0] || null });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Render ───────────────────────────────────────────────────────────────────

app.post('/api/episodes/:id/render', requireAuth, async (req, res) => {
  try {
    const { workspaceId } = req.user!;
    const epId = req.params.id;
    const episode = await getDoc('episodes', epId);
    if (!episode || episode.workspaceId !== workspaceId) return res.status(403).json({ error: 'Forbidden' });

    const scripts = await queryDocs('scripts', [['episodeId', '==', epId]]);
    const script = scripts[0];
    if (!script) return res.status(400).json({ error: 'No script found. Generate script first.' });

    const scenes = await queryDocs('scenes', [['scriptId', '==', script.id]]);
    const sceneIds = scenes.map(s => s.id);
    const shots = sceneIds.length ? await getShotsByScenes(sceneIds) : [];

    // Reserve credits
    const credits = await getCredits(workspaceId);
    let totalReserved = shots.reduce((sum, sh) => sum + (sh.estimatedCostCredits || 1.5), 0);

    if (credits.balance < totalReserved) {
      return res.status(400).json({ error: 'Insufficient credits', required: totalReserved, available: credits.balance });
    }

    await adjustCredits(workspaceId, -totalReserved, totalReserved);
    await addDoc('ledger', {
      workspaceId, type: 'reservation', amount: totalReserved,
      description: `Reservation for episode: ${episode.title}`, referenceId: epId,
    });

    await updateDoc('episodes', epId, { status: 'Generating' });

    const jobId = `job-${uuidv4().substring(0, 8)}`;
    await setDoc('jobs', jobId, { id: jobId, workspaceId, episodeId: epId, type: 'assets', status: 'running', progress: 10 });

    // Background generation
    (async () => {
      let actualCostSum = 0;
      const videoProvider = ProviderFactory.getVideoProvider();

      for (let i = 0; i < shots.length; i++) {
        const shot = shots[i];
        try {
          const media = await videoProvider.generateVideo({
            prompt: shot.promptText,
            durationSeconds: shot.durationSeconds,
            aspectRatio: '16:9',
          });
          const mediaUrl = media.data?.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-42065-large.mp4';
          const pricing = seedPricing.find(p => p.providerName === shot.providerName && p.modelName === shot.modelName);
          const actualCost = parseFloat(((pricing?.costPerUnit || 1.0) * shot.durationSeconds).toFixed(2));
          actualCostSum += actualCost;

          await updateDoc('shots', shot.id, { mediaUrl, status: 'completed', actualCostCredits: actualCost });
        } catch (err) {
          await updateDoc('shots', shot.id, { status: 'failed' });
        }

        const progress = Math.round(((i + 1) / shots.length) * 100);
        await updateDoc('jobs', jobId, { progress });
      }

      // Reconcile credits
      const reconciliation = CostAwareRouter.reconcileLedger(totalReserved, actualCostSum);
      await adjustCredits(workspaceId, reconciliation.refundAmount > 0 ? reconciliation.refundAmount : -(actualCostSum - totalReserved), -totalReserved);
      await addDoc('ledger', {
        workspaceId, type: 'consumption', amount: actualCostSum,
        description: `Production cost for: ${episode.title}`, referenceId: epId,
      });

      await updateDoc('episodes', epId, { status: 'Final Approval', actualCostCredits: actualCostSum });
      await updateDoc('jobs', jobId, { status: 'completed', progress: 100 });
    })().catch(err => console.error('[Render background]', err));

    res.json({ success: true, jobId, totalReserved });
  } catch (e: any) {
    console.error('[POST render]', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── Jobs ─────────────────────────────────────────────────────────────────────

app.get('/api/jobs/:id', requireAuth, async (req, res) => {
  try {
    const job = await getDoc('jobs', req.params.id);
    if (!job || job.workspaceId !== req.user!.workspaceId) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Billing ──────────────────────────────────────────────────────────────────

app.get('/api/billing/ledger', requireAuth, async (req, res) => {
  try {
    const { workspaceId } = req.user!;
    const [credits, ledger] = await Promise.all([
      getCredits(workspaceId),
      queryDocs('ledger', [['workspaceId', '==', workspaceId]], 'createdAt'),
    ]);
    res.json({ account: credits, ledger });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Manual deposit (dev/demo mode only)
app.post('/api/billing/deposit', requireAuth, async (req, res) => {
  try {
    if (process.env.PROVIDER_MODE === 'live' && !req.isDemoMode) {
      return res.status(403).json({ error: 'Use Stripe checkout to purchase credits in live mode.' });
    }
    const { workspaceId } = req.user!;
    const amount = Number(req.body.amount) || 0;
    const updated = await adjustCredits(workspaceId, amount);
    await addDoc('ledger', { workspaceId, type: 'grant', amount, description: 'Manual deposit' });
    res.json(updated);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Shots ────────────────────────────────────────────────────────────────────

app.put('/api/shots/:id', requireAuth, async (req, res) => {
  try {
    const shot = await getDoc('shots', req.params.id);
    if (!shot || shot.workspaceId !== req.user!.workspaceId) return res.status(404).json({ error: 'Shot not found' });
    await updateDoc('shots', req.params.id, req.body);
    res.json({ ...shot, ...req.body });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Social Accounts ──────────────────────────────────────────────────────────

app.get('/api/social-accounts', requireAuth, async (req, res) => {
  try {
    const accounts = await queryDocs('socialAccounts', [['workspaceId', '==', req.user!.workspaceId]]);
    res.json(accounts);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/social-accounts', requireAuth, async (req, res) => {
  try {
    const { workspaceId } = req.user!;
    const { platform, handle, monetizationEnabled } = req.body;
    const id = `acc-${uuidv4().substring(0, 8)}`;
    const account = { id, workspaceId, platform, handle, monetizationEnabled: !!monetizationEnabled };
    await setDoc('socialAccounts', id, account);
    res.json(account);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/social-accounts/:id', requireAuth, async (req, res) => {
  try {
    const acct = await getDoc('socialAccounts', req.params.id);
    if (!acct || acct.workspaceId !== req.user!.workspaceId) return res.status(404).json({ error: 'Not found' });
    await deleteDoc('socialAccounts', req.params.id);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Publish ──────────────────────────────────────────────────────────────────

app.post('/api/episodes/:id/publish', requireAuth, async (req, res) => {
  try {
    const { workspaceId } = req.user!;
    const epId = req.params.id;
    const episode = await getDoc('episodes', epId);
    if (!episode || episode.workspaceId !== workspaceId) return res.status(403).json({ error: 'Forbidden' });

    const { platforms, title, description, monetizationOptions } = req.body;
    const selectedPlatforms: string[] = platforms?.length ? platforms : ['youtube'];

    const createdPublications: any[] = [];

    for (const platform of selectedPlatforms) {
      const pubId = `pub-${uuidv4().substring(0, 8)}`;

      // YouTube: check for stored OAuth token
      if (platform === 'youtube') {
        const workspace = await getDoc('workspaces', workspaceId);
        if (workspace?.youtubeRefreshToken) {
          // Real upload via YouTube Data API — handled by /api/youtube/upload
          // Return queued status; frontend can poll
          const pub = {
            id: pubId, episodeId: epId, workspaceId, platform,
            status: 'queued_for_upload',
            message: 'YouTube upload queued. Connect to /api/youtube/upload to complete.',
            publishedTime: new Date(),
            title: title || episode.title,
            monetizationEnabled: monetizationOptions?.adsEnabled === true,
          };
          await setDoc('publications', pubId, pub);
          createdPublications.push(pub);
        } else {
          // No YouTube auth yet — return instructions
          createdPublications.push({
            id: pubId, platform, status: 'auth_required',
            message: 'Connect your YouTube account in Admin → Channels to enable publishing.',
          });
        }
      } else {
        // TikTok / Instagram: honest stub
        const pub = {
          id: pubId, episodeId: epId, workspaceId, platform,
          status: 'manual_upload_required',
          message: `${platform} requires direct upload. Download your rendered video and upload manually.`,
          publishedTime: new Date(),
        };
        await setDoc('publications', pubId, pub);
        createdPublications.push(pub);
      }
    }

    await updateDoc('episodes', epId, { status: 'Published' });
    res.json({ success: true, publications: createdPublications });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Stripe (Phase 3) ─────────────────────────────────────────────────────────
// Import Stripe routes
import('./routes/stripe').then(m => app.use('/api/billing', m.default)).catch(() => {
  console.warn('[Stripe] Route not loaded — stripe package may not be installed');
});

// ─── YouTube OAuth ────────────────────────────────────────────────────────────
import('./routes/youtube').then(m => app.use('/api/youtube', m.default)).catch((e) => {
  console.warn('[YouTube] Route not loaded:', e.message);
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[EpisodicAI API v2.0] Running on port ${PORT}`);
  console.log(`[Mode] PROVIDER_MODE=${process.env.PROVIDER_MODE || 'demo'}`);
  console.log(`[DB] Firestore project=${process.env.FIREBASE_PROJECT_ID || 'not configured'}`);
});
