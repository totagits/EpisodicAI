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
  FlameKindling
} from 'lucide-react';

export default function MarketingLandingPage() {
  const [activeTab, setActiveTab] = useState<'bible' | 'season' | 'rendering' | 'router'>('bible');
  const [demoLogIndex, setDemoLogIndex] = useState(0);

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

  return (
    <div className="relative min-h-screen sky-grid">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-brand-border py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center font-bold text-xl text-white">E</div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">EpisodicAI</span>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-sm text-gray-300 font-medium">
          <a href="#features" className="hover:text-brand-cyan transition">Features</a>
          <a href="#workflow" className="hover:text-brand-cyan transition">How It Works</a>
          <a href="#router" className="hover:text-brand-cyan transition">Cost Router</a>
          <a href="#pricing" className="hover:text-brand-cyan transition">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/onboarding" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md border border-brand-violet hover:bg-brand-violet/10 text-brand-violet transition">
            Sign In
          </Link>
          <Link href="/onboarding" className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-md bg-gradient-to-r from-brand-violet to-brand-violet/90 hover:from-brand-violet hover:to-brand-cyan text-white shadow-lg shadow-brand-violet/20 hover:shadow-brand-cyan/20 transition">
            Start Creating <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-brand-violet/10 border border-brand-violet/30 text-brand-violet">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous Showrunner OS
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
            Create a show once.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-violet via-brand-cyan to-white">
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
              <div className="text-xs text-gray-400">Canon Continuity</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-white">65%+</div>
              <div className="text-xs text-gray-400">Target Profit Margin</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-white">&lt; 1 hr</div>
              <div className="text-xs text-gray-400">Episode Cycle Time</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/onboarding" className="inline-flex items-center gap-2 px-6 py-3.5 font-bold rounded-lg bg-gradient-to-r from-brand-violet to-brand-cyan hover:brightness-110 text-white shadow-xl shadow-brand-violet/20 transition">
              Create Your First Series <ChevronRight className="w-5 h-5" />
            </Link>
            <a href="#workflow" className="inline-flex items-center gap-2 px-6 py-3.5 font-semibold rounded-lg bg-brand-card hover:bg-brand-border/50 border border-brand-border text-gray-200 transition">
              <Play className="w-4.5 h-4.5 fill-gray-200" /> Watch AI Work
            </a>
          </div>
        </div>

        {/* Right Column - Interactive Pipeline Visualization */}
        <div className="lg:col-span-6 relative">
          <div className="w-full rounded-xl border border-brand-border glass-panel p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse"></span>
                <span className="text-xs font-semibold text-gray-400">SERIES PIPELINE WORKSPACE</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/30"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/30"></span>
              </div>
            </div>

            {/* Simulated Live Show Cards */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-brand-card/90 border border-brand-border/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-brand-violet/20 to-brand-cyan/20 border border-brand-violet/30 flex items-center justify-center text-brand-cyan">
                    <Film className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Gravity’s Belief</h4>
                    <p className="text-xs text-gray-400">S1 • E1 "The Ground Zero"</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 text-xs rounded bg-brand-violet/20 border border-brand-violet/40 text-brand-violet font-semibold">
                  Generating
                </div>
              </div>

              {/* Status Stages */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded bg-brand-violet/20 border border-brand-violet/30 font-semibold text-brand-violet">
                  Bible
                </div>
                <div className="p-2.5 rounded bg-brand-violet/20 border border-brand-violet/30 font-semibold text-brand-violet">
                  Script
                </div>
                <div className="p-2.5 rounded bg-brand-cyan/20 border border-brand-cyan/30 font-semibold text-brand-cyan animate-pulse">
                  Rendering
                </div>
                <div className="p-2.5 rounded bg-brand-border/50 border border-brand-border text-gray-500">
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

      {/* Interactive Feature Demonstration Section */}
      <section id="workflow" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/40">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">How the Show operating System Works</h2>
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

      {/* Footer */}
      <footer className="border-t border-brand-border/60 py-12 px-6 md:px-12 text-center text-sm text-gray-500 bg-brand-bg">
        <div className="flex justify-center gap-6 mb-4">
          <a href="#" className="hover:text-gray-300">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300">Terms of Use</a>
          <a href="#" className="hover:text-gray-300">Support</a>
        </div>
        <p>© 2026 EpisodicAI. All rights reserved. Created for Next-Generation Creators.</p>
      </footer>
    </div>
  );
}
