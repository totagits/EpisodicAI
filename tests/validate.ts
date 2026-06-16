import { ContinuityChecker, TimelineEngine, CharacterKnowledgeGraph } from '@episodic-ai/canon-engine';
import { CostAwareRouter } from '@episodic-ai/pricing-engine';
import { MockProvider, ProviderRegistry } from '@episodic-ai/provider-sdk';
import { Script, Character, Location, StoryObject, StoryThread } from '@episodic-ai/types';

async function runValidationSuite() {
  console.log("==================================================");
  console.log("   EPISODICAI - PACKAGE VERIFICATION SUITE       ");
  console.log("==================================================");

  let passed = true;

  // --- 1. Test MockProvider (provider-sdk) ---
  try {
    const provider = new MockProvider();
    const result = await provider.generateText("Write a bible summary");
    if (result.success && result.data && result.costCredits > 0) {
      console.log("✔ [provider-sdk] MockProvider text generation passed.");
    } else {
      console.log("❌ [provider-sdk] MockProvider failed, invalid output.");
      passed = false;
    }
  } catch (e: any) {
    console.error("❌ [provider-sdk] Error running test:", e.message);
    passed = false;
  }

  // --- 2. Test ContinuityChecker (canon-engine) ---
  try {
    const mockScript: Script = {
      id: 'scr-1',
      episodeId: 'eps-1',
      version: 1,
      content: 'SCENE 1: LUNA solder boots.',
      scenes: [
        {
          id: 'sce-1',
          sceneNumber: 1,
          locationId: 'loc-workshop',
          timeOfDay: 'day',
          description: 'Int. Workshop',
          beats: [],
          shots: [
            {
              id: 'sht-1',
              sceneId: 'sce-1',
              shotNumber: 1,
              durationSeconds: 4,
              shotType: 'Medium Shot',
              cameraAngle: 'Eye Level',
              cameraMovement: 'Static',
              compositionDescription: '',
              subjectDescription: '',
              actionDescription: 'Luna walks on the ceiling.',
              dialogue: {
                characterId: 'char-luna',
                text: 'Just one more solder...',
                voiceId: 'voice-luna',
                emotion: 'focused'
              },
              promptText: 'Luna soldering boot',
              productionMethod: 'talking-character',
              providerName: 'MockAI',
              modelName: 'MockImageGen-v2',
              estimatedCostCredits: 1.0,
              status: 'pending'
            }
          ]
        }
      ],
      createdAt: new Date()
    };

    const mockCharacters: Character[] = [
      {
        id: 'char-luna',
        showId: 'shw-1',
        name: 'Luna',
        aliases: [],
        role: 'primary',
        age: 17,
        biography: 'Mechanic',
        personalityTraits: [],
        appearance: { height: "5'4\"", build: 'slender', hair: 'dark', eyes: 'dark', clothingStyle: 'jumpsuit', mannerisms: [] },
        referenceImageUrls: [],
        lockedTraits: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockLocations: Location[] = [
      { id: 'loc-workshop', showId: 'shw-1', name: 'Luna\'s Workshop', description: 'steampunk workshop', geography: '', architecture: '', referenceImageUrls: [], storySignificance: '' }
    ];

    const mockFacts = [
      {
        id: 'fct-1',
        showId: 'shw-1',
        subject: 'char-luna',
        predicate: 'status',
        object: 'dead', // MARKED AS DEAD
        status: 'approved' as const,
        effectiveStoryDate: 'S1E1',
        isPrivate: false,
        knownByCharacters: ['char-luna'],
        confidence: 1.0,
        version: 1,
        createdBy: 'usr-default'
      }
    ];

    // Continuity Checker should flag a critical error because Luna is dead but active in the scene
    const report = ContinuityChecker.validateScript(mockScript, mockFacts, mockCharacters, mockLocations, [], []);
    const criticalFinding = report.findings.find(f => f.severity === 'critical');

    if (criticalFinding && criticalFinding.description.includes('DEAD')) {
      console.log(`✔ [canon-engine] ContinuityChecker successfully flagged dead character action. Score: ${report.overallScore}/100`);
    } else {
      console.log("❌ [canon-engine] ContinuityChecker failed to flag dead character.");
      passed = false;
    }
  } catch (e: any) {
    console.error("❌ [canon-engine] Error running test:", e.message);
    passed = false;
  }

  // --- 3. Test CostAwareRouter (pricing-engine) ---
  try {
    const list = ProviderRegistry.getPricingList();
    const health = ProviderRegistry.getHealthMetrics();
    
    const route = CostAwareRouter.selectProviderRoute(
      {
        capability: 'video-generation',
        durationSeconds: 4,
        resolution: '720p',
        qualityTier: 'STANDARD',
        remainingEpisodeBudget: 50.0
      },
      list,
      health,
      {}
    );

    if (route.selectedPricing && route.estimatedCostCredits > 0) {
      console.log(`✔ [pricing-engine] CostAwareRouter successfully scored route. Cost: ${route.estimatedCostCredits} cr, Margin: ${route.grossMarginPercentage}%`);
    } else {
      console.log("❌ [pricing-engine] CostAwareRouter selected invalid route.");
      passed = false;
    }
  } catch (e: any) {
    console.error("❌ [pricing-engine] Error running test:", e.message);
    passed = false;
  }

  console.log("==================================================");
  if (passed) {
    console.log("       ALL VERIFICATION TESTS COMPLETED: PASSED   ");
    process.exit(0);
  } else {
    console.log("       VERIFICATION TESTS FAILED                 ");
    process.exit(1);
  }
}

runValidationSuite();
