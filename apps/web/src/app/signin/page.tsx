'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Film,
  ArrowLeft,
  Plus,
  Key,
  Loader2,
  MonitorPlay,
  Mail,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname.includes('run.app')) {
    if (window.location.hostname.includes('episodic-ai-web')) {
      return window.location.origin.replace('episodic-ai-web', 'episodic-ai-api');
    }
    return 'https://episodic-ai-api-26273727080.us-central1.run.app';
  }
  return 'http://localhost:4000';
};

export default function SignInPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, getAuthHeaders } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shows, setShows] = useState<any[]>([]);
  const [showsLoading, setShowsLoading] = useState(false);

  // If already authenticated, load shows and redirect
  useEffect(() => {
    if (user && !loading) {
      fetchShowsAndRedirect();
    }
  }, [user, loading]);

  const fetchShowsAndRedirect = async () => {
    setShowsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${getApiUrl()}/api/shows`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          router.push(`/dashboard?showId=${data[0].id}`);
        } else {
          router.push('/onboarding');
        }
      } else {
        router.push('/onboarding');
      }
    } catch {
      router.push('/onboarding');
    } finally {
      setShowsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      // onAuthStateChanged in AuthProvider will trigger fetchShowsAndRedirect via useEffect
    } catch (e: any) {
      setError(e.message || 'Google sign-in failed. Please try again.');
      setGoogleSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (e: any) {
      const msg = e.code === 'auth/user-not-found' ? 'No account found with this email.'
        : e.code === 'auth/wrong-password' ? 'Incorrect password.'
        : e.code === 'auth/email-already-in-use' ? 'Email already registered. Sign in instead.'
        : e.code === 'auth/weak-password' ? 'Password must be at least 6 characters.'
        : e.message || 'Authentication failed.';
      setError(msg);
      setSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    setDemoSubmitting(true);
    // Demo mode: bypass auth, go directly to demo dashboard
    setTimeout(() => {
      router.push('/dashboard?showId=shw-default&demo=true');
    }, 500);
  };

  if (loading || showsLoading || (user && !error)) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-brand-cyan animate-spin" />
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            {user ? 'Loading your studio...' : 'Initializing...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 md:p-12 sky-grid text-white">
      <div className="w-full max-w-md rounded-xl border border-brand-border glass-panel overflow-hidden shadow-2xl p-8 flex flex-col space-y-6">

        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white uppercase transition w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`} alt="Logo" className="w-12 h-12 rounded object-cover mx-auto shadow-lg shadow-brand-violet/20" />
          <h2 className="text-2xl font-extrabold tracking-tight">Access Your Studio</h2>
          <p className="text-sm text-gray-400">Sign in to enter the writers&apos; room.</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting || googleSubmitting || demoSubmitting}
          className="w-full py-3 rounded-lg font-bold text-sm border border-brand-border bg-[#0d0e1b] hover:bg-brand-border/20 text-white transition disabled:opacity-50 flex items-center justify-center gap-2.5"
        >
          {googleSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin text-brand-cyan" /> Connecting with Google...</>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.26620003,9.76451671 C6.19878753,6.9386374 8.85234377,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.26909091,0 3.19090909,2.71818182 1.24090909,6.65454545 L5.26620003,9.76451671 Z" />
                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509169,18.7163088 13.5660891,19.0909091 12,19.0909091 C8.85234377,19.0909091 6.19878753,17.0613626 5.26620003,14.2354833 L1.24090909,17.3454545 C3.19090909,21.2818182 7.26909091,24 12,24 C14.9727273,24 17.7272727,22.9090909 19.7454545,21.0909091 L16.0407269,18.0125889 Z" />
                <path fill="#4285F4" d="M23.49,12.275 C23.49,11.49 23.415,10.73 23.3,10 L12,10 L12,14.51 L18.47,14.51 C18.185,15.99 17.315,17.24 16.04,18.01 L19.745,21.09 C21.905,19.1 23.49,16.02 23.49,12.275 Z" />
                <path fill="#FBBC05" d="M5.26620003,9.76451671 C5.01187427,10.5186481 4.87012987,11.3276632 4.87012987,12.17 C4.87012987,13.0123368 5.01187427,13.8213519 5.26620003,14.2354833 L1.24090909,17.3454545 C0.44686256,15.8234399 0,14.0754877 0,12.17 C0,10.2645123 0.44686256,8.51656006 1.24090909,6.99454545 L5.26620003,9.76451671 Z" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-brand-border/60" />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">or with email</span>
          <div className="flex-1 border-t border-brand-border/60" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-brand-bg border border-brand-border text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-violet transition"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-brand-bg border border-brand-border text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-violet transition"
            />
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || googleSubmitting || demoSubmitting}
              className="flex-1 py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-brand-violet to-brand-cyan text-white hover:brightness-110 shadow-lg shadow-brand-violet/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {mode === 'signin' ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                <><Key className="w-4 h-4" /> {mode === 'signin' ? 'Sign In' : 'Create Account'}</>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); }}
            className="w-full text-center text-xs text-gray-500 hover:text-brand-violet transition py-1"
          >
            {mode === 'signin' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
          </button>
        </form>

        {/* Demo Mode */}
        <div className="border-t border-brand-border/40 pt-4 space-y-3">
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={submitting || googleSubmitting || demoSubmitting}
            className="w-full py-2.5 rounded-lg font-bold text-sm border border-brand-border bg-brand-card hover:bg-brand-border/40 text-gray-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {demoSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MonitorPlay className="w-4 h-4 text-brand-cyan" />}
            Access Zero-Dependency Demo Mode
          </button>
          <p className="text-center text-xs text-gray-500">
            EpisodicAI Studio Operating System v2.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
