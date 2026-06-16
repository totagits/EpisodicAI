import {
  Script,
  CanonFact,
  QualityReport,
  QualityFinding,
  Character,
  Location,
  StoryObject,
  StoryThread
} from '@episodic-ai/types';

export class ContinuityChecker {
  /**
   * Validates a screenplay draft against the established canon facts.
   * Returns a detailed QualityReport with findings and an overall continuity score.
   */
  public static validateScript(
    script: Script,
    canonFacts: CanonFact[],
    characters: Character[],
    locations: Location[],
    objects: StoryObject[],
    threads: StoryThread[]
  ): QualityReport {
    const findings: QualityFinding[] = [];
    let scoreMultiplier = 1.0;

    // Build indexing lookup structures
    const characterMap = new Map<string, Character>(characters.map(c => [c.id, c]));
    const characterNameMap = new Map<string, Character>(
      characters.map(c => [c.name.toLowerCase(), c])
    );
    const locationMap = new Map<string, Location>(locations.map(l => [l.id, l]));
    const objectMap = new Map<string, StoryObject>(objects.map(o => [o.id, o]));

    // 1. Check Character Statuses (e.g. Life and Injuries)
    const deadCharacterIds = new Set<string>();
    const injuredCharacterMap = new Map<string, string>(); // ID -> description

    canonFacts.forEach(fact => {
      if (fact.status === 'approved') {
        if (fact.predicate === 'status' && fact.object.toLowerCase() === 'dead') {
          deadCharacterIds.add(fact.subject);
        }
        if (fact.predicate === 'injured' && fact.object) {
          injuredCharacterMap.set(fact.subject, fact.object);
        }
      }
    });

    // Parse the script scenes to evaluate character dialogue and actions
    script.scenes.forEach(scene => {
      // Check if scene location exists
      const loc = locationMap.get(scene.locationId);
      if (!loc) {
        findings.push({
          category: 'script_continuity',
          severity: 'medium',
          description: `Scene ${scene.sceneNumber} uses an unregistered location ID: "${scene.locationId}".`,
          suggestedFix: 'Register this location in the Location Registry before starting production.'
        });
      }

      scene.shots.forEach(shot => {
        if (shot.dialogue) {
          const charId = shot.dialogue.characterId;
          const char = characterMap.get(charId);

          if (!char) {
            findings.push({
              category: 'script_continuity',
              severity: 'medium',
              description: `Scene ${scene.sceneNumber}, Shot ${shot.shotNumber} references character ID "${charId}" which is not in the Character Registry.`,
              suggestedFix: 'Register this character in the Cast list.'
            });
            return;
          }

          // Check if dead character is speaking
          if (deadCharacterIds.has(charId)) {
            findings.push({
              category: 'script_continuity',
              severity: 'critical',
              description: `Character "${char.name}" is marked as DEAD in canon, but speaks in Scene ${scene.sceneNumber}.`,
              suggestedFix: 'Revise script to remove character, write a flashback scene, or request a Retcon approval.'
            });
            scoreMultiplier *= 0.4; // Heavy penalty
          }

          // Check if injured character behaves inconsistent with injuries
          const injury = injuredCharacterMap.get(charId);
          if (injury && shot.actionDescription.toLowerCase().includes('run') && injury.toLowerCase().includes('broken leg')) {
            findings.push({
              category: 'script_continuity',
              severity: 'high',
              description: `Character "${char.name}" has a canon injury ("${injury}"), but is executing actions requiring high leg mobility ("${shot.actionDescription}") in Scene ${scene.sceneNumber}.`,
              suggestedFix: 'Alter action description to respect the character\'s physical limitations.'
            });
            scoreMultiplier *= 0.8;
          }

          // 2. Character Knowledge Check
          // Extract keywords or topics from dialogue to check if character reveals secrets they don't know
          canonFacts.forEach(fact => {
            if (fact.isPrivate && !fact.knownByCharacters.includes(charId)) {
              // Character doesn't know this private fact
              const secretKeyword = fact.object.toLowerCase();
              const dialogueLower = shot.dialogue!.text.toLowerCase();

              if (dialogueLower.includes(secretKeyword) && secretKeyword.length > 4) {
                findings.push({
                  category: 'script_continuity',
                  severity: 'high',
                  description: `Character "${char.name}" mentions secret information ("${fact.object}") in Scene ${scene.sceneNumber} that they are not recorded as knowing in the character knowledge ledger.`,
                  suggestedFix: `Have another character reveal the secret to "${char.name}" earlier in the script, or edit the dialogue.`
                });
                scoreMultiplier *= 0.75;
              }
            }
          });
        }
      });
    });

    // 3. Check for unresolved high-priority story threads
    threads.forEach(thread => {
      if (thread.importance === 'high' && thread.status === 'active') {
        // Simple mock search in script content to see if thread topic is mentioned
        const topicLower = thread.name.toLowerCase();
        const scriptLower = script.content.toLowerCase();

        if (!scriptLower.includes(topicLower)) {
          findings.push({
            category: 'script_continuity',
            severity: 'low',
            description: `Active High-Priority story thread "${thread.name}" is not referenced in this episode.`,
            suggestedFix: 'Ensure this thread is addressed, or explicitly transfer it to next episode objectives.'
          });
        }
      }
    });

    // Calculate overall score (starts at 100, drops with findings)
    let baseScore = 100;
    findings.forEach(f => {
      if (f.severity === 'critical') baseScore -= 40;
      else if (f.severity === 'high') baseScore -= 20;
      else if (f.severity === 'medium') baseScore -= 10;
      else baseScore -= 5;
    });

    const overallScore = Math.max(0, Math.min(100, Math.round(baseScore * scoreMultiplier)));

    return {
      id: `qc-rep-${Math.random().toString(36).substr(2, 9)}`,
      targetId: script.id,
      targetType: 'script',
      overallScore,
      findings,
      createdAt: new Date()
    };
  }
}

export class CharacterKnowledgeGraph {
  private graph: Map<string, Set<string>> = new Map(); // CharacterID -> Set of FactIDs

  constructor(facts: CanonFact[]) {
    facts.forEach(fact => {
      fact.knownByCharacters.forEach(charId => {
        if (!this.graph.has(charId)) {
          this.graph.set(charId, new Set());
        }
        if (fact.status === 'approved') {
          this.graph.get(charId)!.add(fact.id);
        }
      });
    });
  }

  public doesCharacterKnow(characterId: string, factId: string): boolean {
    return this.graph.get(characterId)?.has(factId) || false;
  }

  public getKnownFacts(characterId: string): string[] {
    return Array.from(this.graph.get(characterId) || []);
  }

  public recordKnowledgeGain(characterId: string, factId: string): void {
    if (!this.graph.has(characterId)) {
      this.graph.set(characterId, new Set());
    }
    this.graph.get(characterId)!.add(factId);
  }
}

export class TimelineEngine {
  /**
   * Check if timeline transitions are possible based on geographical travel times
   * and day/night transitions.
   */
  public static verifyTransition(
    fromLocation: Location,
    toLocation: Location,
    timeSpentMinutes: number,
    travelTimeMinutes: number
  ): { possible: boolean; reason?: string } {
    if (timeSpentMinutes < travelTimeMinutes) {
      return {
        possible: false,
        reason: `Insufficient travel time between "${fromLocation.name}" and "${toLocation.name}". Requires at least ${travelTimeMinutes} minutes, but only ${timeSpentMinutes} minutes elapsed.`
      };
    }
    return { possible: true };
  }

  /**
   * Returns estimated character age based on birth date/event and current story date.
   */
  public static calculateAge(birthStoryYear: number, currentStoryYear: number): number {
    return currentStoryYear - birthStoryYear;
  }
}
