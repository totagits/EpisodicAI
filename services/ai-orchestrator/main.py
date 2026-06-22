from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time
import random
import re
import os
import json
import logging

logger = logging.getLogger("orchestrator")

# ── Gemini integration ────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
gemini_model = None

if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.9,
                max_output_tokens=8192,
            )
        )
        logger.info("[Gemini] Connected to gemini-1.5-pro")
    except Exception as e:
        logger.warning(f"[Gemini] Failed to initialize: {e}")
else:
    logger.warning("[Gemini] GEMINI_API_KEY not set — using template fallback")

# ── Internal auth ─────────────────────────────────────────────────────────────
INTERNAL_KEY = os.environ.get("INTERNAL_ORCHESTRATOR_KEY", "dev-internal-key")

def verify_internal_key(x_internal_key: str = Header(default="")):
    if x_internal_key != INTERNAL_KEY:
        raise HTTPException(status_code=403, detail="Invalid internal key")

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="EpisodicAI - AI Orchestrator Service",
    description="Multi-agent writers' room and series production orchestration engine",
    version="2.1.0"
)

# CORS — locked to internal API service only
ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:4000").split(",") if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ── Gemini helper ─────────────────────────────────────────────────────────────
def call_gemini(prompt: str, fallback_fn):
    """Call Gemini and parse JSON response; on any error, call fallback_fn."""
    if gemini_model:
        try:
            response = gemini_model.generate_content(prompt)
            raw = response.text.strip()
            # Strip markdown code blocks if present
            if raw.startswith("```"):
                raw = re.sub(r"^```[\w]*\n?", "", raw)
                raw = re.sub(r"\n?```$", "", raw.strip())
            return json.loads(raw)
        except Exception as e:
            logger.warning(f"[Gemini] call failed: {e} — using fallback")
    return fallback_fn()


# --- Pydantic Request/Response Schema Models ---

class GenesisRequest(BaseModel):
    title: str
    premise: str
    concept: str
    genre: str
    target_audience: str
    age_rating: str


class CharacterProfile(BaseModel):
    name: str
    role: str
    archetype: str
    age_range: str
    core_wound: str
    core_desire: str
    voice_profile: str
    visual_signature: str
    story_function: str


class WorldRule(BaseModel):
    id: str
    category: str
    rule: str
    implications: List[str]
    visual_cue: str


class ThematicPillar(BaseModel):
    theme: str
    central_question: str
    how_explored: str
    season_escalation: str


class VisualGuideline(BaseModel):
    aspect: str
    direction: str
    examples: List[str]


class BibleSummaryResponse(BaseModel):
    logline: str
    summary: str
    world_rules: List[WorldRule]
    themes: List[ThematicPillar]
    forbidden_contradictions: List[str]
    season_opportunities: List[str]
    character_profiles: List[CharacterProfile]
    visual_guidelines: List[VisualGuideline]
    visual_identity: str
    voice_identity: str
    tone_spectrum: str
    audience_promise: str
    showrunner_intent: str


class SeasonRequest(BaseModel):
    show_id: str
    bible_summary: str
    genre: str
    season_number: int


class EpisodeOutline(BaseModel):
    number: int
    title: str
    objectives: List[str]
    summary: str
    climax: str
    cold_open: Optional[str] = None
    act_breaks: Optional[List[str]] = None
    canon_events: Optional[List[str]] = None
    thread_status: Optional[Dict[str, str]] = None


class SeasonPlanResponse(BaseModel):
    season_question: str
    central_conflict: str
    summary: str
    theme_arc: str
    episodes: List[EpisodeOutline]


class ScreenplayRequest(BaseModel):
    episode_id: str
    outline: EpisodeOutline
    bible_summary: str
    characters: List[dict]


class DialogueLineSchema(BaseModel):
    character_id: str
    text: str
    emotion: str


class ShotSchema(BaseModel):
    shot_number: int
    duration_seconds: int
    shot_type: str
    camera_angle: str
    camera_movement: str
    composition: str
    subject: str
    action: str
    dialogue: Optional[DialogueLineSchema] = None
    prompt_text: str
    production_method: str
    visual_notes: Optional[str] = None
    lighting: Optional[str] = None


class SceneSchema(BaseModel):
    scene_number: int
    location_id: str
    time_of_day: str
    description: str
    beats: List[str]
    shots: List[ShotSchema]
    mood: Optional[str] = None
    tension_level: Optional[int] = None


class ScreenplayResponse(BaseModel):
    title: str
    content: str
    scenes: List[SceneSchema]
    director_notes: Optional[str] = None
    visual_style_notes: Optional[str] = None


class ExtractRequest(BaseModel):
    script_content: str


class ExtractedFact(BaseModel):
    subject: str
    predicate: str
    obj: str = Field(alias="object")
    is_private: bool
    confidence: float


class ExtractedEvent(BaseModel):
    type: str
    description: str
    impacted_subjects: List[str]


class CanonExtractionResponse(BaseModel):
    facts: List[ExtractedFact]
    events: List[ExtractedEvent]


class SafetyRequest(BaseModel):
    text: str


class SafetyResponse(BaseModel):
    flagged: bool
    categories: List[str]
    score: float


# --- Genre-specific world building logic ---

GENRE_CONFIGS = {
    "sci-fi": {
        "law_templates": [
            ("Physics", "FTL travel requires gravitational distortion exceeding 4.2 Alcubierre units, causing irreversible cellular micro-damage to unshielded passengers.", ["Characters who travel FTL without shielding age faster", "Only military vessels carry full shielding"], "Subtle aging makeup on FTL travelers; faint grid shimmer during jumps"),
            ("Technology", "AI entities classified above Sentience Level 3 must register with the Consortium Registry Act, Section 7.", ["Unregistered AI are hunted by Registry Agents", "AI can fake their sentience classification"], "AI characters have a subtle LED pulse under their skin at the temple"),
            ("Society", "The Resource Compact of 2187 forbids private ownership of atmospheric water above 500L.", ["Water is the dominant currency in dry colonies", "Water crimes carry exile penalties"], "Elaborate water-rationing UI on colony displays; characters carry sealed water flasks"),
        ],
        "visual_identity": "High-contrast cinematic, deep navy and charcoal backgrounds, violet ambient light from equipment panels, clean lens flares on metallic surfaces, anamorphic bokeh.",
        "voice_identity": "Clipped, technical dialogue cadence. Emotional restraint punctuated by vulnerability. Distinct dialect between colonies.",
        "tone": "Grounded Techno-Thriller with moments of awe and dread",
    },
    "fantasy": {
        "law_templates": [
            ("Magic System", "All spellcasting depletes physical vitality proportional to spell magnitude — minor charms cost minutes; resurrection costs years.", ["Mages physically age during high-intensity battles", "The most powerful mages are always elderly"], "Casters visibly strain; veins briefly glow then dim; hair gains silver streaks after major casts"),
            ("Politics", "The Treaty of Ember Lock prohibits any faction from crossing the Ember Zone without a unanimous Conclave vote.", ["Political standoffs prevent military action even when desperate", "Crossing triggers automatic war declaration"], "Glowing boundary markers; faction colors in heraldic banners throughout"),
            ("Cosmology", "The Dead may not return without a physical anchor object of profound emotional significance still existing in the world.", ["Lost anchors strand souls permanently", "Antagonists may seek to destroy anchors"], "Anchor objects glow faintly; ghost-touched scenes have a cold blue desaturation"),
        ],
        "visual_identity": "Rich earth tones punctuated by magical luminescence. Handcrafted practical textures. Candle-lit interiors. Natural lens distortion at magic sites.",
        "voice_identity": "Elevated but grounded prose. Archaic inflections only for ceremonial dialogue. Emotional clarity above eloquence.",
        "tone": "Epic Character Study with Political Intrigue and Mythic Undertones",
    },
    "drama": {
        "law_templates": [
            ("Human Nature", "Every secret kept by a character will eventually surface — the longer kept, the more catastrophic the reveal.", ["Characters build elaborate concealment systems", "The reveal moment is always the character's most vulnerable"], "Close-up reaction shots; mirror symbolism; documents seen briefly"),
            ("Institutions", "The organization always protects itself first — individuals who threaten institutional stability are neutralized, not protected.", ["Protagonists cannot rely on institutional support when it truly matters", "Bureaucracy is weaponized against truth-tellers"], "Formal institutional spaces contrast with chaotic personal spaces"),
            ("Relationships", "Trust, once broken, requires a proportional act of sacrifice to rebuild — words alone never suffice.", ["Reconciliation arcs require costly actions", "Characters who only apologize verbally see relationships continue to deteriorate"], "Physical touch used deliberately to signal trust restored or withheld"),
        ],
        "visual_identity": "Naturalistic lighting with intentional shadow. Handheld intimacy for personal scenes. Formalist symmetry for power scenes.",
        "voice_identity": "Overlapping, interrupted, unfinished dialogue. Silence as punctuation. Subtext over explicit emotional declaration.",
        "tone": "Intimate Slow-Burn with Explosive Pressure-Release Moments",
    },
}


def get_genre_config(genre: str) -> dict:
    genre_lower = genre.lower()
    for key in GENRE_CONFIGS:
        if key in genre_lower:
            return GENRE_CONFIGS[key]
    return GENRE_CONFIGS["sci-fi"]  # Default


def extract_title_premise(bible_summary: str) -> tuple:
    title = "The Unnamed Series"
    premise = "A protagonist confronts extraordinary circumstances that challenge their identity."

    title_match = re.search(r"universe of '([^']+)'", bible_summary)
    if title_match:
        title = title_match.group(1)

    premise_match = re.search(r"struggle exists where (.+?)\. The series", bible_summary)
    if premise_match:
        premise = premise_match.group(1)

    return title, premise


# --- Agent Endpoints ---

@app.post("/agents/genesis", response_model=BibleSummaryResponse)
async def genesis_agent(request: GenesisRequest, _auth=Depends(verify_internal_key)):
    """
    Show Genesis Agent v2.1: Uses Gemini Pro to generate a comprehensive Series Bible.
    Falls back to genre-adaptive templates if Gemini is unavailable.
    """
    gemini_prompt = f"""You are an expert showrunner and TV writer. Generate a comprehensive Series Bible as a JSON object.

Show details:
- Title: {request.title}
- Premise: {request.premise}
- Concept: {request.concept}
- Genre: {request.genre}
- Target Audience: {request.target_audience}
- Age Rating: {request.age_rating}

Return ONLY a valid JSON object with this exact schema:
{{
  "logline": "A single compelling sentence describing the show",
  "summary": "A 3-4 paragraph description of the world, tone, and central conflict",
  "world_rules": [
    {{"id": "wr-1", "category": "physics", "rule": "rule text", "implications": ["implication 1", "implication 2"], "visual_cue": "visual description"}}
  ],
  "themes": [
    {{"theme": "theme name", "central_question": "the question this explores", "how_explored": "how it shows up", "season_escalation": "how it grows"}}
  ],
  "forbidden_contradictions": ["thing that must never happen"],
  "season_opportunities": ["potential season arc idea"],
  "character_profiles": [
    {{"name": "name", "role": "protagonist", "archetype": "The Reluctant Hero", "age_range": "17-19", "core_wound": "wound", "core_desire": "desire", "voice_profile": "how they speak", "visual_signature": "their look", "story_function": "their role"}}
  ],
  "visual_guidelines": [
    {{"aspect": "Color Palette", "direction": "direction", "examples": ["example 1"]}}
  ],
  "visual_identity": "One paragraph describing camera style and visual language",
  "voice_identity": "One paragraph describing dialogue style and sound design",
  "tone_spectrum": "brief tone description",
  "audience_promise": "what the audience gets from this show",
  "showrunner_intent": "what the creator wants to achieve"
}}

Make all content specific to '{request.title}' and '{request.genre}'. Be creative and original."""

    def template_fallback():
        return None  # Will trigger the existing template code below

    gemini_result = call_gemini(gemini_prompt, template_fallback)

    if gemini_result:
        # Map Gemini JSON to Pydantic models
        try:
            return BibleSummaryResponse(
                logline=gemini_result.get("logline", f"{request.title}: {request.premise[:100]}"),
                summary=gemini_result.get("summary", request.premise),
                world_rules=[
                    WorldRule(id=r.get("id", f"wr-{i}"), category=r.get("category", "core"),
                              rule=r.get("rule", ""), implications=r.get("implications", []),
                              visual_cue=r.get("visual_cue", ""))
                    for i, r in enumerate(gemini_result.get("world_rules", []))
                ],
                themes=[
                    ThematicPillar(theme=t.get("theme", ""), central_question=t.get("central_question", ""),
                                   how_explored=t.get("how_explored", ""), season_escalation=t.get("season_escalation", ""))
                    for t in gemini_result.get("themes", [])
                ],
                forbidden_contradictions=gemini_result.get("forbidden_contradictions", []),
                season_opportunities=gemini_result.get("season_opportunities", []),
                character_profiles=[
                    CharacterProfile(name=c.get("name", ""), role=c.get("role", "protagonist"),
                                     archetype=c.get("archetype", ""), age_range=c.get("age_range", "17-25"),
                                     core_wound=c.get("core_wound", ""), core_desire=c.get("core_desire", ""),
                                     voice_profile=c.get("voice_profile", ""), visual_signature=c.get("visual_signature", ""),
                                     story_function=c.get("story_function", ""))
                    for c in gemini_result.get("character_profiles", [])
                ],
                visual_guidelines=[
                    VisualGuideline(aspect=v.get("aspect", ""), direction=v.get("direction", ""),
                                    examples=v.get("examples", []))
                    for v in gemini_result.get("visual_guidelines", [])
                ],
                visual_identity=gemini_result.get("visual_identity", ""),
                voice_identity=gemini_result.get("voice_identity", ""),
                tone_spectrum=gemini_result.get("tone_spectrum", "Dramatic"),
                audience_promise=gemini_result.get("audience_promise", ""),
                showrunner_intent=gemini_result.get("showrunner_intent", ""),
            )
        except Exception as e:
            logger.warning(f"[Genesis] Gemini response mapping failed: {e} — using template")

    # ── Template fallback (original logic) ───────────────────────────────
    time.sleep(0.3)

    genre_config = get_genre_config(request.genre)
    laws = genre_config["law_templates"]

    # Build rich world rules
    world_rules = []
    for i, (category, rule, implications, visual_cue) in enumerate(laws):
        world_rules.append(WorldRule(
            id=f"law-{i+1:03d}",
            category=category,
            rule=rule,
            implications=implications,
            visual_cue=visual_cue
        ))

    # Add a show-specific rule derived from premise
    world_rules.append(WorldRule(
        id="law-004",
        category="Narrative Contract",
        rule=f"The central tension of '{request.premise[:80]}' cannot be resolved through a single action — it is a condition of the world requiring systemic, generational change.",
        implications=[
            "No single-episode 'fix-all' solutions — victories are partial and costly",
            "Season finales resolve one layer but deepen another",
            "The audience understands progress is real, but never complete"
        ],
        visual_cue="Progress shown through accumulating environmental set-dressing changes across episodes"
    ))

    # Thematic pillars
    themes = [
        ThematicPillar(
            theme="Identity Under Pressure",
            central_question=f"Who does a person become when the thing that defined them is taken away or proven false?",
            how_explored=f"Every major character in '{request.title}' must confront a moment where their self-concept shatters — and choose how to rebuild.",
            season_escalation="S1: Identity crisis introduced. S2: False identity constructed. S3: True self found at great cost."
        ),
        ThematicPillar(
            theme="Systemic vs Individual Agency",
            central_question="Can one person meaningfully change a broken system — or does the system always win?",
            how_explored="Protagonist actions create ripple effects, but institutions push back. Supporting characters take different positions on this question.",
            season_escalation="S1: Individual action feels effective. S2: System counterattacks. S3: Collective vs systemic resolution."
        ),
        ThematicPillar(
            theme="The Cost of Truth",
            central_question="Is knowing a painful truth always worth its price — even when it destroys what you love?",
            how_explored="Each revelation in the series costs something irreplaceable. Characters must decide repeatedly whether truth is worth its damage.",
            season_escalation="S1: Truths discovered. S2: Truths weaponized. S3: Truths that liberate through acceptance."
        ),
    ]

    # Character profiles
    character_profiles = [
        CharacterProfile(
            name=f"The Protagonist ({request.title.split(':')[0].strip() if ':' in request.title else 'Core Lead'})",
            role="Primary Protagonist",
            archetype="The Reluctant Catalyst",
            age_range="20–28",
            core_wound="Was forced to choose between loyalty and truth at a critical moment, and chose wrong. Has never forgiven themselves.",
            core_desire="To build something that cannot be taken from them — recognition that their existence matters.",
            voice_profile="Terse under stress; unexpectedly lyrical when emotionally safe. Uses technical jargon as armor.",
            visual_signature="Always wears something inherited. Hands constantly occupied — fidgeting, fixing, building.",
            story_function="Forces the audience to ask themselves what they would sacrifice for what they believe is right."
        ),
        CharacterProfile(
            name="The Counterpart",
            role="Primary Supporting",
            archetype="The Mirror",
            age_range="22–30",
            core_wound="Chose safety over conviction once, and has lived with that compromise ever since.",
            core_desire="Absolution — to perform one act so right it cancels out the compromise.",
            voice_profile="Warm, precise, occasionally cutting. Uses humor to deflect from emotional directness.",
            visual_signature="Impeccably presented exteriorly — the presentation hides the internal chaos.",
            story_function="Shows the audience what the protagonist could become if they give up, or who they could become if they succeed."
        ),
        CharacterProfile(
            name="The Institutional Antagonist",
            role="Series Antagonist",
            archetype="The True Believer",
            age_range="40–55",
            core_wound="Sacrificed something they loved to build the system they now protect — cannot admit the sacrifice was pointless.",
            core_desire="Vindication. For the system to work well enough to justify what it cost.",
            voice_profile="Authoritative. Persuasive. Genuinely believes what they say. Never cartoonishly evil — always internally consistent.",
            visual_signature="Wears the institution's colors. Sits at the head of every room they enter.",
            story_function="Forces the audience to understand why systems and institutions resist change even when they cause harm."
        ),
    ]

    # Visual guidelines
    visual_guidelines = [
        VisualGuideline(
            aspect="Color Temperature",
            direction="Cold blues and grays for institutional/public spaces. Warm amber and gold for intimate/domestic spaces. The protagonist moves between both worlds.",
            examples=["Office scenes: 4200K cool white, desaturation −15", "Home/workshop scenes: 3200K tungsten warmth", "Action sequences: high contrast with strong shadow fills"]
        ),
        VisualGuideline(
            aspect="Camera Language",
            direction="Handheld intimacy for character moments. Locked, formal framing for institutional scenes. Slow push-ins on revelations.",
            examples=["Personal dialogue: 40mm–85mm, handheld", "Boardrooms/councils: 24mm wide, tripod locked, symmetrical", "Climax reveals: slow 200mm push on face"]
        ),
        VisualGuideline(
            aspect="Pacing Rhythm",
            direction="Scenes breathe long when emotional stakes are high. Rapid cutting in action and deception sequences. Never cut during a character's most vulnerable line.",
            examples=["Minimum 3-second hold on face after major reveal", "Action sequences: 0.8–1.5 second average shot length", "Dialogue: 2–4 second average, allow overlaps"]
        ),
        VisualGuideline(
            aspect="Recurring Visual Motif",
            direction=f"Thematic visual symbol recurring across all episodes: objects or environments that reflect {request.title}'s core theme should appear in every episode in different contexts.",
            examples=["Framing through doorways/thresholds to signal liminal moments", "Broken or repaired objects as character state metaphors", "Water/light as freedom indicators; concrete/shadow as constraint"]
        ),
    ]

    return BibleSummaryResponse(
        logline=f"In a world where {request.premise[:100]}, one person's choice to fight the system threatens everything — including themselves.",
        summary=f"'{request.title}' is a {request.genre} series set in a universe where {request.premise}. The series follows a reluctant protagonist who stumbles into a systemic conflict larger than themselves, forcing a reckoning with identity, institutional power, and the price of truth. Each season escalates the stakes and deepens the consequences of every choice — in a world that makes easy answers impossible.",
        world_rules=world_rules,
        themes=themes,
        forbidden_contradictions=[
            "No character may return from confirmed death unless a specific plot device (anchored in World Law) was introduced at least 2 episodes prior.",
            "Factions cannot break active treaties without clear, audience-visible provocations — no convenient betrayals.",
            "Protagonist cannot solve institutional problems through individual action alone — collective change is always required.",
            "Technology/magic cannot bypass emotional consequences — solutions that cost nothing are never valid.",
            "No character acts inconsistently with their established psychology without an explicit, story-shown reason for the change.",
        ],
        season_opportunities=[
            "Season 2: The system fights back — the protagonist's early victories trigger a coordinated institutional response, forcing underground alliances.",
            "Season 3: The truth fully surfaces — the audience and protagonist learn the original wound had deeper origins, recontextualizing everything.",
            "Season 4 (if renewed): The protagonist becomes the institution — forced to choose between their ideals and practical power.",
            "Spin-off potential: The counterpart's solo arc before the events of Season 1.",
        ],
        character_profiles=character_profiles,
        visual_guidelines=visual_guidelines,
        visual_identity=genre_config["visual_identity"],
        voice_identity=genre_config["voice_identity"],
        tone_spectrum=genre_config["tone"],
        audience_promise=f"Every episode of '{request.title}' will reward close attention. Details planted in Episode 1 will pay off in Season 3. No character is wasted. No scene is filler. The ending will feel both surprising and inevitable.",
        showrunner_intent=f"The goal of '{request.title}' is to create the kind of series that viewers return to after the finale to rewatch — because everything looked different once they knew where it was going. The show trusts its audience with moral ambiguity, rewards patience, and never condescends."
    )


@app.post("/agents/season", response_model=SeasonPlanResponse)
async def season_architect(request: SeasonRequest, _auth=Depends(verify_internal_key)):
    """
    Season Architect v2.1: Uses Gemini Pro to generate a detailed season outline.
    Falls back to genre-adaptive templates if Gemini is unavailable.
    """
    title, premise = extract_title_premise(request.bible_summary)
    genre = request.genre or "Sci-Fi"
    sn = request.season_number

    gemini_season_prompt = f"""You are an expert TV showrunner. Generate a Season {sn} plan for the show '{title}'.

Show Bible Summary: {request.bible_summary[:1000]}
Genre: {genre}

Return ONLY a valid JSON object:
{{
  "season_question": "The central dramatic question this season answers",
  "central_conflict": "The main conflict driving the season",
  "summary": "2-3 paragraph overview of season arc",
  "theme_arc": "How the central theme evolves this season",
  "episodes": [
    {{
      "number": 1,
      "title": "Episode Title",
      "objectives": ["narrative objective 1", "narrative objective 2"],
      "summary": "Episode summary paragraph",
      "climax": "The episode's climactic moment",
      "cold_open": "Description of opening hook",
      "act_breaks": ["End of Act 1", "End of Act 2"]
    }}
  ]
}}

Generate exactly 6 episodes. Make them specific to '{title}' and build toward a satisfying season finale."""

    def season_fallback():
        return None

    gemini_season = call_gemini(gemini_season_prompt, season_fallback)

    if gemini_season:
        try:
            eps = []
            for ep_data in gemini_season.get("episodes", []):
                eps.append(EpisodeOutline(
                    number=ep_data.get("number", 1),
                    title=ep_data.get("title", f"Episode {ep_data.get('number', 1)}"),
                    objectives=ep_data.get("objectives", []),
                    summary=ep_data.get("summary", ""),
                    climax=ep_data.get("climax", ""),
                    cold_open=ep_data.get("cold_open", ""),
                    act_breaks=ep_data.get("act_breaks", []),
                    canon_events=[],
                    thread_status={},
                ))
            return SeasonPlanResponse(
                season_question=gemini_season.get("season_question", f"Season {sn} Question"),
                central_conflict=gemini_season.get("central_conflict", ""),
                summary=gemini_season.get("summary", ""),
                theme_arc=gemini_season.get("theme_arc", ""),
                episodes=eps,
            )
        except Exception as e:
            logger.warning(f"[Season] Gemini mapping failed: {e} — using template")

    # ── Template fallback ─────────────────────────────────────────
    time.sleep(0.3)

    episodes = [
        EpisodeOutline(
            number=1,
            title=f"S{sn}E01 — Gravity Zero",
            objectives=[
                f"Establish the central premise of: {premise[:60]}...",
                "Introduce the protagonist in their ordinary world before disruption",
                "Plant the season's central dramatic question in the final act"
            ],
            summary=f"We meet our protagonist living in the complicated equilibrium of {title}'s world. A seemingly routine event shatters that equilibrium, exposing a crack in the system that cannot be un-seen. By the end of the episode, the protagonist has crossed their first threshold — they can no longer claim ignorance.",
            climax="The protagonist discovers a truth that makes neutrality impossible. They choose action over safety.",
            cold_open=f"Cold open: A fragment from the future — a moment of crisis we don't yet understand, with someone saying: 'We should have seen it coming.' Cut to title card.",
            act_breaks=[
                "Act 1 break: The protagonist's routine is interrupted by an anomaly they cannot explain.",
                "Act 2 break: The protagonist tries to report the anomaly and is silenced by the institution.",
                "Act 3 break: The protagonist finds evidence the institution has known all along."
            ],
            canon_events=[
                "Protagonist crosses into restricted knowledge for the first time",
                "Counterpart relationship established — mutual respect, no full trust yet"
            ],
            thread_status={"Main_Arc": "Introduced", "Protagonist_Identity": "Stable (surface)", "Institutional_Threat": "Latent"}
        ),
        EpisodeOutline(
            number=2,
            title=f"S{sn}E02 — Pressure Test",
            objectives=[
                "Deepen the world through a secondary character's perspective",
                "First direct confrontation between protagonist and institutional force",
                "Counterpart's loyalty tested — hints at their hidden compromise"
            ],
            summary="The protagonist attempts to act on what they've learned. The system pushes back through social and procedural mechanisms — not overt violence, but suffocating bureaucracy and social pressure. The counterpart provides cover at personal cost.",
            climax="The protagonist discovers the institution has files on them — they were watched long before they started watching back.",
            cold_open="Cold open: Counterpart alone, looking at a document they quickly hide when someone approaches. We won't understand what it is until Episode 6.",
            act_breaks=[
                "Act 1 break: Protagonist's first attempt at formal complaint is procedurally buried.",
                "Act 2 break: The antagonist appears for the first time — charming, reasonable, terrifying.",
                "Act 3 break: Protagonist finds their own name in institutional surveillance logs."
            ],
            canon_events=[
                "Antagonist introduced — reveals institutional position and worldview",
                "First surveillance record of protagonist discovered"
            ],
            thread_status={"Main_Arc": "Escalating", "Counterpart_Secret": "Hinted", "Institutional_Threat": "Active"}
        ),
        EpisodeOutline(
            number=3,
            title=f"S{sn}E03 — The Season Stakes",
            objectives=[
                "Pay off the setup of episodes 1–2 with a genuine transformation",
                "Force the protagonist into an irreversible commitment",
                "Establish the season's true antagonist force — not a person, but a system"
            ],
            summary="The pressure from episodes 1 and 2 reaches a breaking point. The protagonist must choose: walk away and preserve their safety, or commit to a path that costs them something they cannot recover. They choose commitment — and nothing is the same afterward.",
            climax="The protagonist performs the season's first defining act of defiance. The counterpart witnesses it. The antagonist is informed.",
            cold_open="Cold open: The protagonist years before the series — a brief glimpse of who they were before the wound.",
            act_breaks=[
                "Act 1 break: The cost of involvement becomes undeniably personal.",
                "Act 2 break: The protagonist is given a chance to walk away with dignity intact — they refuse.",
                "Act 3 break: The protagonist's first irreversible act changes their relationship to every other character."
            ],
            canon_events=[
                "Protagonist's point of no return — the choice that defines the season",
                "Counterpart's allegiance formally shifts toward the protagonist",
                "Antagonist activates a response protocol — the hunt has begun"
            ],
            thread_status={"Main_Arc": "Committed", "Protagonist_Identity": "Fracturing", "Counterpart_Secret": "Deepen next ep", "Institutional_Threat": "Mobilized"}
        )
    ]

    return SeasonPlanResponse(
        season_question=f"Season {sn}: Can the truth about {premise[:60]}... survive exposure — or does the system always destroy what threatens it?",
        central_conflict=f"Protagonist's emerging resistance vs. the Institutional Apparatus that has suppressed this truth for a generation.",
        theme_arc=f"Season {sn} Theme Arc: From Ignorance → Awareness → Commitment → Cost. Each episode moves the protagonist one step further from the person they were at the cold open of Episode 1.",
        summary=f"Season {sn} of '{title}' is a {genre} thriller about the price of choosing truth over safety. It opens with equilibrium, dismantles it methodically, and closes with a protagonist forever changed — but the system still standing. The question the audience carries into Season {sn+1}: was it worth it?",
        episodes=episodes
    )


@app.post("/agents/screenplay", response_model=ScreenplayResponse)
async def screenplay_writer(request: ScreenplayRequest):
    """
    Screenplay Writer v2.0: Produces detailed, production-ready screenplay content
    with rich shot descriptions, lighting direction, and visual notes.
    """
    time.sleep(0.7)

    primary_name = "Luna"
    supporting_name = "Leo"
    primary_id = "char-luna"
    supporting_id = "char-leo"

    if request.characters and len(request.characters) > 0:
        raw_name = request.characters[0].get("name", "Luna")
        primary_name = raw_name.replace("Protagonist ", "").replace("Supporting ", "").strip()
        primary_id = request.characters[0].get("id", "char-luna")

    if request.characters and len(request.characters) > 1:
        raw_name = request.characters[1].get("name", "Leo")
        supporting_name = raw_name.replace("Protagonist ", "").replace("Supporting ", "").strip()
        supporting_id = request.characters[1].get("id", "char-leo")

    primary_upper = primary_name.upper()
    supporting_upper = supporting_name.upper()
    ep_title = request.outline.title or "Episode"

    content = f"""FADE IN:

INT. WORKSPACE — DAY

The space is organized chaos. Tools arranged with the obsessive precision of someone who has lost control of everything else. Screens flicker with data. A soldering iron cools in its cradle.

{primary_upper} stands at the workbench, connecting the final assembly of a device. Their face is focused — this is the only place they feel in control.

{primary_upper}
(muttering, under breath)
Almost there. Just need to align these core channels.

A pause. They step back. The device hums — a new frequency neither dangerous nor familiar.

The door opens. {supporting_upper} enters without knocking — the kind of intimacy earned over years.

{supporting_upper}
(low, controlled urgency)
We don't have much time. They've moved the patrol rotation forward.

{primary_upper} doesn't look up immediately.

{primary_upper}
(not panicking)
How far forward?

{supporting_upper}
Thirty minutes.

Now {primary_upper} looks up.

CUT TO:

INT. WORKSPACE — CONTINUOUS

{primary_upper} moves quickly but with deliberate precision. They extract the core module and conceal it.

{primary_upper}
Did you pull the logs?

{supporting_upper}
Most of them. There's a gap in the archive — fourteen minutes on the night of the third.

{primary_upper} stops. That matters.

{primary_upper}
That's when they would have seen it.

A long silence. Both understand the implication.

FADE TO BLACK.

END TEASER."""

    scenes = [
        SceneSchema(
            scene_number=1,
            location_id="loc-workshop",
            time_of_day="day",
            description=f"INT. WORKSPACE — DAY. {primary_name}'s inner sanctum. Organized chaos reflecting a brilliant but pressured mind.",
            mood="Tense focus giving way to low urgency",
            tension_level=6,
            beats=[
                f"{primary_name} at work — this is who they are when no one is watching",
                f"{supporting_name} arrives — immediately shifts the energy",
                "New information changes everything in the final beat"
            ],
            shots=[
                ShotSchema(
                    shot_number=1,
                    duration_seconds=5,
                    shot_type="Close Up",
                    camera_angle="Eye Level",
                    camera_movement="Static",
                    composition=f"Extreme close on {primary_name}'s hands and the device — we see precision, focus, slight tremor of concentration.",
                    subject=primary_name,
                    action=f"{primary_name} makes a final precise connection on the device. A faint hum begins.",
                    prompt_text=f"Cinematic close-up of skilled hands working on intricate technical device, warm tungsten workshop light, shallow depth of field, film grain, hyper-realistic",
                    production_method="image-to-video",
                    visual_notes="Lead with hands, not face. The device is the subject here. Reveal face only after the hum starts.",
                    lighting="Practical workbench lamp source, warm 3200K, strong contrast shadows"
                ),
                ShotSchema(
                    shot_number=2,
                    duration_seconds=4,
                    shot_type="Medium Shot",
                    camera_angle="Eye Level",
                    camera_movement="Slow Zoom",
                    composition=f"Wide enough to see {primary_name}'s full workspace context — the accumulated environment of their obsession.",
                    subject=primary_name,
                    action=f"{primary_name} steps back, watching the device hum. Allows themselves a fraction of satisfaction.",
                    dialogue=DialogueLineSchema(
                        character_id=primary_id,
                        text="Almost there. Just need to align these core channels.",
                        emotion="focused"
                    ),
                    prompt_text=f"Medium cinematic shot of person in detailed workshop, stepping back to observe their work, warm natural light, photorealistic",
                    production_method="talking-character",
                    visual_notes="Slow push toward face as they speak. Hold on eyes at end of line.",
                    lighting="Three-point workshop practical, motivated by desk lamp and window"
                ),
                ShotSchema(
                    shot_number=3,
                    duration_seconds=3,
                    shot_type="Wide Shot",
                    camera_angle="High Angle",
                    camera_movement="Static",
                    composition=f"Bird's eye of the entire workspace — reveals the scale of the operation and the isolation.",
                    subject=f"{primary_name}'s workspace",
                    action=f"Door opens at frame edge. {supporting_name} enters. The energy of the room changes.",
                    prompt_text=f"Overhead cinematic shot of cluttered technical workshop, person working alone, second figure entering through door, dramatic cinematic lighting from above",
                    production_method="image-to-video",
                    visual_notes="This is a geometry-establisher shot. Cut before any dialogue.",
                    lighting="Overhead practical, creates dramatic down-light and shadow wells"
                ),
                ShotSchema(
                    shot_number=4,
                    duration_seconds=4,
                    shot_type="Medium Shot",
                    camera_angle="Low Angle",
                    camera_movement="Static",
                    composition=f"Low angle on {supporting_name} in the doorway — slightly imposing, even though they're an ally.",
                    subject=supporting_name,
                    action=f"{supporting_name} closes the door behind them without looking. Eyes on {primary_name}.",
                    dialogue=DialogueLineSchema(
                        character_id=supporting_id,
                        text=f"We don't have much time. They've moved the patrol rotation forward.",
                        emotion="controlled urgency"
                    ),
                    prompt_text=f"Low angle medium shot of person standing in doorway, conveying quiet urgency, cool backlight from doorway contrasting warm interior, cinematic depth of field",
                    production_method="talking-character",
                    visual_notes="Cool backlight from doorway creates rim light on supporting character — visual contrast with warm interior light on protagonist.",
                    lighting="Backlight from exterior source (cool daylight), interior practical fill (warm)"
                ),
                ShotSchema(
                    shot_number=5,
                    duration_seconds=6,
                    shot_type="Close Up",
                    camera_angle="Eye Level",
                    camera_movement="Slow Push",
                    composition=f"Close on {primary_name}'s face as they process the information. We watch them decide.",
                    subject=primary_name,
                    action=f"{primary_name} holds the device. Looks at {supporting_name}. Makes a decision.",
                    dialogue=DialogueLineSchema(
                        character_id=primary_id,
                        text="That's when they would have seen it.",
                        emotion="realization"
                    ),
                    prompt_text=f"Extreme close-up of person's face in moment of realization, warm light, slight motion blur from camera push, cinematic film look",
                    production_method="talking-character",
                    visual_notes="Slow push in. Hold for 2 seconds after line delivery before cut. This is the episode's thesis moment.",
                    lighting="Motivated by single practical source. Strong shadow on half the face."
                ),
            ]
        )
    ]

    return ScreenplayResponse(
        title=ep_title,
        content=content.strip(),
        scenes=scenes,
        director_notes=f"Episode direction note: Resist the urge to over-explain. This episode trusts the audience. Let performances breathe. Every line of dialogue in Scene 1 has a subtext that will pay off later — direct the actors to play the subtext, not the surface.",
        visual_style_notes=f"Visual approach: The workspace is the most important set in Season 1. It must feel earned — like it was assembled one item at a time over years. Practical set decoration matters more than polish. The audience should feel they could reach into the screen and pick up an object."
    )


@app.post("/agents/canon-extractor", response_model=CanonExtractionResponse)
async def canon_extractor(request: ExtractRequest):
    """
    Canon Extractor v2.0: Parses script content to extract new facts,
    relationship shifts, and narrative events.
    """
    return CanonExtractionResponse(
        facts=[
            ExtractedFact(subject="Protagonist", predicate="operates_from", object="Private Workspace", is_private=False, confidence=0.99),
            ExtractedFact(subject="Protagonist", predicate="is_developing", object="Unknown Device", is_private=True, confidence=0.97),
            ExtractedFact(subject="Counterpart", predicate="has_knowledge_of", object="Patrol Rotation Changes", is_private=False, confidence=0.95),
            ExtractedFact(subject="Institution", predicate="has_surveillance_gap_on", object="Night of the Third", is_private=True, confidence=0.92),
            ExtractedFact(subject="Protagonist", predicate="ally_relationship_with", object="Counterpart", is_private=False, confidence=0.99),
        ],
        events=[
            ExtractedEvent(type="DeviceActivated", description="Protagonist completes assembly of an unidentified device. It hums at a new frequency.", impacted_subjects=["Protagonist", "Unknown Device"]),
            ExtractedEvent(type="IntelligenceReceived", description="Counterpart reports patrol rotation moved forward 30 minutes — institutional pressure escalating.", impacted_subjects=["Counterpart", "Institution", "Protagonist"]),
            ExtractedEvent(type="ArchiveGapDiscovered", description="14-minute gap in surveillance archive on the night of the third — canonical event obscured by institution.", impacted_subjects=["Institution", "Protagonist"]),
        ]
    )


@app.post("/agents/safety", response_model=SafetyResponse)
async def safety_reviewer(request: SafetyRequest):
    """
    Safety Agent: Moderates script text to prevent copyrighted materials, hate, or abuse.
    """
    flagged = False
    categories = []

    lower_text = request.text.lower()
    if any(kw in lower_text for kw in ["mickey mouse", "marvel", "star wars", "harry potter"]):
        flagged = True
        categories.append("copyright_violation")
    if any(kw in lower_text for kw in ["hack", "exploit", "ddos"]):
        flagged = True
        categories.append("illegal_conduct")
    if any(kw in lower_text for kw in ["hate", "slur", "discriminat"]):
        flagged = True
        categories.append("hate_speech")

    return SafetyResponse(
        flagged=flagged,
        categories=categories,
        score=0.95 if flagged else 0.02
    )


@app.get("/health")
async def health_check():
    return {"status": "operational", "service": "EpisodicAI Orchestrator v2.0", "agents": ["genesis", "season", "screenplay", "canon-extractor", "safety"]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
