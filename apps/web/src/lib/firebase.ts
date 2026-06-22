import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase can only be initialized in the browser (not during Next.js SSR/build).
// All consumers of auth/db are in 'use client' components so this is safe.
let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase should only be initialized in the browser');
  }
  if (!app) {
    // Require at minimum an apiKey — if env vars not set, skip Firebase gracefully
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key_here') {
      throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY not configured');
    }
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

// Convenience re-exports (lazy — only safe to call in browser/client components)
export { getFirebaseApp as app };
export default firebaseConfig;
