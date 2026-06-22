import { adminDb } from '../middleware/auth';
import { Firestore, Query, WhereFilterOp, DocumentData } from '@google-cloud/firestore';
import { v4 as uuidv4 } from 'uuid';

// ─── Collection References ──────────────────────────────────────────────────

const col = {
  users: () => adminDb.collection('users'),
  workspaces: () => adminDb.collection('workspaces'),
  credits: () => adminDb.collection('credits'),
  ledger: () => adminDb.collection('ledger'),
  shows: () => adminDb.collection('shows'),
  bibles: () => adminDb.collection('bibles'),
  characters: () => adminDb.collection('characters'),
  locations: () => adminDb.collection('locations'),
  canonFacts: () => adminDb.collection('canonFacts'),
  seasons: () => adminDb.collection('seasons'),
  episodes: () => adminDb.collection('episodes'),
  scripts: () => adminDb.collection('scripts'),
  scenes: () => adminDb.collection('scenes'),
  shots: () => adminDb.collection('shots'),
  jobs: () => adminDb.collection('jobs'),
  publications: () => adminDb.collection('publications'),
  socialAccounts: () => adminDb.collection('socialAccounts'),
};

// ─── Generic Helpers ─────────────────────────────────────────────────────────

export async function getDoc(collection: string, id: string): Promise<any | null> {
  const snap = await adminDb.collection(collection).doc(id).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

export async function setDoc(collection: string, id: string, data: any): Promise<void> {
  await adminDb.collection(collection).doc(id).set({
    ...data,
    updatedAt: new Date(),
  }, { merge: true });
}

export async function addDoc(collection: string, data: any): Promise<string> {
  const ref = await adminDb.collection(collection).add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return ref.id;
}

export async function updateDoc(collection: string, id: string, data: any): Promise<void> {
  await adminDb.collection(collection).doc(id).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  await adminDb.collection(collection).doc(id).delete();
}

export async function queryDocs(
  collection: string,
  filters: Array<[string, WhereFilterOp, any]>,
  orderBy?: string,
): Promise<any[]> {
  let q: Query<DocumentData> = adminDb.collection(collection);
  for (const [field, op, value] of filters) {
    q = q.where(field, op, value);
  }
  if (orderBy) q = q.orderBy(orderBy, 'asc');
  const snap = await q.get();
  return snap.docs.map((d: DocumentData) => ({ id: (d as any).id, ...(d as any).data() }));
}

// ─── Workspace & Auth Helpers ─────────────────────────────────────────────────

export async function getOrCreateWorkspace(uid: string, email: string): Promise<any> {
  const workspaceId = `wsp-${uid}`;
  const existing = await getDoc('workspaces', workspaceId);
  if (existing) return existing;

  // First-time user — create workspace + credit account
  const workspace = {
    id: workspaceId,
    name: 'My Studio',
    studioName: 'Studio',
    teamSize: 1,
    timeZone: 'UTC',
    preferredLanguage: 'en',
    ownerUid: uid,
    ownerEmail: email,
  };
  await setDoc('workspaces', workspaceId, workspace);
  await setDoc('credits', workspaceId, { workspaceId, balance: 100.0, reserved: 0.0 });
  await addDoc('ledger', {
    workspaceId,
    type: 'grant',
    amount: 100.0,
    description: 'Welcome credits grant',
  });
  return workspace;
}

// ─── Credits ──────────────────────────────────────────────────────────────────

export async function getCredits(workspaceId: string): Promise<{ balance: number; reserved: number }> {
  const snap = await getDoc('credits', workspaceId);
  return snap || { balance: 0, reserved: 0 };
}

export async function adjustCredits(
  workspaceId: string,
  delta: number,
  reservedDelta: number = 0,
): Promise<{ balance: number; reserved: number }> {
  const ref = adminDb.collection('credits').doc(workspaceId);
  // Use Firestore transactions for safe concurrent updates
  return await adminDb.runTransaction(async (tx: any) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? snap.data()! : { balance: 0, reserved: 0 };
    const next = {
      balance: current.balance + delta,
      reserved: current.reserved + reservedDelta,
      workspaceId,
      updatedAt: new Date(),
    };
    tx.set(ref, next);
    return next;
  });
}

// ─── Shows ───────────────────────────────────────────────────────────────────

export async function getShowsByWorkspace(workspaceId: string): Promise<any[]> {
  return queryDocs('shows', [['workspaceId', '==', workspaceId]], 'createdAt');
}

export async function getShow(showId: string): Promise<any | null> {
  return getDoc('shows', showId);
}

// ─── Characters & Locations ──────────────────────────────────────────────────

export async function getCharactersByShow(showId: string): Promise<any[]> {
  return queryDocs('characters', [['showId', '==', showId]]);
}

export async function getLocationsByShow(showId: string): Promise<any[]> {
  return queryDocs('locations', [['showId', '==', showId]]);
}

export async function getCanonFactsByShow(showId: string): Promise<any[]> {
  return queryDocs('canonFacts', [['showId', '==', showId]]);
}

// ─── Seasons & Episodes ───────────────────────────────────────────────────────

export async function getSeasonsByShow(showId: string): Promise<any[]> {
  return queryDocs('seasons', [['showId', '==', showId]], 'number');
}

export async function getEpisodesBySeason(seasonId: string): Promise<any[]> {
  return queryDocs('episodes', [['seasonId', '==', seasonId]], 'number');
}

// ─── Production ───────────────────────────────────────────────────────────────

export async function getScenesByScript(scriptId: string): Promise<any[]> {
  return queryDocs('scenes', [['scriptId', '==', scriptId]], 'sceneNumber');
}

export async function getShotsByScene(sceneId: string): Promise<any[]> {
  return queryDocs('shots', [['sceneId', '==', sceneId]], 'shotNumber');
}

export async function getShotsByScenes(sceneIds: string[]): Promise<any[]> {
  if (!sceneIds.length) return [];
  return queryDocs('shots', [['sceneId', 'in', sceneIds]]);
}

export { col };
export default adminDb;
