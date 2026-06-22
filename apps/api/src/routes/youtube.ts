import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { getDoc, updateDoc, addDoc } from '../db/firestore';
import { adminDb } from '../middleware/auth';
import { FieldValue } from '@google-cloud/firestore';

const router = Router();

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || '';
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || '';
const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'https://episodic-ai-api-26273727080.us-central1.run.app/api/youtube/callback';

// GET /api/youtube/auth — start OAuth flow
router.get('/auth', requireAuth, async (req: Request, res: Response) => {
  if (!YOUTUBE_CLIENT_ID) {
    return res.status(503).json({ error: 'YouTube OAuth not configured. Set YOUTUBE_CLIENT_ID.' });
  }
  const { workspaceId } = req.user!;
  const state = Buffer.from(JSON.stringify({ workspaceId, ts: Date.now() })).toString('base64');

  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    redirect_uri: YOUTUBE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  res.json({ authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
});

// GET /api/youtube/callback — exchange code for tokens
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query as Record<string, string>;
  const baseUrl = process.env.WEB_BASE_URL || 'https://episodic-ai-web-26273727080.us-central1.run.app';

  if (error) {
    return res.redirect(`${baseUrl}/dashboard?youtube=error&reason=${encodeURIComponent(error)}`);
  }

  try {
    const { workspaceId } = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        redirect_uri: YOUTUBE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json() as any;
    if (!tokens.refresh_token) {
      return res.redirect(`${baseUrl}/dashboard?youtube=error&reason=no_refresh_token`);
    }

    // Get YouTube channel info
    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const channelData = await channelRes.json() as any;
    const channel = channelData.items?.[0]?.snippet;

    // Store refresh token + channel info in Firestore
    await adminDb.collection('workspaces').doc(workspaceId).update({
      youtubeRefreshToken: tokens.refresh_token,
      youtubeChannelName: channel?.title || 'YouTube Channel',
      youtubeChannelId: channelData.items?.[0]?.id,
      youtubeConnectedAt: new Date(),
    });

    // Also store as social account
    const accountId = `acc-yt-${workspaceId}`;
    await adminDb.collection('socialAccounts').doc(accountId).set({
      id: accountId, workspaceId,
      platform: 'youtube',
      handle: channel?.title || 'YouTube Channel',
      monetizationEnabled: false,
      connectedAt: new Date(),
    }, { merge: true });

    res.redirect(`${baseUrl}/dashboard?youtube=connected&channel=${encodeURIComponent(channel?.title || 'YouTube')}`);
  } catch (e: any) {
    console.error('[YouTube callback]', e);
    res.redirect(`${baseUrl}/dashboard?youtube=error&reason=${encodeURIComponent(e.message)}`);
  }
});

// POST /api/youtube/upload — upload a rendered episode to YouTube
router.post('/upload', requireAuth, async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.user!;
    const { episodeId, videoUrl, title, description, tags, privacyStatus } = req.body;

    const workspace = await getDoc('workspaces', workspaceId);
    if (!workspace?.youtubeRefreshToken) {
      return res.status(400).json({
        error: 'YouTube not connected. Visit /api/youtube/auth to connect.',
        authRequired: true,
      });
    }

    // Refresh access token
    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: workspace.youtubeRefreshToken,
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    });
    const refreshData = await refreshRes.json() as any;
    if (!refreshData.access_token) {
      return res.status(401).json({ error: 'YouTube token refresh failed. Reconnect YouTube.' });
    }

    // Fetch video file from the CDN URL
    const videoFetch = await fetch(videoUrl);
    if (!videoFetch.ok) {
      return res.status(400).json({ error: `Cannot fetch video from: ${videoUrl}` });
    }
    const videoBuffer = await videoFetch.arrayBuffer();

    // Upload via YouTube Data API v3 resumable upload
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshData.access_token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/mp4',
          'X-Upload-Content-Length': videoBuffer.byteLength.toString(),
        },
        body: JSON.stringify({
          snippet: {
            title: title || 'EpisodicAI — Generated Episode',
            description: description || 'Generated by EpisodicAI Studio',
            tags: tags || ['EpisodicAI', 'AI', 'Series'],
            categoryId: '24', // Entertainment
          },
          status: {
            privacyStatus: privacyStatus || 'private',
            selfDeclaredMadeForKids: false,
          },
        }),
      }
    );

    const uploadUrl = initRes.headers.get('location');
    if (!uploadUrl) {
      return res.status(500).json({ error: 'YouTube did not return upload URL' });
    }

    // Upload the video bytes
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.byteLength.toString(),
      },
      body: videoBuffer,
    });

    const ytVideo = await uploadRes.json() as any;
    const youtubeVideoId = ytVideo.id;
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;

    // Update episode and publication records
    if (episodeId) {
      await updateDoc('episodes', episodeId, { publishedUrl: youtubeUrl, status: 'Published' });
      const pubId = `pub-yt-${episodeId}`;
      await adminDb.collection('publications').doc(pubId).set({
        id: pubId, episodeId, workspaceId,
        platform: 'youtube', status: 'published',
        publishedUrl: youtubeUrl,
        platformPostId: youtubeVideoId,
        publishedAt: new Date(),
      }, { merge: true });
    }

    res.json({ success: true, youtubeVideoId, youtubeUrl });
  } catch (e: any) {
    console.error('[YouTube upload]', e);
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/youtube/disconnect — revoke tokens
router.delete('/disconnect', requireAuth, async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.user!;
    const workspace = await getDoc('workspaces', workspaceId);

    if (workspace?.youtubeRefreshToken) {
      // Revoke token with Google
      await fetch(`https://oauth2.googleapis.com/revoke?token=${workspace.youtubeRefreshToken}`, { method: 'POST' }).catch(() => {});
    }

    await adminDb.collection('workspaces').doc(workspaceId).update({
      youtubeRefreshToken: FieldValue.delete(),
      youtubeChannelName: FieldValue.delete(),
      youtubeChannelId: FieldValue.delete(),
    });

    // Remove social account
    await adminDb.collection('socialAccounts').doc(`acc-yt-${workspaceId}`).delete().catch(() => {});

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
