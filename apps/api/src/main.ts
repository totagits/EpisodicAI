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

const getOrchestratorUrl = () => {
  return process.env.AI_ORCHESTRATOR_URL || 'http://localhost:8000';
};

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
  { id: 'p6', providerName: 'MockAI', modelName: 'MockVideoGen-v2', capability: 'video-generation', costUnit: 'second', costPerUnit: 1.0 },
  { id: 'p7', providerName: 'MockAI', modelName: 'MockLipSync-v2', capability: 'lip-sync', costUnit: 'second', costPerUnit: 0.8 }
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
    const aiResponse = await fetch(`${getOrchestratorUrl()}/agents/genesis`, {
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

  const characterName = showData.characterName || 'Luna';
  const supportingName = characterName.toLowerCase() === 'leo' ? 'Alex' : 'Leo';

  // Add default characters
  const charId = `char-${uuidv4().substring(0, 8)}`;
  const defaultChar = {
    id: charId,
    showId,
    name: `Protagonist ${characterName}`,
    aliases: [characterName],
    role: 'primary',
    age: 17,
    biography: `A resourceful and determined individual who drives the core narrative.`,
    personalityTraits: ['Curious', 'Stubborn', 'Optimistic'],
    appearance: { height: "5'6\"", build: 'slender', hair: 'dark brown', eyes: 'hazel', clothingStyle: 'practical attire' },
    voiceId: `voice-${characterName.toLowerCase()}`,
    referenceImageUrls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'],
    lockedTraits: ['determination', 'focus']
  };
  database.characters.push(defaultChar);

  const supportingCharId = `char-${uuidv4().substring(0, 8)}`;
  const supportingChar = {
    id: supportingCharId,
    showId,
    name: `Supporting ${supportingName}`,
    aliases: [supportingName],
    role: 'supporting',
    age: 18,
    biography: `A reliable partner and confidant who assists the protagonist.`,
    personalityTraits: ['Cautious', 'Loyal', 'Pragmatic'],
    appearance: { height: "5'10\"", build: 'average', hair: 'sandy brown', eyes: 'blue', clothingStyle: 'sturdy clothes' },
    voiceId: `voice-${supportingName.toLowerCase()}`,
    referenceImageUrls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop'],
    lockedTraits: ['loyalty', 'caution']
  };
  database.characters.push(supportingChar);

  // Add default Location
  const locId = `loc-workshop`;
  database.locations.push({
    id: locId,
    showId,
    name: `${characterName}'s Workshop`,
    description: `A cluttered workspace filled with equipment, components, and tools matching the series theme.`,
    geography: 'Lower District',
    architecture: 'Industrial functional',
    referenceImageUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop'],
    storySignificance: `The birthplace of the main project/discovery.`
  });

  // Seed initial approved canon facts
  database.canonFacts.push({
    id: `fct-${uuidv4().substring(0, 8)}`,
    showId,
    subject: defaultChar.id,
    predicate: 'livesIn',
    object: 'Lower District',
    status: 'approved',
    effectiveStoryDate: 'Season 1, Episode 1, Day 1',
    isPrivate: false,
    knownByCharacters: [defaultChar.id, supportingChar.id],
    confidence: 1.0,
    version: 1,
    createdBy: 'usr-default'
  });

  res.json({ show: newShow, bible, characters: [defaultChar, supportingChar] });
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
    const aiResponse = await fetch(`${getOrchestratorUrl()}/agents/season`, {
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
    const chars = database.characters.filter(c => c.showId === showId);
    const primaryName = chars[0]?.aliases?.[0] || 'Luna';
    const supportingName = chars[1]?.aliases?.[0] || 'Leo';
    
    seasonData = {
      season_question: `Will ${primaryName} successfully resolve the challenges of ${show?.title || 'the series'}?`,
      central_conflict: `${primaryName} vs the central thematic conflicts of ${show?.genre || 'the story'}`,
      summary: show?.premise || "A compelling narrative detailing the characters' main struggle.",
      episodes: [
        { number: 1, title: `Genesis of ${primaryName}'s Journey`, objectives: ["Establish the stakes", "Introduce key characters"], summary: `${primaryName} discovers a crucial path related to their premise, facing initial opposition.`, climax: "A tense confrontation." },
        { number: 2, title: "Tensions & Infiltration", objectives: [`Team up with ${supportingName}`, "Acquire tactical assets"], summary: `${primaryName} and ${supportingName} plan a daring move to bypass security and secure their objective.`, climax: `A narrow escape leaving ${supportingName} in a precarious situation.` },
        { number: 3, title: "The Daring Resolution", objectives: [`Rescue ${supportingName}`, "Overcome the central barrier"], summary: `Using their skills and plans, ${primaryName} launches a rescue mission to liberate ${supportingName}.`, climax: "A dramatic escape that opens up a new realm of possibilities." }
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
    const response = await fetch(`${getOrchestratorUrl()}/agents/screenplay`, {
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
    const primaryName = chars[0]?.aliases?.[0] || 'Luna';
    const supportingName = chars[1]?.aliases?.[0] || 'Leo';
    const primaryUpper = primaryName.toUpperCase();
    const supportingUpper = supportingName.toUpperCase();

    scriptData = {
      title: episode?.title || 'Episode',
      content: `${primaryUpper} is working at the workbench. ${supportingUpper} enters looking anxious.\n\n${primaryUpper}\n(focused)\nAlmost there. Just need to align these core channels.\n\n${supportingUpper}\nWe don't have much time, ${primaryName}. They're patrolling the perimeter.`,
      scenes: [
        {
          scene_number: 1,
          location_id: 'loc-workshop',
          time_of_day: 'day',
          description: `Int. ${primaryName}'s Workshop`,
          beats: [`${primaryName} adjusts the core tech`, `${supportingName} warns of threat`],
          shots: [
            {
              shot_number: 1,
              duration_seconds: 4,
              shot_type: 'Medium Shot',
              camera_angle: 'Eye Level',
              camera_movement: 'Static',
              composition: `${primaryName} at the workbench focusing on the tech.`,
              subject: primaryName,
              action: `${primaryName} connects a wires assembly into the main device.`,
              dialogue: { character_id: chars[0]?.id || 'char-luna', text: 'Almost there. Just need to align these core channels.', voice_id: `voice-${primaryName.toLowerCase()}`, emotion: 'focused' },
              prompt_text: `Medium shot of ${primaryName} working with tools on a detailed technological device, cinematic lighting`,
              production_method: 'talking-character'
            },
            {
              shot_number: 2,
              duration_seconds: 3,
              shot_type: 'Close Up',
              camera_angle: 'Low Angle',
              camera_movement: 'Zoom',
              composition: `Close up on ${supportingName} speaking.`,
              subject: supportingName,
              action: `${supportingName} shifts weight, looking out the doorway.`,
              dialogue: { character_id: chars[1]?.id || 'char-leo', text: `We don't have much time, ${primaryName}. They're patrolling the perimeter.`, voice_id: `voice-${supportingName.toLowerCase()}`, emotion: 'anxious' },
              prompt_text: `Close up of ${supportingName} looking anxious, warning the camera, warm cinematic lighting, depth of field`,
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

  if (episode) {
    episode.status = 'Script Draft';
  }
  res.json({ script, scenes: database.scenes.filter(sc => sc.scriptId === scriptId), report });
});

app.get('/api/episodes/:id/production', (req, res) => {
  const epId = req.params.id;
  const episode = database.episodes.find(e => e.id === epId);
  const script = database.scripts[epId];
  const scs = database.scenes.filter(sc => sc.scriptId === script?.id);
  const sceneIds = scs.map(sc => sc.id);
  const shts = database.shots.filter(sh => sceneIds.includes(sh.sceneId));
  const report = database.qualityReports.find(r => r.targetId === script?.id);

  res.json({ episode, script, scenes: scs, shots: shts, qualityReport: report });
});

// Render/Run jobs
app.post('/api/episodes/:id/render', async (req, res) => {
  const epId = req.params.id;
  const episode = database.episodes.find(e => e.id === epId);
  const script = database.scripts[epId];
  const scs = database.scenes.filter(sc => sc.scriptId === script?.id);
  const sceneIds = scs.map(sc => sc.id);
  const shts = database.shots.filter(sh => sceneIds.includes(sh.sceneId));

  if (episode) {
    episode.status = 'Generating';
  }

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
    if (episode) {
      episode.status = 'Failed';
    }
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

    if (episode) {
      episode.actualCostCredits = actualCostSum;
      episode.status = 'Final Approval';
    }
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

const socialAccounts = [] as any[];

app.get('/api/social-accounts', (req, res) => {
  res.json(socialAccounts);
});

app.post('/api/social-accounts', (req, res) => {
  const { platform, handle, monetizationEnabled } = req.body;
  const newAccount = {
    id: `acc-${uuidv4().substring(0, 8)}`,
    platform,
    handle,
    monetizationEnabled: monetizationEnabled === true,
    connectedAt: new Date()
  };
  socialAccounts.push(newAccount);
  res.json(newAccount);
});

app.delete('/api/social-accounts/:id', (req, res) => {
  const idx = socialAccounts.findIndex(a => a.id === req.params.id);
  if (idx !== -1) {
    socialAccounts.splice(idx, 1);
  }
  res.json({ success: true });
});

app.post('/api/episodes/:id/publish', (req, res) => {
  const epId = req.params.id;
  const episode = database.episodes.find(e => e.id === epId);
  if (!episode) return res.status(404).json({ error: 'Episode not found' });

  const { platforms, title, description, monetizationOptions } = req.body;
  
  episode.status = 'Published';
  
  const createdPublications = [] as any[];

  const platformUrls: Record<string, string> = {
    youtube: `https://youtube.com/watch?v=ep-${epId}`,
    tiktok: `https://tiktok.com/@creator/video/ep-${epId}`,
    instagram: `https://instagram.com/p/ep-${epId}`
  };

  const selectedPlatforms = platforms && platforms.length > 0 ? platforms : ['youtube'];

  selectedPlatforms.forEach((platform: string) => {
    const pubUrl = platformUrls[platform] || `https://${platform}.com/video/ep-${epId}`;
    
    const pubRecord = {
      id: `pub-${uuidv4().substring(0, 8)}`,
      episodeId: epId,
      platform,
      status: 'success',
      publishedUrl: pubUrl,
      publishedTime: new Date(),
      title: title || episode.title,
      description: description || episode.summary,
      monetizationEnabled: monetizationOptions?.adsEnabled === true
    };
    
    database.publications.push(pubRecord);
    createdPublications.push(pubRecord);
  });

  episode.publishedUrl = createdPublications[0]?.publishedUrl || platformUrls.youtube;

  res.json({ 
    success: true, 
    url: episode.publishedUrl, 
    publications: createdPublications 
  });
});

app.listen(PORT, () => {
  console.log(`[EpisodicAI API] Server running on http://localhost:${PORT}`);
});
