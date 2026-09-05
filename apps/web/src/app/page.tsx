'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Sparkles, 
  Cpu, 
  Film, 
  Sliders, 
  ShieldCheck, 
  Coins, 
  ChevronRight, 
  Layers, 
  Workflow, 
  Database, 
  BarChart3, 
  FlameKindling, 
  Users,
  ArrowUp
} from 'lucide-react';

export default function MarketingLandingPage() {
  const [activeTab, setActiveTab] = useState<'bible' | 'season' | 'rendering' | 'router'>('bible');
  const [demoLogIndex, setDemoLogIndex] = useState(0);

  // --- Cost Router Simulator State ---
  const [routerCategory, setRouterCategory] = useState<'action' | 'dialogue' | 'ambient'>('action');
  
  // --- Pricing Calculator State ---
  const [calcEpisodes, setCalcEpisodes] = useState(4);
  const [calcTier, setCalcTier] = useState<'standard' | 'high' | 'ultra'>('high');

  // --- Scroll to Top State ---
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const demoLogs = [
    { time: "12:04:10", service: "CanonLibrarian", text: "Verified screenplay scene 4 continuity: 0 contradictions found.", color: "text-brand-cyan" },
    { time: "12:04:12", service: "PricingEngine", text: "Selected MockVideoGen-v2 for Shot 4. Expected margin: 76%.", color: "text-brand-violet" },
    { time: "12:04:15", service: "AudioMixer", text: "Normalized dialog track. Ducking music under voice overlay.", color: "text-gray-400" },
    { time: "12:04:18", service: "QC-Inspector", text: "Aspect-ratio, face metrics pass. Episode 1 master render complete.", color: "text-brand-amber" },
    { time: "12:04:22", service: "Autopilot", text: "Scheduled Episode 2 storyboard generation for tomorrow.", color: "text-green-400" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoLogIndex(prev => (prev + 1) % demoLogs.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Cost router stats simulation
  const getRouterData = () => {
    switch (routerCategory) {
      case 'action':
        return {
          shotType: "Action Hero Shot (Close Up of Hover Jump)",
          selectedProvider: "fal.ai / Luma-DreamMachine",
          costSec: 2.0,
          qualityScore: "96/100",
          expectedMargin: "78%",
          reason: "Prioritized highest temporal motion fidelity over budget; gross margin remains above the 55% warning threshold."
        };
      case 'dialogue':
        return {
          shotType: "Dialogue Close Up (Leo Warning Luna)",
          selectedProvider: "MockAI / talking-character + ElevenLabs",
          costSec: 0.8,
          qualityScore: "88/100",
          expectedMargin: "91%",
          reason: "Fitted talking-character animation with lip-sync overlay, saving 72% in credits versus full 3D video generation."
        };
      case 'ambient':
        return {
          shotType: "Establishing Scene (Workshop Exterior Parallax)",
          selectedProvider: "MockAI / ImageGen + Parallax Still Layer",
          costSec: 0.2,
          qualityScore: "92/100",
          expectedMargin: "97%",
          reason: "Routed to 2D image generator with CSS viewport pan overlay. Clean layout, zero-video cost."
        };
    }
  };

  const routerData = getRouterData();

  // Pricing calculator math
  const getCalculatedPrice = () => {
    const baseCreditsPerEpisode = calcTier === 'standard' ? 40 : calcTier === 'high' ? 80 : 150;
    const creditsUsed = baseCreditsPerEpisode * calcEpisodes;
    const priceUSD = creditsUsed * 0.5; // $0.50 per credit
    return { creditsUsed, priceUSD };
  };

  const calcResult = getCalculatedPrice();

  return (
    <div className="relative min-h-screen bg-brand-bg text-white sky-grid overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="ambient-glow-violet top-20 left-10 pointer-events-none" />
      <div className="ambient-glow-gold top-[350px] right-20 pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-brand-border py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`} alt="Logo" className="w-9 h-9 rounded object-cover shadow-md" />
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-gold to-gray-400">EpisodicAI</span>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-sm text-gray-300 font-medium">
          <a href="#features" className="hover:text-brand-gold transition">Features</a>
          <a href="#workflow" className="hover:text-brand-gold transition">How It Works</a>
          <a href="#router" className="hover:text-brand-gold transition">Cost Router</a>
          <a href="#pricing" className="hover:text-brand-gold transition">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/signin" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md border border-brand-gold/30 hover:bg-brand-gold/10 text-brand-gold transition">
            Sign In
          </Link>
          <Link href="/onboarding" className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-md bg-gradient-to-r from-brand-gold via-brand-violet to-brand-cyan hover:brightness-110 text-white shadow-lg shadow-brand-violet/10 transition">
            Start Creating <ChevronRight className="w-4 h-4 text-brand-gold" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-brand-gold/10 border border-brand-gold/35 text-brand-gold font-mono tracking-wider uppercase text-[10px]">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous Showrunner OS
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white tracking-tight">
            Create a show once.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-gold via-white to-gray-400">
              Let the story live on.
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
            The first multi-tenant AI Series Studio. Build persistent fictional universes with structured canon tracking, visual character consistency, audio continuity, and automated gross profit protection.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 py-4 border-y border-brand-border/60">
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-gray-400 font-mono tracking-wide uppercase text-[9px] mt-1">Canon Continuity</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-brand-gold">65%+</div>
              <div className="text-xs text-gray-400 font-mono tracking-wide uppercase text-[9px] mt-1">Target Profit Margin</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-white">&lt; 1 hr</div>
              <div className="text-xs text-gray-400 font-mono tracking-wide uppercase text-[9px] mt-1">Episode Cycle</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/onboarding" className="inline-flex items-center gap-2 px-6 py-3.5 font-bold rounded-lg bg-gradient-to-r from-brand-gold via-brand-violet to-brand-cyan hover:brightness-110 text-white shadow-xl shadow-brand-gold/10 transition">
              Create Your First Series <ChevronRight className="w-5 h-5 text-brand-gold" />
            </Link>
            <a href="#workflow" className="inline-flex items-center gap-2 px-6 py-3.5 font-semibold rounded-lg bg-brand-card hover:bg-brand-border/50 border border-brand-border text-gray-300 transition">
              <Play className="w-4.5 h-4.5 fill-gray-300 text-brand-gold" /> Watch AI Work
            </a>
          </div>
        </div>

        {/* Right Column - Interactive Pipeline Visualization with designcode.io float layers */}
        <div className="lg:col-span-6 relative flex items-center justify-center py-8">
          {/* Floating background shape */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-brand-gold/10 to-brand-violet/10 rounded-2xl blur-xl opacity-70 float-slow pointer-events-none" />

          {/* Floating Card 1: Top Right Overlap (designcode.io depth) */}
          <div className="absolute -top-4 -right-2 bg-brand-card/95 border border-brand-gold/25 p-3 rounded-lg shadow-2xl float-medium z-20 w-44 space-y-1">
            <span className="text-[9px] font-mono font-bold text-brand-gold uppercase tracking-wider">Automated Ledger</span>
            <div className="text-sm font-extrabold text-white font-mono">+1,250.00 cr</div>
            <div className="text-[10px] text-gray-400">Licensing Royalty payout</div>
          </div>

          {/* Floating Card 2: Bottom Left Overlap (designcode.io depth) */}
          <div className="absolute -bottom-6 -left-2 bg-brand-card/95 border border-brand-violet/30 p-3 rounded-lg shadow-2xl float-fast z-20 w-44 space-y-1">
            <span className="text-[9px] font-mono font-bold text-brand-violet uppercase tracking-wider">Continuity Score</span>
            <div className="text-sm font-extrabold text-brand-cyan font-mono">98 / 100</div>
            <div className="text-[10px] text-gray-400">0 contradictions found</div>
          </div>

          {/* Main Visualizer Board */}
          <div className="w-full rounded-xl border border-brand-border bg-brand-card/70 backdrop-blur p-6 shadow-2xl space-y-6 float-slow relative z-10">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse"></span>
                <span className="text-xs font-semibold text-gray-400 tracking-wider">SERIES PIPELINE WORKSPACE</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/20"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/20"></span>
              </div>
            </div>

            {/* Simulated Live Show Cards */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-brand-card/90 border border-brand-border/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-brand-gold/20 to-brand-violet/20 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                    <Film className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Gravity’s Belief</h4>
                    <p className="text-xs text-gray-400">S1 • E1 "The Ground Zero"</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 text-xs rounded bg-brand-gold/15 border border-brand-gold/40 text-brand-gold font-semibold uppercase tracking-wider">
                  Generating
                </div>
              </div>

              {/* Status Stages */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded bg-brand-border/80 border border-brand-border/40 font-semibold text-gray-300">
                  Bible
                </div>
                <div className="p-2.5 rounded bg-brand-border/80 border border-brand-border/40 font-semibold text-gray-300">
                  Script
                </div>
                <div className="p-2.5 rounded bg-brand-gold/15 border border-brand-gold/35 font-semibold text-brand-gold animate-pulse">
                  Rendering
                </div>
                <div className="p-2.5 rounded bg-brand-border/30 border border-brand-border text-gray-600">
                  Publish
                </div>
              </div>

              {/* Live Status logs ticker */}
              <div className="rounded-lg bg-[#020306] border border-brand-border p-3.5 font-mono text-[11px] min-h-[96px] flex flex-col justify-end space-y-2">
                <div className="text-gray-500 font-bold border-b border-brand-border/40 pb-1 flex justify-between">
                  <span>ORCHESTRATOR LIVE LOGS</span>
                  <span>ONLINE</span>
                </div>
                <div className="transition duration-500 ease-in-out">
                  <span className="text-gray-500">[{demoLogs[demoLogIndex].time}]</span>{" "}
                  <span className={`${demoLogs[demoLogIndex].color} font-bold`}>{demoLogs[demoLogIndex].service}</span>:{" "}
                  <span className="text-gray-200">{demoLogs[demoLogIndex].text}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 1. FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/40">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Platform Core Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            EpisodicAI enforces the strict multi-layered continuity rules required to keep complex narratives scaling autonomously.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Series Canon Fact Lock",
              desc: "Chronological ledger tracking character conditions, facts, and relationships. Stops characters acting on information they haven't learned.",
              icon: Database
            },
            {
              title: "Character Identity Safeguards",
              desc: "Maintains lock on facial features, key outfits, and heights across different scenes, preventing image and video drift.",
              icon: Users
            },
            {
              title: "Acoustic Voice Continuity",
              desc: "Synchronizes persistent voice models and ambient acoustics, ensuring sound effects and dialogue maintain spatial consistency.",
              icon: Cpu
            },
            {
              title: "Automated Profit Router",
              desc: "Dynamically audits shot-level cost estimates, routing requests to optimal providers to enforce minimum 40%+ profit margins.",
              icon: Coins
            },
            {
              title: "Timeline Chronology Checker",
              desc: "Uses a state-machine parser to verify the physical sequence of events, flagging logic breaks like characters being in two places at once.",
              icon: Sliders
            },
            {
              title: "Rights, Safety & License Ledger",
              desc: "Ensures all generated audio-visual elements are cleared against copyright, maintaining consent, and safety compliance policies.",
              icon: ShieldCheck
            }
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="p-6 rounded-xl border border-brand-border bg-brand-card hover:border-brand-violet/50 hover:shadow-lg hover:shadow-brand-violet/5 transition duration-300 space-y-4">
                <div className="w-10 h-10 rounded bg-brand-violet/10 border border-brand-violet/30 flex items-center justify-center text-brand-violet">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="workflow" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/40">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">How the Show Operating System Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            EpisodicAI bridges the gap between creative writing and automatic production, ensuring no plot holes or visual drifts occur.
          </p>
        </div>

        {/* Tabs Headers */}
        <div className="flex justify-center border-b border-brand-border gap-2 overflow-x-auto pb-px">
          {[
            { id: 'bible', label: '1. Genesis to Bible', icon: Sliders },
            { id: 'season', label: '2. Season Blueprint', icon: Layers },
            { id: 'rendering', label: '3. Hybrid Rendering', icon: Workflow },
            { id: 'router', label: '4. Profit Router', icon: Coins }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm whitespace-nowrap transition ${
                  activeTab === t.id 
                    ? 'border-brand-violet text-brand-violet' 
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="mt-8 p-8 rounded-xl border border-brand-border glass-panel">
          {activeTab === 'bible' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-extrabold text-white">Generate an Immutable Series Bible</h3>
                <p className="text-gray-400 leading-relaxed">
                  Start with a simple logline or premise. The Show Genesis agent builds a comprehensive rule structure containing world history, prohibited contradictions, magic rules, character voices, and visual themes.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">✔ <strong className="text-brand-cyan">Character Traits Locker</strong>: Locks colors, heights, mannerisms.</li>
                  <li className="flex items-center gap-2">✔ <strong className="text-brand-cyan">Contradiction Blocker</strong>: Stops scripts violating world laws.</li>
                  <li className="flex items-center gap-2">✔ <strong className="text-brand-cyan">Knowledge Graph</strong>: Characters only act on what they know.</li>
                </ul>
              </div>
              <div className="p-5 rounded-lg bg-[#020306] border border-brand-border/60 font-mono text-xs text-gray-300 space-y-3">
                <div className="text-brand-cyan font-bold border-b border-brand-border/30 pb-1">// SERIES BIBLE DEFINITIONS</div>
                <div><strong className="text-brand-violet">"Title":</strong> "Gravity's Belief"</div>
                <div><strong className="text-brand-violet">"World Rules":</strong> [ "Gravity is subjective to alignment", "Steampunk machinery only" ]</div>
                <div><strong className="text-brand-violet">"Prohibited Contradictions":</strong> [ "No character can float without magnetic boots or alignment shifting" ]</div>
              </div>
            </div>
          )}

          {activeTab === 'season' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-extrabold text-white">Architect Complete Story Seasons</h3>
                <p className="text-gray-400 leading-relaxed">
                  The Season Architect splits your central conflict into A, B, and C plot lines, outlining episode objectives, pacing reversals, climaxes, and resolving cliffhangers.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">✔ <strong className="text-brand-cyan">Active Story Threads</strong>: Keeps tracking clues, alerts if forgotten.</li>
                  <li className="flex items-center gap-2">✔ <strong className="text-brand-cyan">Character Growth Arcs</strong>: Escalates relationships over 3-10 episodes.</li>
                </ul>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-brand-card border border-brand-border/60">
                  <h4 className="text-sm font-bold text-white mb-1">Episode 1: The Ground Zero</h4>
                  <p className="text-xs text-gray-400">Luna tests the boots in secrecy, but a Sky Guard sensor picks up the gravity pulse.</p>
                </div>
                <div className="p-4 rounded-lg bg-brand-card border border-brand-border/60">
                  <h4 className="text-sm font-bold text-white mb-1">Episode 2: Citadel Infiltration</h4>
                  <p className="text-xs text-gray-400">To secure an energy cell, Luna teams up with Leo to bypass high-security grids.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rendering' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-extrabold text-white">Hybrid Production Strategy</h3>
                <p className="text-gray-400 leading-relaxed">
                  Do not waste credits generating every frame with high-cost models. EpisodicAI blends talking-character overlays, parallax still layers, environmental backgrounds, and premium hero shots.
                </p>
                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-3 rounded bg-brand-card border border-brand-border">
                    <div className="text-brand-cyan font-bold">15%</div>
                    <div className="text-[10px] text-gray-400">Hero Action Clips</div>
                  </div>
                  <div className="p-3 rounded bg-brand-card border border-brand-border">
                    <div className="text-brand-violet font-bold">45%</div>
                    <div className="text-[10px] text-gray-400">Lip-Sync Talking</div>
                  </div>
                  <div className="p-3 rounded bg-brand-card border border-brand-border">
                    <div className="text-brand-amber font-bold">25%</div>
                    <div className="text-[10px] text-gray-400">Parallax Stills</div>
                  </div>
                  <div className="p-3 rounded bg-brand-card border border-brand-border">
                    <div className="text-gray-200 font-bold">15%</div>
                    <div className="text-[10px] text-gray-400">Reusable B-Roll</div>
                  </div>
                </div>
              </div>
              <div className="relative aspect-video rounded bg-brand-card border border-brand-border flex items-center justify-center">
                <span className="text-xs text-gray-400">[Deterministic Media Timeline Preview]</span>
              </div>
            </div>
          )}

          {activeTab === 'router' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-extrabold text-white">Cost-Aware Provider Routing</h3>
                <p className="text-gray-400 leading-relaxed">
                  The routing engine selects the cheapest model capable of meeting quality, motion, and consistency rules for every single shot.
                </p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                    <span className="text-gray-400">Target Gross Margin</span>
                    <span className="text-brand-cyan font-bold">65%</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                    <span className="text-gray-400">Warning Threshold</span>
                    <span className="text-brand-amber font-bold">55%</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                    <span className="text-gray-400">Hard-Stop Budget Cutoff</span>
                    <span className="text-red-400 font-bold">40%</span>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-lg bg-[#020306] border border-brand-border/60 font-mono text-xs space-y-2">
                <div className="text-brand-cyan font-bold border-b border-brand-border/30 pb-1">// ROUTER FORMULAS</div>
                <div className="text-gray-400">attempts = Math.ceil(1 / success_rate)</div>
                <div className="text-gray-400">cost = unit_cost * units * attempts</div>
                <div className="text-brand-violet">cost_per_usable_second = cost / (duration * success_rate * qc_pass_rate)</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. COST ROUTER SECTION */}
      <section id="router" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/40">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Cost-Aware Router Simulator</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Test the router's decision logic live. Select a shot category to watch the provider routing and margin calculations update instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Select Shot Category</h4>
            
            {[
              { id: 'action', title: "High-Action Hero Shot", desc: "Prioritizes temporal motion & camera pan" },
              { id: 'dialogue', title: "Dialogue / Conversation", desc: "Prioritizes audio sync & character speaking models" },
              { id: 'ambient', title: "Establishing B-Roll Scene", desc: "Prioritizes background detail & slow parallax" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setRouterCategory(cat.id as any)}
                className={`w-full text-left p-4 rounded-lg border transition duration-200 flex flex-col gap-1 ${
                  routerCategory === cat.id 
                    ? 'border-brand-violet bg-brand-violet/10 text-white' 
                    : 'border-brand-border bg-brand-card hover:bg-brand-border/30 text-gray-300'
                }`}
              >
                <span className="font-bold text-sm">{cat.title}</span>
                <span className="text-xs text-gray-400">{cat.desc}</span>
              </button>
            ))}

            <div className="p-4 rounded bg-brand-card border border-brand-border space-y-2 mt-4 text-xs text-gray-400">
              <span className="font-bold text-gray-300 block uppercase">Routing Policy</span>
              Our router computes margin thresholds in real-time. If expected margin drops below 55%, warnings trigger; if it drops below 40%, generation halts automatically.
            </div>
          </div>

          {/* Results Console */}
          <div className="lg:col-span-7 rounded-xl border border-brand-border bg-[#020306] p-6 font-mono text-sm flex flex-col justify-between space-y-6">
            <div className="border-b border-brand-border/50 pb-3 flex justify-between items-center text-xs text-gray-500">
              <span className="font-bold text-brand-cyan">ROUTING ENGINE CONSOLE</span>
              <span>STATE: ACTIVE</span>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <span className="text-gray-500">// Evaluated Shot Details:</span>
                <div className="text-white font-semibold mt-0.5">{routerData.shotType}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded bg-brand-card border border-brand-border/60">
                  <span className="text-xs text-gray-400 block">Selected Provider:</span>
                  <span className="text-brand-cyan font-bold text-md">{routerData.selectedProvider}</span>
                </div>
                <div className="p-3.5 rounded bg-brand-card border border-brand-border/60">
                  <span className="text-xs text-gray-400 block">Fidelity Score:</span>
                  <span className="text-green-400 font-bold text-md">{routerData.qualityScore}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded bg-brand-card border border-brand-border/60">
                  <span className="text-xs text-gray-400 block">Unit Cost:</span>
                  <span className="text-brand-violet font-bold text-md">{routerData.costSec} credits/sec</span>
                </div>
                <div className="p-3.5 rounded bg-brand-card border border-brand-border/60">
                  <span className="text-xs text-gray-400 block">Expected Margin:</span>
                  <span className="text-brand-amber font-bold text-md">{routerData.expectedMargin} Gross</span>
                </div>
              </div>

              <div className="text-xs text-gray-400 leading-relaxed bg-brand-card border border-brand-border/40 p-3 rounded">
                <span className="font-bold text-gray-300 uppercase block mb-1">Scoring Rationale:</span>
                {routerData.reason}
              </div>
            </div>

            <div className="border-t border-brand-border/30 pt-3 text-[11px] text-gray-500 flex justify-between">
              <span>PRICING ENGINE v1.2</span>
              <span>© EPISODICAI</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/40">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Transparent, Credit-Based Pricing</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Top-up credits as needed. No lock-in, no hidden costs. Pay only for the resources your series actually consumes.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              name: "Indie Creator",
              price: "$49",
              duration: "month",
              credits: "100 credits included",
              features: ["1 active show concept", "Standard quality rendering", "Shared workspace", "Continuity checker access", "Email support"],
              cta: "Start Creating",
              gradient: "from-brand-border to-brand-border/40"
            },
            {
              name: "Production House",
              price: "$199",
              duration: "month",
              credits: "500 credits included",
              features: ["3 active show concepts", "High-fidelity rendering options", "Multi-tenant workspaces (up to 5)", "Custom character voice profiles", "Priority rendering queues", "24/7 Slack Support"],
              cta: "Go Pro Now",
              gradient: "from-brand-violet/40 via-brand-violet/20 to-brand-card",
              highlight: true
            },
            {
              name: "Enterprise Studio",
              price: "$999",
              duration: "month",
              credits: "3,000 credits included",
              features: ["Unlimited active show concepts", "Ultra-high-fidelity rendering", "Unlimited workspace members", "Custom local provider integrations", "Dedicated rendering worker node", "Dedicated account manager"],
              cta: "Scale Studio",
              gradient: "from-brand-cyan/20 to-brand-card"
            }
          ].map((tier, index) => (
            <div 
              key={index}
              className={`relative rounded-xl border p-8 flex flex-col justify-between space-y-6 ${
                tier.highlight 
                  ? 'border-brand-violet bg-gradient-to-b ' + tier.gradient + ' shadow-xl shadow-brand-violet/5 scale-105 z-10' 
                  : 'border-brand-border bg-brand-card bg-gradient-to-b ' + tier.gradient
              }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-violet text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Most Popular
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">{tier.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-xs text-gray-400">/{tier.duration}</span>
                </div>
                <div className="text-sm font-semibold text-brand-cyan uppercase tracking-wider">{tier.credits}</div>
              </div>

              <ul className="space-y-2 text-sm text-gray-300 flex-1 py-4 border-t border-brand-border/40">
                {tier.features.map((feat, fi) => (
                  <li key={fi} className="flex items-start gap-2">
                    <span className="text-brand-violet mt-0.5">✔</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link 
                href="/onboarding"
                className={`w-full text-center py-3 rounded-lg font-bold text-sm transition ${
                  tier.highlight 
                    ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white hover:brightness-110 shadow-lg shadow-brand-violet/20' 
                    : 'bg-brand-border/60 hover:bg-brand-border text-white'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Pricing Estimator Tool */}
        <div className="rounded-xl border border-brand-border bg-brand-card p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-brand-border/40 pb-4">
            <Coins className="w-5 h-5 text-brand-cyan" />
            <h3 className="text-lg font-bold text-white">Dynamic Cost Calculator</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Controls */}
            <div className="space-y-6">
              {/* Episodes slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-semibold">Target Episodes / Month</span>
                  <span className="text-brand-cyan font-bold">{calcEpisodes} episodes</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="12" 
                  value={calcEpisodes}
                  onChange={e => setCalcEpisodes(Number(e.target.value))}
                  className="w-full accent-brand-violet bg-[#0b0c16] rounded-lg h-2"
                />
              </div>

              {/* Quality level selection */}
              <div className="space-y-2">
                <span className="text-gray-300 font-semibold text-sm block">Quality Tier / rendering Density</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', name: "Standard", desc: "40 credits/ep" },
                    { id: 'high', name: "High-Fidelity", desc: "80 credits/ep" },
                    { id: 'ultra', name: "Ultra-Motion", desc: "150 credits/ep" }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setCalcTier(t.id as any)}
                      className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition ${
                        calcTier === t.id 
                          ? 'border-brand-violet bg-brand-violet/10 text-white' 
                          : 'border-brand-border bg-[#05060f] hover:bg-brand-border/40 text-gray-400'
                      }`}
                    >
                      <span className="font-bold text-xs">{t.name}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Output display */}
            <div className="p-6 rounded-xl border border-brand-border bg-[#020306] text-center space-y-4">
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estimated Resource Requirement</div>
              <div className="space-y-1">
                <div className="text-3xl font-extrabold text-white">{calcResult.creditsUsed} Credits</div>
                <div className="text-sm text-gray-500">Consumed dynamically as scenes generate</div>
              </div>

              <div className="text-2xl font-bold text-brand-cyan">
                ${calcResult.priceUSD.toFixed(2)} <span className="text-xs text-gray-500 font-normal">/month</span>
              </div>

              <div className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                *Estimated billing based on 5 minutes per episode. Real cost adjusts depending on your timeline edits, shot retries, and provider choices.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border/60 py-12 px-6 md:px-12 text-center text-sm text-gray-500 bg-[#020306]">
        <div className="flex justify-center gap-6 mb-4">
          <a href="#" className="hover:text-gray-300">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300">Terms of Use</a>
          <a href="#" className="hover:text-gray-300">Support</a>
        </div>
        <p>© 2026 EpisodicAI. All rights reserved. Created for Next-Generation Creators.</p>
      </footer>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-tr from-brand-violet to-brand-cyan text-white shadow-lg shadow-brand-violet/20 hover:brightness-110 transition animate-fade-in"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
