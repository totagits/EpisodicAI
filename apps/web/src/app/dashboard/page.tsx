'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Film, 
  Cpu, 
  Sliders, 
  ShieldCheck, 
  Coins, 
  Play, 
  RotateCw, 
  History, 
  LineChart, 
  Users, 
  MapPin, 
  FileText,
  AlertTriangle,
  LogOut,
  FolderOpen,
  DollarSign,
  Workflow,
  Plus
} from 'lucide-react';
import TimelineEditor from '@/components/TimelineEditor';
import StoryGraph from '@/components/StoryGraph';
import { Shot } from '@episodic-ai/types';

export default function CreatorDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const showId = searchParams.get('showId') || 'shw-default';
  const [activeTab, setActiveTab] = useState<'overview' | 'bible' | 'timeline' | 'graph' | 'cost' | 'admin'>('overview');

  // --- Workspace & Show state ---
  const [show, setShow] = useState<any>(null);
  const [bible, setBible] = useState<any>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [qualityReport, setQualityReport] = useState<any>(null);

  // --- Production & Timeline State ---
  const [script, setScript] = useState<any>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // --- Billing & Ledger State ---
  const [creditBalance, setCreditBalance] = useState(250.0);
  const [creditReserved, setCreditReserved] = useState(0.0);
  const [ledger, setLedger] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState('50');

  // Load show details from API on mount
  useEffect(() => {
    fetchShowData();
    fetchBillingData();
  }, [showId]);

  const fetchShowData = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/shows/${showId}`);
      if (response.ok) {
        const data = await response.json();
        setShow(data.show);
        setBible(data.bible);
        setCharacters(data.characters || []);
        setLocations(data.locations || []);
      }
    } catch (e) {
      // Setup offline mock fallbacks so the app works instantly
      setShow({
        id: 'shw-default',
        title: "Gravity's Belief",
        premise: "A young mechanic discovers boots that control vertical gravity vectors.",
        genre: "Science Fiction",
        ageRating: "PG-13",
        automationLevel: "Copilot",
        budgetPerEpisode: 50.0,
        qualityTier: "STANDARD"
      });
      setBible({
        summary: "In a world where gravity is directional based on belief, a young mechanic designs boots that allow her to walk on walls, uncovering a corporate conspiracy.",
        worldRules: ["Gravity vectors are determined by spiritual alignment.", "Walking on the ceiling requires mental concentration."],
        forbiddenContradictions: ["Characters cannot change gravity direction instantly without a belief-shift."],
        visualIdentityNotes: "Deep purples, electric blues, neon light trails.",
        voiceIdentityNotes: "Cinematic, reverb-heavy dialogue."
      });
      setCharacters([
        { id: 'char-luna', name: 'Protagonist Luna', role: 'primary', age: 17, biography: 'Slum mechanic who built the gravity boots.' }
      ]);
      setLocations([
        { id: 'loc-workshop', name: 'Luna\'s Workshop', description: 'steampunk industrial shop' }
      ]);
    }
  };

  const fetchBillingData = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/billing/ledger');
      if (response.ok) {
        const data = await response.json();
        setCreditBalance(data.account.balance);
        setCreditReserved(data.account.reserved);
        setLedger(data.ledger || []);
      }
    } catch (e) {
      // Mock ledger data if offline
      setLedger([
        { id: 'led-1', type: 'grant', amount: 250.0, description: 'Initial workspace credits grant', createdAt: new Date() }
      ]);
    }
  };

  // Onboarding Step helper: triggers screenplay generation
  const handleGenerateScript = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/episodes/eps-default/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setScript(data.script);
      setQualityReport(data.report);
      // Fetch updated shots
      fetchProductionTimeline();
    } catch (e) {
      // Mock script / shots if API offline
      setScript({ content: "SCENE 1 - INT. WORKSHOP - DAY\nLuna soldering boot. Leo warns of danger." });
      setShots([
        {
          id: 'sht-mock1',
          sceneId: 'sce-mock',
          shotNumber: 1,
          durationSeconds: 4,
          shotType: 'Medium Shot',
          cameraAngle: 'Eye Level',
          cameraMovement: 'Static',
          compositionDescription: 'Luna at workbench soldering.',
          subjectDescription: 'Luna, 17, dark hair.',
          actionDescription: 'Luna solders a copper wire onto a heavy boot.',
          dialogue: { characterId: 'Luna', text: 'Just one more solder...', voiceId: 'voice-luna', emotion: 'focused' },
          promptText: 'steampunk female mechanic soldering glowing boot, cinematic.',
          productionMethod: 'talking-character',
          providerName: 'MockAI',
          modelName: 'MockImageGen-v2',
          estimatedCostCredits: 1.0,
          status: 'pending'
        },
        {
          id: 'sht-mock2',
          sceneId: 'sce-mock',
          shotNumber: 2,
          durationSeconds: 3,
          shotType: 'Close Up',
          cameraAngle: 'Low Angle',
          cameraMovement: 'Zoom',
          compositionDescription: 'Close up on boot spark.',
          subjectDescription: 'Steampunk boot.',
          actionDescription: 'The boot sole sparks blue and rises 2 inches.',
          promptText: 'Close up boot sparking and hovering off workbench, depth of field.',
          productionMethod: 'image-to-video',
          providerName: 'MockAI',
          modelName: 'MockVideoGen-v2',
          estimatedCostCredits: 4.5,
          status: 'pending'
        }
      ]);
      setQualityReport({
        overallScore: 95,
        findings: [
          { category: 'script_continuity', severity: 'low', description: 'Active High-Priority story thread "Citadel Infiltration" is not referenced in this episode.', suggestedFix: 'Ensure this thread is addressed next episode.' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductionTimeline = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/episodes/eps-default/production`);
      if (response.ok) {
        const data = await response.json();
        setShots(data.shots || []);
        if (data.qualityReport) setQualityReport(data.qualityReport);
      }
    } catch (e) {}
  };

  const handleUpdateShot = (id: string, updates: Partial<Shot>) => {
    setShots(prev => prev.map(sh => sh.id === id ? { ...sh, ...updates } : sh));
  };

  const handleRegenerateShot = (shot: Shot) => {
    alert(`Regenerating Shot ${shot.shotNumber} using provider ${shot.providerName}...`);
  };

  const handleTriggerRender = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/episodes/eps-default/render`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        setJobStatus({ progress: 10, status: 'running' });
        // Poll for progress updates
        pollJobStatus(data.jobId);
      } else {
        alert(data.error || 'Failed to trigger render');
      }
    } catch (e) {
      // Simulate rendering progress locally
      let prog = 10;
      const interval = setInterval(() => {
        prog += 30;
        if (prog >= 100) {
          clearInterval(interval);
          setJobStatus({ progress: 100, status: 'completed' });
          setCreditBalance(prev => prev - 5.5);
          // Set shots to mock completed
          setShots(prev => prev.map(sh => ({
            ...sh,
            status: 'completed',
            mediaUrl: sh.productionMethod === 'talking-character' 
              ? 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-clouds-in-a-blue-sky-41440-large.mp4' 
              : 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-43959-large.mp4'
          })));
          fetchBillingData();
        } else {
          setJobStatus({ progress: prog, status: 'running' });
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const pollJobStatus = (jobId: string) => {
    const timer = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/jobs/${jobId}`);
        const data = await response.json();
        setJobStatus(data);
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(timer);
          fetchBillingData();
          fetchProductionTimeline();
        }
      } catch (e) {
        clearInterval(timer);
      }
    }, 1500);
  };

  const handlePublish = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/episodes/eps-default/publish`, { method: 'POST' });
      const data = await response.json();
      alert(`Episode Published Successfully! Target URL: ${data.url}`);
    } catch (e) {
      alert('Mock Publish complete to YouTube channel "Original Studio"!');
    }
  };

  const handleDepositCredits = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/billing/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: depositAmount })
      });
      const data = await response.json();
      setCreditBalance(data.balance);
      fetchBillingData();
      alert(`Deposited ${depositAmount} credits successfully.`);
    } catch (e) {
      setCreditBalance(prev => prev + Number(depositAmount));
      alert(`Offline Deposit simulator complete: added ${depositAmount} credits.`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      {/* Sidebar Shell */}
      <aside className="w-64 border-r border-brand-border bg-brand-card flex flex-col">
        {/* Workspace Switcher */}
        <div className="p-4 border-b border-brand-border flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center font-bold text-white text-md">E</div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">Original Studio</h4>
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Workspace Admin</span>
          </div>
        </div>

        {/* Navigation lists */}
        <nav className="flex-1 p-4 space-y-1.5 text-sm text-gray-300">
          {[
            { id: 'overview', label: 'Series Overview', icon: Film },
            { id: 'bible', label: 'Series Bible', icon: FileText },
            { id: 'timeline', label: 'Writers & Timeline', icon: Sliders },
            { id: 'graph', label: 'Canon Story Graph', icon: Workflow },
            { id: 'cost', label: 'Cost & Margins', icon: Coins },
            { id: 'admin', label: 'Admin Settings', icon: Cpu }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded font-semibold transition ${
                  activeTab === item.id 
                    ? 'bg-brand-violet/10 text-brand-violet border-l-2 border-brand-violet' 
                    : 'hover:bg-brand-border/40 hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5" /> {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer info: balance tracking */}
        <div className="p-4 border-t border-brand-border bg-brand-bg/40 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-bold">Credit Balance</span>
            <span className="text-brand-cyan font-bold font-mono">{creditBalance.toFixed(2)} cr</span>
          </div>
          {creditReserved > 0 && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500 font-bold uppercase">Reserved</span>
              <span className="text-brand-amber font-mono">{creditReserved.toFixed(2)} cr</span>
            </div>
          )}
          <button 
            onClick={() => setActiveTab('cost')}
            className="w-full text-center text-xs font-bold py-2 bg-brand-border/50 border border-brand-border/80 rounded hover:bg-brand-border text-gray-300 transition"
          >
            Deposit Credits
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-brand-bg">
        {/* Top Header navbar bar */}
        <header className="h-14 border-b border-brand-border bg-brand-card/75 flex items-center justify-between px-8 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <span className="text-gray-500">Active Show:</span>
            <span className="text-white font-bold text-sm bg-brand-border px-3 py-1 rounded">
              {show?.title || "Gravity's Belief"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">Autopilot mode:</span>
            <span className="px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-bold">
              {show?.automationLevel || "Copilot"}
            </span>
          </div>
        </header>

        {/* Workspace Panels container */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Headline Banner */}
              <div className="p-6 rounded-xl border border-brand-border bg-gradient-to-r from-brand-card to-brand-border/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white">S1 E1 "The Ground Zero" Outline</h2>
                  <p className="text-sm text-gray-400">Active drafting and rendering cycle.</p>
                </div>
                <div className="flex gap-2.5">
                  <button 
                    onClick={handleGenerateScript}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-brand-violet hover:bg-brand-violet/90 text-white font-bold transition disabled:opacity-50"
                  >
                    <RotateCw className="w-4 h-4" /> 
                    {shots.length > 0 ? "Re-Draft Script" : "Generate Outline & Script"}
                  </button>
                  {shots.length > 0 && (
                    <button 
                      onClick={handleTriggerRender}
                      disabled={loading || (jobStatus?.status === 'running')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-gradient-to-r from-brand-violet to-brand-cyan hover:brightness-110 text-white font-bold transition disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" /> Render Episode
                    </button>
                  )}
                </div>
              </div>

              {/* Status Alert for Background Renderer */}
              {jobStatus && (
                <div className="p-4 rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
                      Render Job Progress: {jobStatus.status === 'completed' ? 'Success' : `${jobStatus.progress}%`}
                    </h4>
                    <p className="text-xs text-gray-400">Stitching generated video clips and syncing audio tracks...</p>
                  </div>
                  <div className="w-full md:w-48 bg-brand-border/50 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-cyan h-full transition-all duration-300"
                      style={{ width: `${jobStatus.progress}%` }}
                    />
                  </div>
                  {jobStatus.status === 'completed' && (
                    <button 
                      onClick={handlePublish}
                      className="px-4 py-1.5 rounded bg-brand-amber hover:bg-brand-amber/90 text-white font-bold"
                    >
                      Publish Episode
                    </button>
                  )}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Budget Limit Card */}
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-2">
                  <div className="text-gray-500 font-bold uppercase text-[10px]">Episode Budget Allocated</div>
                  <div className="text-3xl font-extrabold text-white">{show?.budgetPerEpisode || 50.0} credits</div>
                  <div className="text-xs text-brand-cyan">Reserved for render: {creditReserved.toFixed(2)} cr</div>
                </div>

                {/* Actual Cost */}
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-2">
                  <div className="text-gray-500 font-bold uppercase text-[10px]">Actual Episode Cost</div>
                  <div className="text-3xl font-extrabold text-white">
                    {shots.some(s => s.status === 'completed') ? shots.reduce((acc, s) => acc + (s.actualCostCredits || 0), 0).toFixed(2) : "0.00"} cr
                  </div>
                  <div className="text-xs text-gray-400">Reconciled via Cost-Aware Router</div>
                </div>

                {/* Expected Margins */}
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-2">
                  <div className="text-gray-500 font-bold uppercase text-[10px]">Expected Gross Margin</div>
                  <div className="text-3xl font-extrabold text-brand-cyan">74%</div>
                  <div className="text-xs text-gray-400">Autopilot hard-stop threshold: 40%</div>
                </div>
              </div>

              {/* Quality Control Findings and Script Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Script Panel */}
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card flex flex-col h-[380px]">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-violet" /> Screenplay Draft
                  </h3>
                  <div className="flex-1 bg-[#020306] border border-brand-border/60 rounded p-4 overflow-y-auto font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {script ? script.content : (
                      <span className="text-gray-500">[Click 'Generate Outline & Script' to construct the screenplay draft]</span>
                    )}
                  </div>
                </div>

                {/* Quality Findings */}
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card flex flex-col h-[380px]">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-cyan" /> Continuity & Quality Report
                  </h3>
                  
                  {qualityReport ? (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                        <span className="text-xs font-semibold text-gray-400">Overall QC Score</span>
                        <span className={`text-lg font-bold ${
                          qualityReport.overallScore >= 90 ? 'text-brand-cyan' : 'text-brand-amber'
                        }`}>
                          {qualityReport.overallScore} / 100
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto py-3 space-y-3">
                        {qualityReport.findings.map((f: any, idx: number) => (
                          <div key={idx} className="p-3.5 rounded bg-brand-border/40 border border-brand-border/60 space-y-1 text-xs">
                            <div className="flex justify-between font-bold">
                              <span className="text-brand-amber flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> {f.category}
                              </span>
                              <span className="uppercase text-[9px] text-gray-500">{f.severity}</span>
                            </div>
                            <p className="text-gray-300">{f.description}</p>
                            <p className="text-gray-500 italic">Fix: {f.suggestedFix}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-gray-500">
                      <ShieldCheck className="w-10 h-10 text-brand-border mb-2" />
                      Run Outline & Script generation to review automated script and visual continuity checker findings.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bible' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rules */}
                <div className="lg:col-span-2 p-5 rounded-xl border border-brand-border bg-brand-card space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2">Series World Rules</h3>
                  <ul className="space-y-3 text-xs text-gray-300">
                    {bible?.worldRules.map((rule: string, idx: number) => (
                      <li key={idx} className="p-3 rounded bg-brand-border/30 border border-brand-border/40 leading-relaxed">
                        <strong className="text-brand-cyan">Law {idx + 1}:</strong> {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Info summary */}
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2">Visual & Voice Guidelines</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[9px] block">Visual Theme</span>
                      <p className="text-gray-300 mt-1">{bible?.visualIdentityNotes}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[9px] block">Voice Dialect</span>
                      <p className="text-gray-300 mt-1">{bible?.voiceIdentityNotes}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Characters */}
              <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2">Character Registry</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {characters.map((char, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-brand-border/40 border border-brand-border/60 flex gap-4">
                      <div className="w-12 h-12 rounded bg-gradient-to-tr from-brand-violet/20 to-brand-cyan/20 border border-brand-violet/30 flex items-center justify-center font-bold text-brand-cyan">
                        L
                      </div>
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-white">{char.name} ({char.age} yrs)</h4>
                        <span className="uppercase text-[9px] text-brand-violet font-semibold block">{char.role}</span>
                        <p className="text-gray-400 leading-relaxed">{char.biography}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-brand-border bg-gradient-to-r from-brand-card to-brand-border/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white">Production Studio Timeline</h2>
                  <p className="text-sm text-gray-400">Edit script layout, split clips, swap providers and generate preview cuts.</p>
                </div>
                {shots.length > 0 && (
                  <button 
                    onClick={handleTriggerRender}
                    disabled={loading || (jobStatus?.status === 'running')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-brand-violet hover:bg-brand-violet/90 text-white font-bold transition"
                  >
                    <Sparkles className="w-4 h-4" /> Render Timeline preview
                  </button>
                )}
              </div>

              {shots.length > 0 ? (
                <TimelineEditor 
                  shots={shots}
                  onUpdateShot={handleUpdateShot}
                  onRegenerateShot={handleRegenerateShot}
                />
              ) : (
                <div className="p-16 text-center border border-dashed border-brand-border rounded-xl bg-brand-card space-y-3">
                  <p className="text-sm text-gray-500">No screenplay shots loaded yet.</p>
                  <button 
                    onClick={handleGenerateScript}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-brand-border hover:bg-brand-border/90 border border-brand-border/80 text-gray-200 text-xs font-bold transition"
                  >
                    Generate Script Outline
                  </button>
                </div>
              )}

              {/* Video Preview Window if rendered */}
              {shots.some(s => s.status === 'completed' && s.mediaUrl) && (
                <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2">Master Video Cut</h3>
                  <div className="aspect-video max-w-2xl mx-auto rounded overflow-hidden border border-brand-border bg-[#020306]">
                    <video 
                      src={shots.find(s => s.mediaUrl)?.mediaUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'graph' && (
            <StoryGraph />
          )}

          {activeTab === 'cost' && (
            <div className="space-y-6">
              {/* Deposit Card */}
              <div className="p-6 rounded-xl border border-brand-border bg-brand-card grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Purchase Production Credits</h3>
                  <p className="text-xs text-gray-400">Buy additional credits instantly. Standard generation jobs consume credits based on duration and model complexity.</p>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="rounded bg-brand-bg border border-brand-border p-3 text-sm text-white focus:outline-none focus:border-brand-violet w-24 text-center font-bold"
                  />
                  <button 
                    onClick={handleDepositCredits}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded bg-brand-violet hover:bg-brand-violet/90 text-white font-bold text-sm transition"
                  >
                    Deposit Credits
                  </button>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-brand-cyan" /> Workspace Credit Ledger (Immutable)
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border/60 text-gray-400">
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Type</th>
                        <th className="py-2.5">Description</th>
                        <th className="py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-500">No ledger transaction logs recorded.</td>
                        </tr>
                      ) : (
                        ledger.map((log: any, idx: number) => (
                          <tr key={idx} className="border-b border-brand-border/20">
                            <td className="py-2.5 text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                            <td className="py-2.5">
                              <span className={`uppercase text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                log.type === 'purchase' || log.type === 'grant' || log.type === 'refund'
                                  ? 'bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan'
                                  : 'bg-brand-amber/10 border border-brand-amber/20 text-brand-amber'
                              }`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="py-2.5 text-gray-300">{log.description}</td>
                            <td className={`py-2.5 text-right font-bold font-mono ${
                              log.type === 'purchase' || log.type === 'grant' || log.type === 'refund'
                                ? 'text-brand-cyan'
                                : 'text-brand-amber'
                            }`}>
                              {log.type === 'purchase' || log.type === 'grant' || log.type === 'refund' ? '+' : '-'}{log.amount.toFixed(2)} cr
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-6">
              {/* Providers Health & pricing */}
              <div className="p-5 rounded-xl border border-brand-border bg-brand-card space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2">Provider Pricing Table</h3>
                
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border/60 text-gray-400">
                        <th className="py-2">Provider</th>
                        <th className="py-2">Model</th>
                        <th className="py-2">Capability</th>
                        <th className="py-2 text-right">Cost / Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seedPricing.map((pricing: any) => (
                        <tr key={pricing.id} className="border-b border-brand-border/20">
                          <td className="py-2 font-bold text-white">{pricing.providerName}</td>
                          <td className="py-2 text-gray-300">{pricing.modelName}</td>
                          <td className="py-2 text-gray-500 uppercase text-[10px]">{pricing.capability}</td>
                          <td className="py-2 text-right font-mono text-brand-cyan">{pricing.costPerUnit} cr / {pricing.costUnit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
