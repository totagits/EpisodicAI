from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import time

app = FastAPI(
    title="EpisodicAI - AI Orchestrator Service",
    description="Multi-agent writers' room and series production orchestration engine",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Request/Response Schema Models ---

class GenesisRequest(BaseModel):
    title: str
    premise: str
    concept: str
    genre: str
    target_audience: str
    age_rating: str

class BibleSummaryResponse(BaseModel):
    summary: str
    world_rules: List[str]
    themes: List[str]
    forbidden_contradictions: List[str]
    season_opportunities: List[str]
    visual_identity: str
    voice_identity: str

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

class SeasonPlanResponse(BaseModel):
    season_question: str
    central_conflict: str
    summary: str
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

class SceneSchema(BaseModel):
    scene_number: int
    location_id: str
    time_of_day: str
    description: str
    beats: List[str]
    shots: List[ShotSchema]

class ScreenplayResponse(BaseModel):
    title: str
    content: str
    scenes: List[SceneSchema]

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


# --- Agent Endpoints ---

@app.post("/agents/genesis", response_model=BibleSummaryResponse)
async def genesis_agent(request: GenesisRequest):
    """
    Show Genesis Agent: Generates a complete Series Bible summary and rules
    based on high-level show guidelines.
    """
    time.sleep(0.5) # Simulate LLM thinking delay
    
    # Custom rule generation based on genre
    rules = [
        "The universe operates under strict logical consistency.",
        "Characters must experience real, persistent consequences.",
        "Magical or technological solutions cannot bypass emotional resolutions."
    ]
    if "sci" in request.genre.lower():
        rules.extend([
            "Faster-than-light travel requires massive gravitational distortion fields.",
            "AI entities are legally bound by the Sentience Registry Act."
        ])
    elif "fantasy" in request.genre.lower():
        rules.extend([
            "Magic drains the caster's physical vitality relative to the scale of the spell.",
            "Ancient runes must be inscribed physically to channel power."
        ])

    return BibleSummaryResponse(
        summary=f"In the fictional universe of '{request.title}', a core struggle exists where {request.premise}. The series explores themes of choice and identity.",
        world_rules=rules,
        themes=["Identity", "Choice vs Destiny", "Technology's toll"],
        forbidden_contradictions=[
            "No character can return from death unless a specific resurrection machine is introduced with cost.",
            "Factions cannot break active treaties without clear logical provocation."
        ],
        season_opportunities=[
            "Exploration of the outer rim coordinates",
            "Infiltration of the central governmental council"
        ],
        visual_identity="High contrast cinematic, dark-toned backgrounds, violet ambient accents, clean lens flares.",
        voice_identity="Naturalistic, distinct dialects, dynamic range with soft sound design overlays."
    )

@app.post("/agents/season", response_model=SeasonPlanResponse)
async def season_architect(request: SeasonRequest):
    """
    Season Architect: Constructs a 3-episode mini-season outline complete with
    arcs, cliffhangers, and plot objectives.
    """
    time.sleep(0.5)
    
    episodes = [
        EpisodeOutline(
            number=1,
            title="The Ground Zero",
            objectives=["Introduce the protagonist Luna", "Showcase the activation of the boot prototype", "Set up the Sky Guard threat"],
            summary="Luna activates her illegal gravity boots in the workshop, sparking a warning signal to the local authorities.",
            climax="Luna walks on the ceiling to escape a patrol sweep just in time."
        ),
        EpisodeOutline(
            number=2,
            title="Horizontal Horizon",
            objectives=["Develop the alliance between Luna and Leo", "Infiltrate the power generator site", "Recover a raw energy battery"],
            summary="Luna and Leo navigate the lower structural grids of the city to steal an energy core needed to power the boots long-term.",
            climax="Leo is captured by the Sky Guard while Luna escapes with the battery."
        ),
        EpisodeOutline(
            number=3,
            title="The Fall Upward",
            objectives=["Rescue Leo from the Sky Guard Citadel", "Execute a high-altitude jump", "Resolve the season cliffhanger"],
            summary="Luna uses the fully powered gravity boots to ascend to the Sky Guard Citadel, rescue Leo, and make an escape into the clouds.",
            climax="They fall upwards into the upper cloud layer, discovering an entire floating city they didn't know existed."
        )
    ]

    return SeasonPlanResponse(
        season_question="Can a mechanic break the bonds of gravity to free her partner?",
        central_conflict="Luna's belief-driven technology vs the Sky Guard's monopoly on vertical movement",
        summary="A high-altitude sci-fi adventure detailing one girl's rise against gravitational class systems.",
        episodes=episodes
    )

@app.post("/agents/screenplay", response_model=ScreenplayResponse)
async def screenplay_writer(request: ScreenplayRequest):
    """
    Screenplay Writer: Takes an outline and writes a structured screenplay
    containing detailed scene descriptors, dialogue lines, and shot listings.
    """
    time.sleep(0.5)
    
    # Mocking standard screenwriting formatting
    content = f"""
    SCENE 1 - INT. LUNA'S WORKSHOP - DAY
    
    LUNA (17, messy hair) is working on a pair of metallic leather boots. Sparks fly from the wires.
    
    LUNA
    (muttering)
    Just one more solder...
    
    LEO (18, cautious) watches from the doorway, arms crossed.
    
    LEO
    Luna, they'll detect that power surge.
    """

    scenes = [
        SceneSchema(
            scene_number=1,
            location_id="loc-workshop",
            time_of_day="day",
            description="Luna's cluttered workshop in the lower slums.",
            beats=["Luna adjusts the boot", "Leo enters with warning"],
            shots=[
                ShotSchema(
                    shot_number=1,
                    duration_seconds=4,
                    shot_type="Medium Shot",
                    camera_angle="Eye Level",
                    camera_movement="Static",
                    composition="Luna at her cluttered workbench, soldering.",
                    subject="Luna, wearing goggles and focusing intently.",
                    action="Luna solders a copper wire onto a heavy leather boot.",
                    dialogue=DialogueLineSchema(
                        character_id="char-luna",
                        text="Just one more solder and it's active.",
                        emotion="focused"
                    ),
                    prompt_text="Medium shot of teenage girl mechanic soldering a glowing steampunk boot in a dusty workshop, volumetric lighting, cinematic.",
                    production_method="talking-character"
                ),
                ShotSchema(
                    shot_number=2,
                    duration_seconds=3,
                    shot_type="Close Up",
                    camera_angle="Low Angle",
                    camera_movement="Zoom",
                    composition="Close up of the boot sole emitting a soft blue vapor.",
                    subject="Retro-futuristic boot with copper coils.",
                    action="The boot begins to hum and rises slightly off the surface.",
                    prompt_text="Close up on a steampunk boot on a workbench as it sparks blue light and hovers slightly, smoke, depth of field.",
                    production_method="image-to-video"
                )
            ]
        )
    ]

    return ScreenplayResponse(
        title=request.outline.title,
        content=content.strip(),
        scenes=scenes
    )

@app.post("/agents/canon-extractor", response_model=CanonExtractionResponse)
async def canon_extractor(request: ExtractRequest):
    """
    Canon Extractor: Parses script content to extract new facts, relationship shifts,
    and items discovered.
    """
    return CanonExtractionResponse(
        facts=[
            ExtractedFact(subject="Luna", predicate="owns", object="gravity boots", is_private=False, confidence=0.98),
            ExtractedFact(subject="Luna", predicate="livesIn", object="Lower Slums", is_private=False, confidence=0.95),
            ExtractedFact(subject="Sky Guard", predicate="oppresses", object="Lower Slums", is_private=False, confidence=0.90)
        ],
        events=[
            ExtractedEvent(type="ItemActivated", description="Luna activated the gravity boot prototype.", impacted_subjects=["Luna", "gravity boots"])
        ]
    )

@app.post("/agents/safety", response_model=SafetyResponse)
async def safety_reviewer(request: SafetyRequest):
    """
    Safety Agent: Moderates script text to prevent copyrighted materials, hate, or abuse.
    """
    flagged = False
    categories = []
    
    # Mock safety check
    lower_text = request.text.lower()
    if "mickey mouse" in lower_text or "marvel" in lower_text:
        flagged = True
        categories.append("copyright_violation")
    if "hack" in lower_text:
        flagged = True
        categories.append("illegal_conduct")

    return SafetyResponse(
        flagged=flagged,
        categories=categories,
        score=0.95 if flagged else 0.02
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
