import request from 'supertest';
import express from 'express';

// ─── Lightweight integration tests (no live Firebase needed) ─────────────────
// These hit the API routes without authentication — testing public endpoints
// and verifying auth middleware rejects unauthenticated requests properly.
//
// For CI: set TEST_API_URL=https://episodic-ai-api-26273727080.us-central1.run.app
//         or run against a local instance started with npm run dev

const API_URL = process.env.TEST_API_URL || 'http://localhost:4000';

describe('EpisodicAI API — Integration Tests', () => {

  // ─── Health ───────────────────────────────────────────────────────────────
  describe('GET /api/health', () => {
    it('returns 200 with status ok', async () => {
      const res = await fetch(`${API_URL}/api/health`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toMatchObject({ status: 'ok' });
    });
  });

  // ─── Auth middleware ──────────────────────────────────────────────────────
  describe('Auth middleware', () => {
    it('rejects unauthenticated POST /api/shows with 401', async () => {
      const res = await fetch(`${API_URL}/api/shows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Show' }),
      });
      // Must reject without auth header or demo-mode header
      expect([401, 403]).toContain(res.status);
    });

    it('accepts demo-mode header and returns 200/201', async () => {
      const res = await fetch(`${API_URL}/api/shows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-Mode': 'true',
        },
        body: JSON.stringify({
          title: 'Integration Test Show',
          premise: 'A test show created by the test suite',
          genre: 'Drama',
          ageRating: 'PG',
          automationLevel: 'Autopilot',
          budgetPerEpisode: 10,
          monthlyBudget: 40,
          qualityTier: 'STANDARD',
        }),
      });
      expect([200, 201]).toContain(res.status);
      const body = await res.json();
      expect(body).toHaveProperty('show');
      expect(body.show).toHaveProperty('id');
    });
  });

  // ─── Shows CRUD ───────────────────────────────────────────────────────────
  describe('Shows API', () => {
    let createdShowId: string;

    it('creates a show', async () => {
      const res = await fetch(`${API_URL}/api/shows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Demo-Mode': 'true' },
        body: JSON.stringify({
          title: 'Jest Test Show',
          premise: 'Test premise',
          genre: 'Sci-Fi',
          ageRating: 'PG-13',
          automationLevel: 'Copilot',
          budgetPerEpisode: 50,
          monthlyBudget: 200,
          qualityTier: 'STANDARD',
        }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      createdShowId = body.show.id;
      expect(createdShowId).toBeTruthy();
    });

    it('retrieves the show', async () => {
      if (!createdShowId) return;
      const res = await fetch(`${API_URL}/api/shows/${createdShowId}`, {
        headers: { 'X-Demo-Mode': 'true' },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.title).toBe('Jest Test Show');
    });
  });

  // ─── Seasons ──────────────────────────────────────────────────────────────
  describe('Seasons API', () => {
    it('creates a season for a show', async () => {
      // First create a show
      const showRes = await fetch(`${API_URL}/api/shows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Demo-Mode': 'true' },
        body: JSON.stringify({ title: 'Season Test Show', genre: 'Drama', automationLevel: 'Copilot', budgetPerEpisode: 25, monthlyBudget: 100, qualityTier: 'STANDARD' }),
      });
      const { show } = await showRes.json();

      const res = await fetch(`${API_URL}/api/seasons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Demo-Mode': 'true' },
        body: JSON.stringify({ showId: show.id, seasonNumber: 1 }),
      });
      expect([200, 201]).toContain(res.status);
      const body = await res.json();
      expect(body.season).toHaveProperty('id');
      expect(body.episodes.length).toBeGreaterThan(0);
    });
  });

  // ─── Credits ──────────────────────────────────────────────────────────────
  describe('Credits API', () => {
    it('returns credit balance', async () => {
      const res = await fetch(`${API_URL}/api/credits`, {
        headers: { 'X-Demo-Mode': 'true' },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('balance');
      expect(typeof body.balance).toBe('number');
    });
  });

  // ─── Providers ────────────────────────────────────────────────────────────
  describe('Provider registry', () => {
    it('returns provider list', async () => {
      const res = await fetch(`${API_URL}/api/providers`, {
        headers: { 'X-Demo-Mode': 'true' },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });
  });

  // ─── YouTube OAuth ────────────────────────────────────────────────────────
  describe('YouTube OAuth', () => {
    it('returns 503 when YouTube not configured', async () => {
      const res = await fetch(`${API_URL}/api/youtube/auth`, {
        headers: { 'X-Demo-Mode': 'true' },
      });
      // Either 200 with authUrl or 503 if YOUTUBE_CLIENT_ID not set
      expect([200, 503]).toContain(res.status);
    });
  });

  // ─── Stripe billing ───────────────────────────────────────────────────────
  describe('Stripe billing', () => {
    it('returns plans list', async () => {
      const res = await fetch(`${API_URL}/api/billing/plans`, {
        headers: { 'X-Demo-Mode': 'true' },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });
});
