'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Film, 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Key, 
  Loader2, 
  MonitorPlay,
  Play
} from 'lucide-react';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('run.app')) {
      if (window.location.hostname.includes('episodic-ai-web')) {
        return window.location.origin.replace('episodic-ai-web', 'episodic-ai-api');
      }
      return 'https://episodic-ai-api-26273727080.us-central1.run.app';
    }
  }
  return 'http://localhost:4000';
};

export default function SignInPage() {
  const router = useRouter();
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShowId, setSelectedShowId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadShows() {
      try {
        const response = await fetch(`${getApiUrl()}/api/shows`);
        if (response.ok) {
          const data = await response.json();
          setShows(data || []);
          if (data && data.length > 0) {
            setSelectedShowId(data[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load shows from API', e);
      } finally {
        setLoading(false);
      }
    }
    loadShows();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate auth token check and redirect to dashboard
    setTimeout(() => {
      if (selectedShowId) {
        router.push(`/dashboard?showId=${selectedShowId}`);
      } else {
        // Fallback default
        router.push('/dashboard?showId=shw-default');
      }
    }, 800);
  };

  const handleQuickDemo = () => {
    setSubmitting(true);
    setTimeout(() => {
      router.push('/dashboard?showId=shw-default');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 md:p-12 sky-grid text-white">
      <div className="w-full max-w-md rounded-xl border border-brand-border glass-panel overflow-hidden shadow-2xl p-8 flex flex-col space-y-6">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white uppercase transition w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center font-bold text-2xl text-white mx-auto shadow-lg shadow-brand-violet/20">
            E
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Access Your Studio</h2>
          <p className="text-sm text-gray-400">Select your active series concept to enter the writers' room.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
            <span className="text-xs text-gray-500 font-semibold uppercase">Scanning database...</span>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            {shows.length > 0 ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Select Active Show</label>
                <select
                  value={selectedShowId}
                  onChange={(e) => setSelectedShowId(e.target.value)}
                  className="w-full rounded bg-[#0b0c16] border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                >
                  {shows.map((show) => (
                    <option key={show.id} value={show.id}>
                      {show.title} ({show.genre})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-brand-card border border-brand-border/60 text-center space-y-3">
                <Film className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  No active show databases found on this workspace. Create your first series to get started!
                </p>
                <Link 
                  href="/onboarding"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded bg-brand-violet hover:bg-brand-violet/90 text-white transition mx-auto"
                >
                  <Plus className="w-3.5 h-3.5" /> Start Onboarding
                </Link>
              </div>
            )}

            {/* Standard sign in buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={submitting || shows.length === 0}
                className="w-full py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-brand-violet to-brand-cyan text-white hover:brightness-110 shadow-lg shadow-brand-violet/20 transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Accessing...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" /> Sign In to Selected Series
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={submitting}
                className="w-full py-3 rounded-lg font-bold text-sm border border-brand-border bg-brand-card hover:bg-brand-border/40 text-gray-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <MonitorPlay className="w-4 h-4 text-brand-cyan" /> Access Zero-Dependency Demo Mode
              </button>
            </div>
          </form>
        )}

        <div className="border-t border-brand-border/40 pt-4 text-center text-xs text-gray-500">
          EpisodicAI Studio Operating System v1.0.0
        </div>
      </div>
    </div>
  );
}
