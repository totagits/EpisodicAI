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
    
    # Try to parse the title and premise from bible_summary
    import re
    title = "Gravity's Belief"
    premise = "A young mechanic discovers boots that control vertical gravity vectors."
    
    title_match = re.search(r"universe of '([^']+)'", request.bible_summary)
    if title_match:
        title = title_match.group(1)
        
    premise_match = re.search(r"exists where (.+)", request.bible_summary)
    if premise_match:
        premise = premise_match.group(1)
        premise = premise.replace(". The series explores themes of choice and identity.", "")

    genre = request.genre or "Sci-Fi"
    
    episodes = [
        EpisodeOutline(
            number=1,
            title=f"The Rise of {title.split(':')[0].strip()}",
            objectives=[
                f"Establish the stakes of: {premise[:50]}...",
                "Introduce the primary protagonist",
                "Set up the central conflict"
            ],
            summary=f"The story begins in the universe of {title}. The protagonist must confront the harsh reality of '{premise}', leading to a critical discovery.",
            climax="The protagonist makes a desperate move to protect their secret, narrowly escaping detection."
        ),
        EpisodeOutline(
            number=2,
            title="Tensions and Infiltration",
            objectives=[
                "Infiltrate the antagonist sector",
                "Acquire key tactical assets",
                "Deepen the core partner relationship"
            ],
            summary=f"Factions collide as characters plan an infiltration to bypass the restrictions of '{premise}'. Together, they secure a critical resource.",
            climax="An escape sequence goes wrong, leaving one of the allies captured by the authorities."
        ),
        EpisodeOutline(
            number=3,
            title="The Resolution and Beyond",
            objectives=[
                "Execute the high-altitude rescue",
                "Challenge the central powers",
                "Resolve the season cliffhanger"
            ],
            summary=f"Using their newly acquired assets and strategies, the characters stage a daring raid to liberate their captured ally and change the balance of power.",
            climax="They break through the barrier and escape, only to discover a vast new realm of possibilities that changes everything."
        )
    ]

    return SeasonPlanResponse(
        season_question=f"Can they overcome the restrictions of {premise[:60]}?",
        central_conflict=f"Protagonist goals vs Antagonist monopoly on {genre} resources",
        summary=f"A dynamic {genre} series detailing the struggle over: {premise}",
        episodes=episodes
    )

@app.post("/agents/screenplay", response_model=ScreenplayResponse)
async def screenplay_writer(request: ScreenplayRequest):
    """
    Screenplay Writer: Takes an outline and writes a structured screenplay
    containing detailed scene descriptors, dialogue lines, and shot listings.
    """
    time.sleep(0.5)
    
    primary_name = "Luna"
    supporting_name = "Leo"
    
    if request.characters and len(request.characters) > 0:
        primary_name = request.characters[0].get("name", "Luna")
        primary_name = primary_name.replace("Protagonist ", "").replace("Supporting ", "")
        
    if request.characters and len(request.characters) > 1:
        supporting_name = request.characters[1].get("name", "Leo")
        supporting_name = supporting_name.replace("Protagonist ", "").replace("Supporting ", "")
        
    primary_upper = primary_name.upper()
    supporting_upper = supporting_name.upper()
    
    content = f"""
    SCENE 1 - INT. WORKSPACE AREA - DAY
    
    {primary_upper} is inspecting a critical piece of technology. Tension fills the room.
    
    {primary_upper}
    (muttering, focused)
    Almost there. Just need to align these core channels.
    
    {supporting_upper} watches from the entryway with arms crossed, looking anxious.
    
    {supporting_upper}
    We don't have much time, {primary_name}. They're patrolling the perimeter.
    """
    
    scenes = [
        SceneSchema(
            scene_number=1,
            location_id="loc-workshop",
            time_of_day="day",
            description=f"Workspace interior where {primary_name} is operating.",
            beats=[f"{primary_name} adjusts the core tech", f"{supporting_name} warns of threat"],
            shots=[
                ShotSchema(
                    shot_number=1,
                    duration_seconds=4,
                    shot_type="Medium Shot",
                    camera_angle="Eye Level",
                    camera_movement="Static",
                    composition=f"{primary_name} at the workbench focusing on the tech.",
                    subject=primary_name,
                    action=f"{primary_name} connects a wires assembly into the main device.",
                    dialogue=DialogueLineSchema(
                        character_id=f"char-{primary_name.lower()}",
                        text="Almost there. Just need to align these core channels.",
                        emotion="focused"
                    ),
                    prompt_text=f"Medium shot of {primary_name} working with tools on a detailed technological device in a dusty workshop, cinematic lighting.",
                    production_method="talking-character"
                ),
                ShotSchema(
                    shot_number=2,
                    duration_seconds=3,
                    shot_type="Close Up",
                    camera_angle="Low Angle",
                    camera_movement="Zoom",
                    composition=f"Close up on {supporting_name} speaking.",
                    subject=supporting_name,
                    action=f"{supporting_name} shifts weight, looking out the doorway.",
                    dialogue=DialogueLineSchema(
                        character_id=f"char-{supporting_name.lower()}",
                        text=f"We don't have much time, {primary_name}. They're patrolling the perimeter.",
                        emotion="anxious"
                    ),
                    prompt_text=f"Close up of {supporting_name} looking anxious, warning the camera, warm cinematic lighting, depth of field.",
                    production_method="talking-character"
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
