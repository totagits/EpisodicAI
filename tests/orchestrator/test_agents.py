"""
Orchestrator service unit tests.
Tests bible/script generation with Gemini fallback, internal key auth,
and API contract compliance. No live Gemini key required (uses template fallback).
"""
import pytest
import httpx
import os

BASE_URL = os.environ.get("TEST_ORCHESTRATOR_URL", "http://localhost:8001")
INTERNAL_KEY = os.environ.get("INTERNAL_ORCHESTRATOR_KEY", "eai-internal-key-2026")

# ─── Helper ────────────────────────────────────────────────────────────────────

def auth_headers():
    return {"X-Internal-Key": INTERNAL_KEY, "Content-Type": "application/json"}


# ─── Health ───────────────────────────────────────────────────────────────────

def test_health():
    r = httpx.get(f"{BASE_URL}/health", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"


# ─── Auth middleware ───────────────────────────────────────────────────────────

def test_rejects_missing_internal_key():
    r = httpx.post(
        f"{BASE_URL}/generate/bible",
        json={"title": "Test", "premise": "Test premise"},
        timeout=10,
    )
    assert r.status_code in (401, 403)


def test_rejects_wrong_internal_key():
    r = httpx.post(
        f"{BASE_URL}/generate/bible",
        headers={"X-Internal-Key": "wrong-key"},
        json={"title": "Test", "premise": "Test premise"},
        timeout=10,
    )
    assert r.status_code in (401, 403)


# ─── Bible generation ─────────────────────────────────────────────────────────

def test_generate_bible_returns_structure():
    payload = {
        "title": "Gravity's Belief",
        "premise": "A mechanic discovers boots that alter gravity based on belief strength.",
        "genre": "Science Fiction",
        "tone": "Cinematic and moody",
        "magicRules": "Gravity vectors shift with conviction",
        "influences": ["Steampunk", "Cyberpunk"],
    }
    r = httpx.post(
        f"{BASE_URL}/generate/bible",
        headers=auth_headers(),
        json=payload,
        timeout=30,
    )
    assert r.status_code == 200
    data = r.json()
    # The bible response must have at minimum these fields
    assert "summary" in data or "worldRules" in data or "themes" in data, \
        f"Bible response missing expected fields: {list(data.keys())}"


def test_generate_bible_with_minimal_payload():
    """Should succeed with just title and premise using template fallback."""
    r = httpx.post(
        f"{BASE_URL}/generate/bible",
        headers=auth_headers(),
        json={"title": "Minimal Show", "premise": "A minimal test show."},
        timeout=30,
    )
    assert r.status_code == 200


# ─── Script generation ────────────────────────────────────────────────────────

def test_generate_script_returns_structure():
    payload = {
        "showTitle": "Gravity's Belief",
        "episodeTitle": "The Ground Zero",
        "synopsis": "Luna struggles to calibrate her boots before the Sky Guard sweep.",
        "characters": [{"name": "Luna", "role": "protagonist"}],
        "duration": 5,
    }
    r = httpx.post(
        f"{BASE_URL}/generate/script",
        headers=auth_headers(),
        json=payload,
        timeout=30,
    )
    assert r.status_code == 200
    data = r.json()
    assert "scenes" in data or "dialogue" in data or "script" in data, \
        f"Script response missing expected fields: {list(data.keys())}"


# ─── Shot list generation ─────────────────────────────────────────────────────

def test_generate_shots_returns_list():
    payload = {
        "sceneDescription": "Luna sprints across the rooftop as her boots glow blue.",
        "characters": ["Luna"],
        "setting": "Rooftop at dusk",
        "shotCount": 3,
    }
    r = httpx.post(
        f"{BASE_URL}/generate/shots",
        headers=auth_headers(),
        json=payload,
        timeout=30,
    )
    assert r.status_code == 200
    data = r.json()
    shots = data.get("shots", data)
    assert isinstance(shots, list)
    assert len(shots) > 0


# ─── Concurrent requests ──────────────────────────────────────────────────────

def test_concurrent_bible_requests():
    """Ensure the orchestrator handles concurrent requests without crashing."""
    import asyncio

    async def run():
        async with httpx.AsyncClient() as client:
            tasks = [
                client.post(
                    f"{BASE_URL}/generate/bible",
                    headers=auth_headers(),
                    json={"title": f"Show {i}", "premise": f"Premise {i}"},
                    timeout=30,
                )
                for i in range(3)
            ]
            return await asyncio.gather(*tasks)

    results = asyncio.run(run())
    for r in results:
        assert r.status_code == 200
