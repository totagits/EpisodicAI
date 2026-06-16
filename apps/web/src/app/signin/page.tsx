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
  MonitorPlay
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
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  
  // Account Selector states
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [activeUserEmail, setActiveUserEmail] = useState('');

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
        router.push('/dashboard?showId=shw-default');
      }
    }, 800);
  };

  const handleGoogleSignIn = () => {
    // Open the Google account chooser first
    setShowAccountSelector(true);
  };

  const confirmGoogleSignIn = (profile: { name: string; email: string }) => {
    setShowAccountSelector(false);
    setGoogleSubmitting(true);
    setActiveUserEmail(profile.email);

    // Simulate redirection after choosing account
    setTimeout(() => {
      if (shows.length > 0) {
        router.push(`/dashboard?showId=${shows[0].id}&userEmail=${encodeURIComponent(profile.email)}`);
      } else {
        router.push(`/dashboard?showId=shw-default&userEmail=${encodeURIComponent(profile.email)}`);
      }
    }, 1200);
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
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={submitting || googleSubmitting || shows.length === 0}
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

              {/* OR Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-brand-border/60"></div>
                <span className="px-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">or</span>
                <div className="flex-1 border-t border-brand-border/60"></div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting || googleSubmitting}
                className="w-full py-3 rounded-lg font-bold text-sm border border-brand-border bg-[#0d0e1b] hover:bg-brand-border/20 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {googleSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-brand-cyan" /> Connecting as {activeUserEmail}...
                  </>
                ) : (
                  <>
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M5.26620003,9.76451671 C6.19878753,6.9386374 8.85234377,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.26909091,0 3.19090909,2.71818182 1.24090909,6.65454545 L5.26620003,9.76451671 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M16.0407269,18.0125889 C14.9509169,18.7163088 13.5660891,19.0909091 12,19.0909091 C8.85234377,19.0909091 6.19878753,17.0613626 5.26620003,14.2354833 L1.24090909,17.3454545 C3.19090909,21.2818182 7.26909091,24 12,24 C14.9727273,24 17.7272727,22.9090909 19.7454545,21.0909091 L16.0407269,18.0125889 Z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49,12.275 C23.49,11.49 23.415,10.73 23.3,10 L12,10 L12,14.51 L18.47,14.51 C18.185,15.99 17.315,17.24 16.04,18.01 L19.745,21.09 C21.905,19.1 23.49,16.02 23.49,12.275 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.26620003,9.76451671 C5.01187427,10.5186481 4.87012987,11.3276632 4.87012987,12.17 C4.87012987,13.0123368 5.01187427,13.8213519 5.26620003,14.2354833 L1.24090909,17.3454545 C0.44686256,15.8234399 0,14.0754877 0,12.17 C0,10.2645123 0.44686256,8.51656006 1.24090909,6.99454545 L5.26620003,9.76451671 Z"
                      />
                    </svg>
                    Sign In with Google
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={submitting || googleSubmitting}
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

      {/* MOCK GOOGLE ACCOUNT CHOOSER MODAL */}
      {showAccountSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white text-gray-800 rounded-lg max-w-sm w-full p-6 shadow-2xl space-y-5 font-sans border border-gray-200">
            {/* Header */}
            <div className="text-center space-y-2">
              <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 leading-snug">Choose an account</h3>
              <p className="text-xs text-gray-500">to continue to <span className="font-semibold text-brand-violet">EpisodicAI Studio</span></p>
            </div>

            {/* Profile List */}
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto border border-gray-100 rounded-md">
              {[
                { name: "Michael Gwoah", email: "michaelgwoah@gmail.com", avatarColor: "bg-blue-600" },
                { name: "rtalk4348", email: "rtalk4348@gmail.com", avatarColor: "bg-purple-600" },
                { name: "Show Director", email: "creator@episodic.ai", avatarColor: "bg-teal-600" }
              ].map((profile, pi) => (
                <button
                  key={pi}
                  type="button"
                  onClick={() => confirmGoogleSignIn(profile)}
                  className="w-full text-left py-3.5 px-4 flex items-center gap-3 hover:bg-gray-50 transition border-none focus:outline-none"
                >
                  <div className={`w-8 h-8 rounded-full ${profile.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                    {profile.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-800 truncate">{profile.name}</div>
                    <div className="text-[10px] text-gray-500 truncate">{profile.email}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer / Cancel */}
            <div className="pt-2 text-center border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAccountSelector(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
