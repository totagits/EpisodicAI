'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Coins, 
  Layers, 
  ShieldCheck, 
  UserPlus, 
  Loader2, 
  HelpCircle,
  FileCode,
  Film,
  Play
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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

export default function OnboardingWizard() {
  const router = useRouter();
  const { getAuthHeaders, user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- Form States ---
  const [workspaceName, setWorkspaceName] = useState('My Studio Workspace');
  const [studioName, setStudioName] = useState('DreamLabs');
  const [teamSize, setTeamSize] = useState('5');

  const [title, setTitle] = useState('Gravity’s Belief');
  const [premise, setPremise] = useState('A young mechanic discovers boots that control vertical gravity vectors.');
  const [genre, setGenre] = useState('Science Fiction');
  const [ageRating, setAgeRating] = useState('PG-13');
  const [automationLevel, setAutomationLevel] = useState('Copilot');

  const [magicRules, setMagicRules] = useState('Gravity vector aligns to belief conviction.');
  const [tone, setTone] = useState('Cinematic and Moody');

  const [characterName, setCharacterName] = useState('Luna');
  const [characterRole, setCharacterRole] = useState('primary');
  const [characterImage, setCharacterImage] = useState<string | null>(null);

  const [budgetPerEpisode, setBudgetPerEpisode] = useState(50);
  const [qualityTier, setQualityTier] = useState('STANDARD');

  // Generated results placeholders
  const [generatedBible, setGeneratedBible] = useState<any>(null);
  const [generatedPilot, setGeneratedPilot] = useState<any>(null);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleGenerateBible = async () => {
    setLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const demoMode = !user;
      const response = await fetch(`${getApiUrl()}/api/shows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(demoMode ? { 'X-Demo-Mode': 'true' } : authHeaders),
        },
        body: JSON.stringify({
          title,
          premise,
          characterName,
          fullConcept: `${premise}. Tone is ${tone}. Magic/science rules: ${magicRules}`,
          genre,
          subgenres: [genre],
          targetAudience: 'Teens & Young Adults',
          ageRating,
          durationMinutes: 5,
          seasonLength: 3,
          releaseCadence: 'weekly',
          visualFormat: '16:9',
          aspectRatio: '16:9',
          influences: ['Steampunk'],
          avoidTopics: ['unlawful details'],
          automationLevel,
          budgetPerEpisode,
          monthlyBudget: budgetPerEpisode * 4,
          qualityTier
        })
      });
      const data = await response.json();
      setGeneratedBible(data.bible);
      setGeneratedPilot({
        title: "The Ground Zero",
        summary: "Luna struggles to adjust the spark frequency in her boots before the Sky Guard sweep.",
        estimatedCost: data.show.budgetPerEpisode,
        characterPack: data.characters[0]
      });
      setStep(6);
    } catch (e) {
      // Offline fallback
      setGeneratedBible({
        summary: `In the world of '${title}', gravity behaves relative to belief. ${premise}`,
        worldRules: [magicRules, "Steampunk technological constraints apply."],
        themes: ["Belief shape reality", "Factions struggle for heights"],
        forbiddenContradictions: ["Gravity cannot be bypassed without focus or devices."],
        visualIdentityNotes: "Deep purples, electric blues.",
        voiceIdentityNotes: "Cinematic dialogue."
      });
      setGeneratedPilot({
        title: "The Ground Zero",
        summary: "Luna struggles to adjust the spark frequency in her boots.",
        estimatedCost: budgetPerEpisode,
        characterPack: { name: characterName }
      });
      setStep(6);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProduction = async () => {
    setLoading(true);
    const authHeaders = await getAuthHeaders();
    const demoMode = !user;
    // Seed initial season outline based on generated show
    if (generatedBible) {
      try {
        const showId = generatedBible.showId;
        const response = await fetch(`${getApiUrl()}/api/seasons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(demoMode ? { 'X-Demo-Mode': 'true' } : authHeaders),
          },
          body: JSON.stringify({ showId, seasonNumber: 1 })
        });
        const data = await response.json();
        // Redirect to first episode dashboard
        router.push(`/dashboard?showId=${showId}&seasonId=${data.season.id}&episodeId=${data.episodes[0].id}`);
      } catch (e) {
        // Mock fallback redirect
        router.push('/dashboard?showId=shw-mock&seasonId=sea-mock&episodeId=eps-mock');
      }
    } else {
      router.push('/dashboard?showId=shw-mock&seasonId=sea-mock&episodeId=eps-mock');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 md:p-12 sky-grid">
      <div className="w-full max-w-3xl rounded-xl border border-brand-border glass-panel overflow-hidden shadow-2xl flex flex-col min-h-[550px]">
        {/* Header Progress Tracker */}
        <div className="bg-brand-card/90 border-b border-brand-border py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white font-bold uppercase transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <span className="text-gray-700">|</span>
            <span className="font-extrabold text-brand-cyan tracking-tight">EpisodicAI Onboarding</span>
          </div>
          <div className="text-xs font-semibold text-gray-400">
            Step {step} of 7
          </div>
        </div>

        {/* Step indicator bar */}
        <div className="w-full bg-brand-border/40 h-1 flex">
          {[1, 2, 3, 4, 5, 6, 7].map(s => (
            <div 
              key={s} 
              className={`flex-1 transition-colors duration-300 ${
                s <= step ? 'bg-gradient-to-r from-brand-violet to-brand-cyan' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Step Content Panels */}
        <div className="flex-1 p-6 md:p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                1. Set Up Your Creative Workspace
              </h2>
              <p className="text-sm text-gray-400">Create an organization space to manage production budgets, licenses, and teams.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Workspace Name</label>
                  <input 
                    type="text" 
                    value={workspaceName}
                    onChange={e => setWorkspaceName(e.target.value)}
                    className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                    placeholder="e.g. Neo Fiction Labs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Creator/Studio Name</label>
                  <input 
                    type="text" 
                    value={studioName}
                    onChange={e => setStudioName(e.target.value)}
                    className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                    placeholder="e.g. DreamLabs Media"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Team Size</label>
                <select 
                  value={teamSize}
                  onChange={e => setTeamSize(e.target.value)}
                  className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                >
                  <option value="1">1 Creator (Solo)</option>
                  <option value="5">2-5 members (Indie Studio)</option>
                  <option value="15">6-15 members (Production House)</option>
                  <option value="50">16+ members (Enterprise Studio)</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">2. Original Show Concept</h2>
              <p className="text-sm text-gray-400">Describe the premise and genre boundaries of your series.</p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Working Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                  placeholder="e.g. The Upward Fall"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">One-Sentence Premise</label>
                <textarea 
                  value={premise}
                  onChange={e => setPremise(e.target.value)}
                  className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet h-20 resize-none"
                  placeholder="What is the central hook of the story?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Primary Genre</label>
                  <select 
                    value={genre}
                    onChange={e => setGenre(e.target.value)}
                    className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                  >
                    <option>Science Fiction</option>
                    <option>Fantasy</option>
                    <option>Mystery</option>
                    <option>Animated Drama</option>
                    <option>Comedy</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Age Rating</label>
                  <select 
                    value={ageRating}
                    onChange={e => setAgeRating(e.target.value)}
                    className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                  >
                    <option>G</option>
                    <option>PG</option>
                    <option>PG-13</option>
                    <option>R-17+</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Automation Level</label>
                  <select 
                    value={automationLevel}
                    onChange={e => setAutomationLevel(e.target.value)}
                    className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                  >
                    <option value="Copilot">Copilot (Human approves all)</option>
                    <option value="Supervised Autopilot">Supervised Autopilot</option>
                    <option value="Full Autopilot">Full Autopilot (No stops)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">3. World Rules and Tone</h2>
              <p className="text-sm text-gray-400">Establish the constraints, magic systems, or technological rules of your universe.</p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Magic or Science Constraints</label>
                <textarea 
                  value={magicRules}
                  onChange={e => setMagicRules(e.target.value)}
                  className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet h-24 resize-none"
                  placeholder="e.g. Gravity shifts only work if the character maintains clear mental focus..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Visual & Cinematic Tone</label>
                <input 
                  type="text" 
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                  placeholder="e.g. Steampunk slums, high-contrast neon purple lights, dark moody shadows."
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                4. Register Core Cast
              </h2>
              <p className="text-sm text-gray-400">Create the recurring protagonist, antagonist, or side character identities.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Character Name</label>
                  <input 
                    type="text" 
                    value={characterName}
                    onChange={e => setCharacterName(e.target.value)}
                    className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                    placeholder="Luna"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Role Type</label>
                  <select 
                    value={characterRole}
                    onChange={e => setCharacterRole(e.target.value)}
                    className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                  >
                    <option value="primary">Primary Protagonist</option>
                    <option value="antagonist">Antagonist</option>
                    <option value="supporting">Supporting Ally</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-brand-card/60 border border-brand-border flex items-center gap-4 relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="char-image-upload" 
                  className="hidden" 
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCharacterImage(URL.createObjectURL(file));
                    }
                  }}
                />
                
                {characterImage ? (
                  <div className="relative w-16 h-16 rounded overflow-hidden border border-brand-violet/50 shrink-0">
                    <img 
                      src={characterImage} 
                      alt="Uploaded character reference" 
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      type="button"
                      onClick={() => setCharacterImage(null)}
                      className="absolute top-0 right-0 bg-red-600/80 hover:bg-red-600 text-white rounded-bl p-0.5 text-[9px] font-bold"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label 
                    htmlFor="char-image-upload" 
                    className="w-16 h-16 rounded bg-brand-border/60 flex flex-col items-center justify-center text-[10px] text-gray-400 hover:bg-brand-border cursor-pointer transition border border-dashed border-gray-600 hover:border-brand-violet shrink-0"
                  >
                    <span>No Image</span>
                    <span className="text-[8px] text-brand-cyan mt-1">Upload</span>
                  </label>
                )}
                
                <div>
                  <h4 className="text-sm font-bold text-white">Visual Identity reference Pack</h4>
                  <p className="text-xs text-gray-400 mb-2">
                    {characterImage ? "Character reference image uploaded." : "Upload character visual images or reference seeds for visual consistency checks."}
                  </p>
                  {!characterImage && (
                    <label 
                      htmlFor="char-image-upload" 
                      className="inline-block px-3 py-1 rounded bg-brand-violet/20 hover:bg-brand-violet/30 border border-brand-violet/40 text-brand-violet text-xs font-bold cursor-pointer transition"
                    >
                      Choose File
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">5. Production Strategy & Budgets</h2>
              <p className="text-sm text-gray-400">Enforce limits on expected cost per shot before starting generation.</p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase flex justify-between">
                  <span>Per-Episode Budget Limit</span>
                  <span className="text-brand-cyan">{budgetPerEpisode} Credits</span>
                </label>
                <input 
                  type="range" 
                  min="20" 
                  max="200" 
                  value={budgetPerEpisode}
                  onChange={e => setBudgetPerEpisode(Number(e.target.value))}
                  className="w-full accent-brand-violet"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>20 cr (Draft mode)</span>
                  <span>100 cr (Economy/Standard)</span>
                  <span>200 cr (Premium)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Quality Tier</label>
                <select 
                  value={qualityTier}
                  onChange={e => setQualityTier(e.target.value)}
                  className="w-full rounded bg-brand-card border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet"
                >
                  <option value="DRAFT">DRAFT (Low cost, mock generation)</option>
                  <option value="ECONOMY">ECONOMY (Wan/Hailuo adapter, 720p)</option>
                  <option value="STANDARD">STANDARD (Kling/Runway, selective 1080p)</option>
                  <option value="PREMIUM">PREMIUM (High definition consistency)</option>
                </select>
              </div>

              <div className="p-4 rounded-lg bg-brand-violet/5 border border-brand-violet/20 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-violet shrink-0" />
                <span className="text-xs text-gray-300">Profitability check active: Auto-pauses if expected gross margin drops below 40%.</span>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-violet" /> 6. Generated Series Bible
              </h2>
              <p className="text-sm text-gray-400">Confirm rules and theme canon facts extracted by the genesis agent.</p>

              <div className="max-h-64 overflow-y-auto border border-brand-border rounded-lg p-4 bg-brand-card/90 space-y-4 text-sm">
                <div>
                  <h4 className="font-bold text-brand-cyan mb-1">Universe Logline</h4>
                  <p className="text-gray-300 leading-relaxed">{generatedBible?.summary}</p>
                </div>
                <div>
                  <h4 className="font-bold text-brand-cyan mb-1">Forbidden Contradictions</h4>
                  <ul className="list-disc pl-4 space-y-1 text-gray-300">
                    {generatedBible?.forbiddenContradictions?.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-brand-cyan mb-1">World Laws</h4>
                  <ul className="list-decimal pl-4 space-y-1 text-gray-300">
                    {generatedBible?.worldRules?.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-brand-violet to-brand-cyan rounded-full flex items-center justify-center mx-auto shadow-lg shadow-brand-violet/20">
                <Film className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-white">Pilot Ready for Outline Generation</h2>
                <p className="text-gray-400 max-w-md mx-auto text-sm">
                  We have mapped out Episode 1: "{generatedPilot?.title}" in Season 1. Expected cost is ~{generatedPilot?.estimatedCost} credits.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-brand-card border border-brand-border/60 max-w-sm mx-auto text-left space-y-2 text-xs">
                <div className="text-gray-400 font-bold uppercase">Initial Scene outline</div>
                <p className="text-gray-200">"{generatedPilot?.summary}"</p>
                <div className="text-gray-400">Character: {generatedPilot?.characterPack?.name} (Primary)</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="bg-brand-card/90 border-t border-brand-border py-4 px-6 flex justify-between items-center">
          {step === 1 ? (
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold hover:bg-brand-border transition text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          ) : (
            <button 
              onClick={() => {
                if (step === 6) {
                  setStep(5);
                } else {
                  prevStep();
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold hover:bg-brand-border transition text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          <div className="ml-auto">
            {step < 5 && (
              <button 
                onClick={nextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded bg-brand-violet hover:bg-brand-violet/90 text-white font-bold text-sm transition"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 5 && (
              <button 
                onClick={handleGenerateBible}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded bg-gradient-to-r from-brand-violet to-brand-cyan hover:brightness-110 text-white font-extrabold text-sm transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Create Series Bible
              </button>
            )}

            {step === 6 && (
              <button 
                onClick={nextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded bg-brand-violet hover:bg-brand-violet/90 text-white font-bold text-sm transition"
              >
                Approve Series Bible <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 7 && (
              <button 
                onClick={handleStartProduction}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded bg-gradient-to-r from-brand-violet to-brand-cyan hover:brightness-110 text-white font-extrabold text-sm transition shadow-lg shadow-brand-violet/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />} Run Pilot Production
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
