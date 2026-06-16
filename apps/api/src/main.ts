import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { MockProvider } from '@episodic-ai/provider-sdk';
import { ContinuityChecker } from '@episodic-ai/canon-engine';
import { CostAwareRouter } from '@episodic-ai/pricing-engine';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// --- In-Memory DB Store for Fast, Zero-Dependency Demo Out-Of-The-Box ---
// Bypasses local PostgreSQL/Docker setup, falling back cleanly to full state simulation
const database = {
  users: [
    { id: 'usr-default', email: 'creator@episodic.ai', name: 'Show Director' }
  ],
  workspaces: [
    { id: 'wsp-default', name: 'Original Studio', studioName: 'Episodic Studio', teamSize: 5, timeZone: 'EST', preferredLanguage: 'en' }
  ],
  credits: {
    'wsp-default': { balance: 250.0, reserved: 0.0 }
  } as Record<string, { balance: number; reserved: number }>,
  ledger: [] as any[],
  shows: [] as any[],
  bibles: {} as Record<string, any>,
  characters: [] as any[],
  locations: [] as any[],
  objects: [] as any[],
  canonFacts: [] as any[],
  canonEvents: [] as any[],
  seasons: [] as any[],
  episodes: [] as any[],
  scripts: {} as Record<string, any>,
  scenes: [] as any[],
  shots: [] as any[],
  jobs: [] as any[],
  qualityReports: [] as any[],
  publications: [] as any[]
};

// Seed default providers pricing
const seedPricing = [
  { id: 'p1', providerName: 'fal.ai', modelName: 'Luma-DreamMachine', capability: 'video-generation', costUnit: 'second', costPerUnit: 2.0 },
  { id: 'p2', providerName: 'fal.ai', modelName: 'Kling-v1', capability: 'video-generation', costUnit: 'second', costPerUnit: 1.5 },
  { id: 'p3', providerName: 'ElevenLabs', modelName: 'TTS-Multilingual-v2', capability: 'text-to-speech', costUnit: 'character', costPerUnit: 0.05 },
  { id: 'p4', providerName: 'OpenAI', modelName: 'gpt-4o', capability: 'llm', costUnit: 'token', costPerUnit: 0.01 },
  { id: 'p5', providerName: 'MockAI', modelName: 'MockImageGen-v2', capability: 'image-generation', costUnit: 'image', costPerUnit: 0.2 },
  { id: 'p6', providerName: 'MockAI', modelName: 'MockVideoGen-v2', capability: 'video-generation', costUnit: 'second', costPerUnit: 1.0 }
];

const mockProvider = new MockProvider();

// --- API Router Endpoints ---

// Auth & Workspaces
app.get('/api/auth/me', (req, res) => {
  res.json({ user: database.users[0], workspace: database.workspaces[0], credits: database.credits['wsp-default'] });
});

app.post('/api/workspaces', (req, res) => {
  const { name, studioName, teamSize, timeZone, preferredLanguage } = req.body;
  const newWorkspace = { id: `wsp-${uuidv4().substring(0, 8)}`, name, studioName, teamSize: Number(teamSize), timeZone, preferredLanguage };
  database.workspaces.push(newWorkspace);
  database.credits[newWorkspace.id] = { balance: 100.0, reserved: 0.0 };
  res.json(newWorkspace);
});

// Show Genesis
app.post('/api/shows', async (req, res) => {
  const showData = req.body;
  const showId = `shw-${uuidv4().substring(0, 8)}`;
  const newShow = {
    id: showId,
    workspaceId: showData.workspaceId || 'wsp-default',
    ...showData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  database.shows.push(newShow);

  // Call AI Genesis agent via Fetch or simulate local Mock
  let bibleData;
  try {
    const aiResponse = await fetch('http://localhost:8000/agents/genesis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newShow.title,
        premise: newShow.premise,
        concept: newShow.fullConcept,
        genre: newShow.genre,
        target_audience: newShow.targetAudience,
        age_rating: newShow.ageRating
      })
    });
    const result = await aiResponse.json();
    bibleData = result;
  } catch (error) {
    // Fallback if local python service is not running
    const fallback = await mockProvider.generateText(`bible for ${newShow.title}`);
    bibleData = JSON.parse(fallback.data || '{}');
  }

  // Create Series Bible
  const bible = {
    id: `bib-${uuidv4().substring(0, 8)}`,
    showId,
    version: 1,
    summary: bibleData.summary,
    worldRules: bibleData.world_rules,
    themes: bibleData.themes,
    forbiddenContradictions: bibleData.forbidden_contradictions,
    seasonOpportunities: bibleData.season_opportunities,
    visualIdentityNotes: bibleData.visual_identity,
    voiceIdentityNotes: bibleData.voice_identity,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  database.bibles[showId] = bible;

  // Add default characters
  const charId = `char-${uuidv4().substring(0, 8)}`;
  const defaultChar = {
    id: charId,
    showId,
    name: 'Protagonist Luna',
    aliases: ['Luna'],
    role: 'primary',
    age: 17,
    biography: 'A resourceful mechanic from the lower slums who dreams of flying.',
    personalityTraits: ['Curious', 'Stubborn', 'Optimistic'],
    appearance: { height: "5'4\"", build: 'slender', hair: 'dark brown', eyes: 'hazel', clothingStyle: 'tattered jumpsuit' },
    voiceId: 'voice-luna',
    referenceImageUrls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'],
    lockedTraits: ['mechanical goggles', 'optimism']
  };
  database.characters.push(defaultChar);

  // Add default Location
  const locId = `loc-workshop`;
  database.locations.push({
    id: locId,
    showId,
    name: 'Luna\'s Workshop',
    description: 'A cluttered workspace filled with copper coils, hovering gears, and neon tools.',
    geography: 'Lower Slum District',
    architecture: 'Retro-steampunk industrial',
    referenceImageUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop'],
    storySignificance: 'The birthplace of the directional gravity boots.'
  });

  // Seed initial approved canon facts
  database.canonFacts.push({
    id: `fct-${uuidv4().substring(0, 8)}`,
    showId,
    subject: defaultChar.id,
    predicate: 'livesIn',
    object: 'Lower Slum District',
    status: 'approved',
    effectiveStoryDate: 'Season 1, Episode 1, Day 1',
    isPrivate: false,
    knownByCharacters: [defaultChar.id],
    confidence: 1.0,
    version: 1,
    createdBy: 'usr-default'
  });

  res.json({ show: newShow, bible, characters: [defaultChar] });
});

app.get('/api/shows/:id', (req, res) => {
  const show = database.shows.find(s => s.id === req.params.id);
  const bible = database.bibles[req.params.id];
  const chars = database.characters.filter(c => c.showId === req.params.id);
  const locs = database.locations.filter(l => l.showId === req.params.id);
  const facts = database.canonFacts.filter(f => f.showId === req.params.id);
  res.json({ show, bible, characters: chars, locations: locs, canonFacts: facts });
});

app.get('/api/shows', (req, res) => {
  res.json(database.shows);
});

// Seasons & Episode outlines
app.post('/api/seasons', async (req, res) => {
  const { showId, seasonNumber } = req.body;
  const show = database.shows.find(s => s.id === showId);
  const bible = database.bibles[showId];

  let seasonData;
  try {
    const aiResponse = await fetch('http://localhost:8000/agents/season', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        show_id: showId,
        bible_summary: bible?.summary || 'Standard story summary',
        genre: show?.genre || 'Sci-Fi',
        season_number: seasonNumber || 1
      })
    });
    seasonData = await aiResponse.json();
  } catch (error) {
    // Fallback simulation
    seasonData = {
      season_question: "Will Luna escape the Sky Guard?",
      central_conflict: "Luna vs Sky Guard Authorities",
      summary: "A high-altitude struggle over vertical mobility.",
      episodes: [
        { number: 1, title: "The Ground Zero", objectives: ["Test the boots"], summary: "Luna activates her boots.", climax: "Walking on ceiling." },
        { number: 2, title: "Citadel Infiltration", objectives: ["Rescue Leo"], summary: "Luna sneaks into the citadel.", climax: "Hacking doors." }
      ]
    };
  }

  const newSeason = {
    id: `sea-${uuidv4().substring(0, 8)}`,
    showId,
    number: seasonNumber || 1,
    status: 'Drafting',
    seasonQuestion: seasonData.season_question,
    centralConflict: seasonData.central_conflict,
    summary: seasonData.summary
  };
  database.seasons.push(newSeason);

  // Generate episodes list
  const newEpisodes = seasonData.episodes.map((ep: any) => {
    const epId = `eps-${uuidv4().substring(0, 8)}`;
    const newEp = {
      id: epId,
      seasonId: newSeason.id,
      number: ep.number,
      title: ep.title,
      status: 'Idea',
      objectives: ep.objectives,
      summary: ep.summary,
      budgetCredits: 50.0,
      actualCostCredits: 0.0
    };
    database.episodes.push(newEp);
    return newEp;
  });

  res.json({ season: newSeason, episodes: newEpisodes });
});

app.get('/api/seasons/:showId', (req, res) => {
  const seasons = database.seasons.filter(s => s.showId === req.params.showId);
  res.json(seasons);
});

app.get('/api/episodes/:seasonId', (req, res) => {
  const eps = database.episodes.filter(e => e.seasonId === req.params.seasonId);
  res.json(eps);
});

// Script & Screening
app.post('/api/episodes/:id/script', async (req, res) => {
  const epId = req.params.id;
  const episode = database.episodes.find(e => e.id === epId);
  const season = database.seasons.find(s => s.id === episode?.seasonId);
  const bible = database.bibles[season?.showId || ''];
  const chars = database.characters.filter(c => c.showId === season?.showId);

  let scriptData;
  try {
    const response = await fetch('http://localhost:8000/agents/screenplay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episode_id: epId,
        outline: {
          number: episode?.number || 1,
          title: episode?.title || 'Episode',
          objectives: episode?.objectives || [],
          summary: episode?.summary || '',
          climax: 'Hero rescue'
        },
        bible_summary: bible?.summary || '',
        characters: chars
      })
    });
    scriptData = await response.json();
  } catch (e) {
    // Offline / Fallback
    scriptData = {
      title: episode?.title || 'Episode',
      content: 'LUNA works at her bench. LEO enters and warns of the Sky Guard.',
      scenes: [
        {
          scene_number: 1,
          location_id: 'loc-workshop',
          time_of_day: 'day',
          description: 'Int. Slum Workshop',
          beats: ['Boot activates'],
          shots: [
            {
              shot_number: 1,
              duration_seconds: 4,
              shot_type: 'Medium Shot',
              camera_angle: 'Eye Level',
              camera_movement: 'Static',
              composition: 'Luna at work',
              subject: 'Luna',
              action: 'Solders boot',
              dialogue: { character_id: chars[0]?.id || 'char-luna', text: 'It works!', voice_id: 'voice-luna', emotion: 'excited' },
              prompt_text: 'Girl soldering boot, cinematic',
              production_method: 'talking-character'
            }
          ]
        }
      ]
    };
  }

  // Create script entry
  const scriptId = `scr-${uuidv4().substring(0, 8)}`;
  const script = {
    id: scriptId,
    episodeId: epId,
    version: 1,
    content: scriptData.content
  };
  database.scripts[epId] = script;

  // Clear existing shots/scenes for this script rebuild
  database.scenes = database.scenes.filter(sc => sc.scriptId !== scriptId);

  // Store Scenes and Shots
  scriptData.scenes.forEach((sc: any) => {
    const sceneId = `sce-${uuidv4().substring(0, 8)}`;
    database.scenes.push({
      id: sceneId,
      scriptId,
      sceneNumber: sc.scene_number,
      locationId: sc.location_id || 'loc-workshop',
      timeOfDay: sc.time_of_day,
      description: sc.description,
      beats: sc.beats
    });

    sc.shots.forEach((sh: any) => {
      database.shots.push({
        id: `sht-${uuidv4().substring(0, 8)}`,
        sceneId,
        shotNumber: sh.shot_number,
        durationSeconds: sh.duration_seconds,
        shotType: sh.shot_type,
        cameraAngle: sh.camera_angle,
        cameraMovement: sh.camera_movement,
        compositionDescription: sh.composition,
        subjectDescription: sh.subject,
        actionDescription: sh.action,
        dialogueCharacterId: sh.dialogue?.character_id,
        dialogueText: sh.dialogue?.text,
        dialogueVoiceId: sh.dialogue?.voice_id,
        dialogueEmotion: sh.dialogue?.emotion,
        promptText: sh.prompt_text,
        productionMethod: sh.production_method,
        providerName: 'MockAI',
        modelName: 'MockVideoGen-v2',
        estimatedCostCredits: sh.estimated_cost_credits || 1.5,
        actualCostCredits: null,
        status: 'pending',
        mediaUrl: null
      });
    });
  });

  // Execute Continuity Check
  const showFacts = database.canonFacts.filter(f => f.showId === season?.showId);
  const report = ContinuityChecker.validateScript(
    { ...script, scenes: database.scenes.filter(sc => sc.scriptId === scriptId).map(sc => ({
      ...sc,
      shots: database.shots.filter(sh => sh.sceneId === sc.id)
    })) } as any,
    showFacts,
    chars,
    database.locations.filter(l => l.showId === season?.showId),
    database.objects.filter(o => o.showId === season?.showId),
    []
  );

  database.qualityReports.push(report);

  episode!.status = 'Script Draft';
  res.json({ script, scenes: database.scenes.filter(sc => sc.scriptId === scriptId), report });
});

app.get('/api/episodes/:id/production', (req, res) => {
  const epId = req.params.id;
  const script = database.scripts[epId];
  const scs = database.scenes.filter(sc => sc.scriptId === script?.id);
  const sceneIds = scs.map(sc => sc.id);
  const shts = database.shots.filter(sh => sceneIds.includes(sh.sceneId));
  const report = database.qualityReports.find(r => r.targetId === script?.id);

  res.json({ script, scenes: scs, shots: shts, qualityReport: report });
});

// Render/Run jobs
app.post('/api/episodes/:id/render', async (req, res) => {
  const epId = req.params.id;
  const episode = database.episodes.find(e => e.id === epId);
  const script = database.scripts[epId];
  const scs = database.scenes.filter(sc => sc.scriptId === script?.id);
  const sceneIds = scs.map(sc => sc.id);
  const shts = database.shots.filter(sh => sceneIds.includes(sh.sceneId));

  episode!.status = 'Generating';

  // Reserve credits using pricing router
  let totalReserved = 0;
  shts.forEach(shot => {
    const route = CostAwareRouter.selectProviderRoute(
      {
        capability: shot.productionMethod === 'talking-character' ? 'lip-sync' : 'video-generation',
        durationSeconds: shot.durationSeconds,
        resolution: '720p',
        qualityTier: 'STANDARD',
        remainingEpisodeBudget: 50.0
      },
      seedPricing as any,
      [
        { providerName: 'MockAI', isHealthy: true, latencyMs: 10, failureRate: 0.01, lastChecked: new Date() }
      ],
      {}
    );
    totalReserved += route.estimatedCostCredits;
  });

  const account = database.credits['wsp-default'];
  if (account.balance < totalReserved) {
    episode!.status = 'Failed';
    return res.status(400).json({ error: 'Insufficient credits account balance', required: totalReserved, available: account.balance });
  }

  // Deduct/Reserve
  account.balance -= totalReserved;
  account.reserved += totalReserved;

  // Add ledger log
  database.ledger.push({
    id: `led-${uuidv4().substring(0, 8)}`,
    accountId: 'wsp-default',
    type: 'reservation',
    amount: totalReserved,
    description: `Reservation for episode: ${episode?.title}`,
    referenceId: epId
  });

  // Spawn Background Generator Simulation
  const jobId = `job-${uuidv4().substring(0, 8)}`;
  database.jobs.push({
    id: jobId,
    workspaceId: 'wsp-default',
    episodeId: epId,
    type: 'assets',
    status: 'running',
    progress: 10.0
  });

  // Background mock worker run
  setTimeout(async () => {
    const activeJob = database.jobs.find(j => j.id === jobId);
    if (!activeJob) return;

    // Render shots
    let actualCostSum = 0;
    for (let i = 0; i < shts.length; i++) {
      const shot = shts[i];
      const media = await mockProvider.generateVideo({ prompt: shot.promptText, durationSeconds: shot.durationSeconds });
      
      shot.mediaUrl = media.data?.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-42065-large.mp4';
      shot.status = 'completed';
      shot.actualCostCredits = media.costCredits;
      actualCostSum += media.costCredits;

      activeJob.progress = Math.round(((i + 1) / shts.length) * 100);
    }

    // Reconcile Reserved vs Actual
    const reconciliation = CostAwareRouter.reconcileLedger(totalReserved, actualCostSum);
    account.reserved -= totalReserved;
    if (reconciliation.refundAmount > 0) {
      account.balance += reconciliation.refundAmount;
    } else if (reconciliation.isOverBudget) {
      account.balance -= (actualCostSum - totalReserved);
    }

    database.ledger.push({
      id: `led-${uuidv4().substring(0, 8)}`,
      accountId: 'wsp-default',
      type: 'consumption',
      amount: actualCostSum,
      description: `Production cost for episode: ${episode?.title}`,
      referenceId: epId
    });

    episode!.actualCostCredits = actualCostSum;
    episode!.status = 'Final Approval';
    activeJob.status = 'completed';
    activeJob.progress = 100.0;
  }, 3000);

  res.json({ success: true, jobId, totalReserved });
});

// Get active job status
app.get('/api/jobs/:id', (req, res) => {
  const job = database.jobs.find(j => j.id === req.params.id);
  res.json(job);
});

// Cost and margins API
app.get('/api/billing/ledger', (req, res) => {
  res.json({
    account: database.credits['wsp-default'],
    ledger: database.ledger
  });
});

app.post('/api/billing/deposit', (req, res) => {
  const { amount } = req.body;
  const account = database.credits['wsp-default'];
  account.balance += Number(amount);
  database.ledger.push({
    id: `led-${uuidv4().substring(0, 8)}`,
    accountId: 'wsp-default',
    type: 'purchase',
    amount: Number(amount),
    description: 'Manual credit deposit'
  });
  res.json(account);
});

// Timeline editing routes
app.put('/api/shots/:id', (req, res) => {
  const shot = database.shots.find(sh => sh.id === req.params.id);
  if (!shot) return res.status(404).json({ error: 'Shot not found' });
  
  const updates = req.body;
  Object.assign(shot, updates);
  res.json(shot);
});

app.post('/api/episodes/:id/publish', (req, res) => {
  const epId = req.params.id;
  const episode = database.episodes.find(e => e.id === epId);
  episode!.status = 'Published';
  episode!.publishedUrl = 'https://youtube.com/watch?v=mock-episodic-ai';
  
  database.publications.push({
    id: `pub-${uuidv4().substring(0, 8)}`,
    episodeId: epId,
    platform: 'youtube',
    status: 'success',
    publishedUrl: episode!.publishedUrl,
    publishedTime: new Date()
  });

  res.json({ success: true, url: episode!.publishedUrl });
});

app.listen(PORT, () => {
  console.log(`[EpisodicAI API] Server running on http://localhost:${PORT}`);
});
