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
  ArrowUp,
  Lock,
  Check,
  Zap,
  Gift,
  Tv,
  PenTool,
  DollarSign,
  Heart,
  Volume2,
  X,
  FastForward
} from 'lucide-react';

interface ColdOpenStory {
  id: string;
  title: string;
  genre: string;
  views: string;
  duration: string;
  rating: string;
  gradient: string;
  accentBorder: string;
  accentColor: string;
  logline: string;
  cliffhanger: string;
  characters: string[];
  subtitles: string[];
  cameraDirective: string;
  episodesAvailable: number;
}

const COLD_OPEN_STORIES: ColdOpenStory[] = [
  {
    id: 'gravity',
    title: "Gravity’s Belief",
    genre: "Sci-Fi Thriller",
    views: "1.4M views",
    duration: "0:58 Cold Open",
    rating: "9.8",
    gradient: "from-blue-600/30 via-brand-card to-brand-card",
    accentBorder: "border-blue-500/40",
    accentColor: "text-blue-400",
    logline: "Luna boots up the prototype gravity inversion boots in an abandoned hangar. As she hovers 20 feet in the air, a military patrol drone's red targeting laser locks onto her forehead.",
    cliffhanger: "Drone weapon charges with high-pitched whine... Boots start sparking violently... She reaches for the emergency cut switch—CUT TO BLACK.",
    characters: ["Luna (Mechanic)", "Sky Patrol Drone #4"],
    subtitles: [
      "Luna: 'If the patrol spots this vector, we only have four seconds.'",
      "Drone: *TARGET ACQUIRED. CEASE ILLEGAL PROPULSION.*",
      "Luna: 'Not today. Hold on!'"
    ],
    cameraDirective: "Dolly push-in on Luna's eyes -> Quick rack focus to red laser beam -> Hard cut to black",
    episodesAvailable: 12
  },
  {
    id: 'billionaire',
    title: "The Billionaire’s Silent Bride",
    genre: "Romance Drama",
    views: "3.8M views",
    duration: "1:15 Cold Open",
    rating: "9.9",
    gradient: "from-rose-600/30 via-brand-card to-brand-card",
    accentBorder: "border-rose-500/40",
    accentColor: "text-rose-400",
    logline: "Elena arrives at the grand estate in pouring rain, forced to marry the reclusive tech titan Julian Kane. As the chapel doors swing open, she realizes Julian is the masked vigilante who saved her life five years ago.",
    cliffhanger: "Julian steps into the candlelight, lifts his veil, and whispers: 'Did you really think I wouldn't recognize you, Elena?'—CUT TO BLACK.",
    characters: ["Elena Vance", "Julian Kane"],
    subtitles: [
      "Priest: 'Do you take Julian Kane to be your lawfully wedded husband?'",
      "Elena: *My hands are shaking... his eyes. Those are the same eyes from that night.*",
      "Julian: 'Answer him, Elena. Or should I tell everyone who you really are?'"
    ],
    cameraDirective: "Slow tracking pan through rain-soaked cathedral -> Extreme close-up on Julian's eyes",
    episodesAvailable: 24
  },
  {
    id: 'bloodlines',
    title: "Bloodlines of the Iron Sovereign",
    genre: "Dark Fantasy",
    views: "2.1M views",
    duration: "1:02 Cold Open",
    rating: "9.7",
    gradient: "from-amber-600/30 via-brand-card to-brand-card",
    accentBorder: "border-amber-500/40",
    accentColor: "text-amber-400",
    logline: "Prince Kaelen stands before the poisoned king. The royal guard draws their swords, framing him for regicide. But Kaelen's eyes ignite with forbidden dragonfire as the throne room doors blast inward.",
    cliffhanger: "The High Commander's blade stops an inch from his throat as wings of black flame unfold behind Kaelen—CUT TO BLACK.",
    characters: ["Prince Kaelen", "High Commander Vane"],
    subtitles: [
      "Vane: 'Sheath your sword, Prince. You die as a traitor tonight.'",
      "Kaelen: 'You forgot one thing, Commander. My father was mortal. I am not.'",
      "*Flames roar across the marble floor*"
    ],
    cameraDirective: "Low angle tilt-up on throne -> Rapid zoom as dragonfire ignites in Kaelen's iris",
    episodesAvailable: 16
  },
  {
    id: 'neon',
    title: "Neon Syndicate: Protocol 9",
    genre: "Cyberpunk Crime",
    views: "980K views",
    duration: "0:52 Cold Open",
    rating: "9.6",
    gradient: "from-cyan-600/30 via-brand-card to-brand-card",
    accentBorder: "border-cyan-500/40",
    accentColor: "text-cyan-400",
    logline: "Ex-detective Marcus intercepts an encrypted neural chip from a black-market courier. When he decrypts the audio stream, it's his own daughter's voice, reporting her own assassination.",
    cliffhanger: "A cybernetic sniper round shatters his window. On the chip, her voice whispers: 'Father, don't look behind you.'—CUT TO BLACK.",
    characters: ["Marcus Cole", "Ghost Audio Stream"],
    subtitles: [
      "Audio Stream: 'Subject ID 4402... Time of death recorded at 03:00 hours.'",
      "Marcus: 'Maya? That's impossible, Maya died three years ago...'",
      "Audio Stream: 'Father, don't look behind you.'"
    ],
    cameraDirective: "Handheld dutch angle on Marcus -> Bullet hole parallax -> Whip pan to shadow in doorway",
    episodesAvailable: 10
  },
  {
    id: 'alchemist',
    title: "The Alchemist of Midnight Court",
    genre: "Victorian Mystery",
    views: "1.7M views",
    duration: "1:05 Cold Open",
    rating: "9.7",
    gradient: "from-emerald-600/30 via-brand-card to-brand-card",
    accentBorder: "border-emerald-500/40",
    accentColor: "text-emerald-400",
    logline: "In Victorian London, an apothecary girl accidentally brews a serum that reveals human souls. Her very first client is the Prime Minister—and his soul is a writhing shadow with six glowing eyes.",
    cliffhanger: "The Prime Minister turns his head 180 degrees with a sickening crunch and smiles: 'You weren't supposed to see that, Miss Ward.'—CUT TO BLACK.",
    characters: ["Isla Ward", "Lord Sterling"],
    subtitles: [
      "Isla: 'Drink this potion, My Lord, and your fever will break.'",
      "*Serum illuminates Lord Sterling's reflection in the mirror*",
      "Lord Sterling: 'Fascinating. Tell me, Isla... do you scream loudly?'"
    ],
    cameraDirective: "Mirror reflection tracking shot -> Depth of field blur revealing demonic shadow",
    episodesAvailable: 14
  },
  {
    id: 'colony',
    title: "Apex Predator: Zero Colony",
    genre: "Sci-Fi Horror",
    views: "890K views",
    duration: "0:48 Cold Open",
    rating: "9.5",
    gradient: "from-purple-600/30 via-brand-card to-brand-card",
    accentBorder: "border-purple-500/40",
    accentColor: "text-purple-400",
    logline: "Miner Jackson drills through the ice crust of Europa. The seismic monitor flatlines. Inside the ice cavity, a humanoid hand the size of a submarine presses against the glass.",
    cliffhanger: "The ice cracks. An eye opens within the frozen palm, staring straight into Jackson's helmet camera—CUT TO BLACK.",
    characters: ["Jackson (Drill Lead)", "Europa Entity"],
    subtitles: [
      "Base Camp: 'Jackson, pull out. The tectonic stress is spiking!'",
      "Jackson: 'There is something in the ice... God help us, it's breathing.'",
      "*CRACK* The eye opens."
    ],
    cameraDirective: "First-person helmet camera view with heavy breathing audio -> Static glitch blackout",
    episodesAvailable: 8
  }
];

export default function MarketingLandingPage() {
  const [activeTab, setActiveTab] = useState<'coldopen' | 'subscription' | 'coins' | 'royalty'>('coldopen');
  const [demoLogIndex, setDemoLogIndex] = useState(0);

  // --- Cost Router Simulator State ---
  const [routerCategory, setRouterCategory] = useState<'action' | 'dialogue' | 'ambient'>('action');
  
  // --- Pocket FM Model Interactive States ---
  const [selectedCoinPack, setSelectedCoinPack] = useState<'pack_19' | 'pack_24' | 'pack_29' | 'pack_1'>('pack_24');
  const [writerUnlocks, setWriterUnlocks] = useState<number>(5000);

  // --- Cold Open Theater States ---
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [playingStory, setPlayingStory] = useState<ColdOpenStory | null>(null);
  const [cinemaProgress, setCinemaProgress] = useState<number>(0);
  const [isCinemaPlaying, setIsCinemaPlaying] = useState<boolean>(false);
  const [showPaywallHook, setShowPaywallHook] = useState<boolean>(false);

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

  // Cinema Player Progress Simulation
  useEffect(() => {
    let timer: any;
    if (isCinemaPlaying && cinemaProgress < 100) {
      timer = setInterval(() => {
        setCinemaProgress(prev => {
          if (prev >= 98) {
            setIsCinemaPlaying(false);
            setShowPaywallHook(true);
            return 100;
          }
          return prev + 2;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isCinemaPlaying, cinemaProgress]);

  const handleOpenCinema = (story: ColdOpenStory) => {
    setPlayingStory(story);
    setCinemaProgress(0);
    setIsCinemaPlaying(true);
    setShowPaywallHook(false);
  };

  const handleCloseCinema = () => {
    setPlayingStory(null);
    setIsCinemaPlaying(false);
    setShowPaywallHook(false);
  };

  const demoLogs = [
    { time: "12:04:10", service: "PocketFMEngine", text: "Cold Open Ep 1 verified: 0 coins required for guest viewer.", color: "text-brand-cyan" },
    { time: "12:04:12", service: "RoyaltyLedger", text: "Episode 4 unlocked (9 coins). Credited +$0.35 royalty to writer balance.", color: "text-brand-gold" },
    { time: "12:04:15", service: "PricingEngine", text: "Selected MiniMax-Video for Shot 3. Cost $0.08/s. Platform margin: 68%.", color: "text-brand-violet" },
    { time: "12:04:18", service: "WriterStudio", text: "Subscriber validated ($5/mo pass). Episode 2 script compiled to video.", color: "text-green-400" },
    { time: "12:04:22", service: "Autopilot", text: "Distributed Episode 5 cliffhanger. Projected 35% royalty: $420.00.", color: "text-brand-amber" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoLogIndex(prev => (prev + 1) % demoLogs.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Cost router stats simulation based on Pocket FM unit economics ($1.00 / 9 coins per episode unlock)
  const getRouterData = () => {
    switch (routerCategory) {
      case 'action':
        return {
          shotType: "Action Hero Shot (Close Up of Hover Jump)",
          selectedProvider: "fal.ai / Kling AI 3.0 Pro",
          costSec: "$0.06/sec",
          qualityScore: "96/100",
          expectedMargin: "66% Platform Net",
          reason: "Prioritized native clip continuation and cinematic temporal motion. Keeps total episode compute well under the $0.65 platform ceiling."
        };
      case 'dialogue':
        return {
          shotType: "Dialogue Close Up (Leo Warning Luna)",
          selectedProvider: "MiniMax (Hailuo) + ElevenLabs LipSync",
          costSec: "$0.04/sec",
          qualityScore: "92/100",
          expectedMargin: "78% Platform Net",
          reason: "High-motion human consistency with synced acoustic voice, saving 62% vs raw 3D video while delivering 4K facial fidelity."
        };
      case 'ambient':
        return {
          shotType: "Establishing Scene (Workshop Exterior Parallax)",
          selectedProvider: "Wan 2.1 Open-Weights (fal.ai / Replicate)",
          costSec: "$0.015/sec",
          qualityScore: "91/100",
          expectedMargin: "89% Platform Net",
          reason: "Ultra-cheap open weights model used for environment B-roll, maximizing the 65% platform margin and guaranteeing the writer's 35% payout."
        };
    }
  };

  const routerData = getRouterData();

  // Pocket FM Coin Pack Definitions (matching user's uploaded modal)
  const coinPacks = [
    {
      id: 'pack_19',
      badge: '20% BONUS + NO ADS FOR 2 WEEKS',
      baseCoins: 136,
      bonusCoins: 29,
      totalCoins: 165,
      price: '$19.99',
      episodesUnlocked: '~18 Episodes',
      perEp: '$1.11 / ep'
    },
    {
      id: 'pack_24',
      badge: '20% BONUS + NO ADS FOR 1 MONTH',
      baseCoins: 170,
      bonusCoins: 42,
      totalCoins: 212,
      price: '$24.99',
      episodesUnlocked: '~23 Episodes',
      perEp: '$1.08 / ep',
      popular: true
    },
    {
      id: 'pack_29',
      badge: '25% BONUS + NO ADS FOR 1 MONTH',
      baseCoins: 204,
      bonusCoins: 51,
      totalCoins: 255,
      price: '$29.99',
      episodesUnlocked: '~28 Episodes',
      perEp: '$1.07 / ep'
    },
    {
      id: 'pack_1',
      badge: 'SINGLE EPISODE UNLOCK',
      baseCoins: 9,
      bonusCoins: 0,
      totalCoins: 9,
      price: '$1.00',
      episodesUnlocked: '1 Episode',
      perEp: '$1.00 / ep'
    }
  ];

  // Filtered cold open stories
  const filteredStories = selectedGenre === 'All' 
    ? COLD_OPEN_STORIES 
    : COLD_OPEN_STORIES.filter(s => s.genre.toLowerCase().includes(selectedGenre.toLowerCase()));

  // Writer royalty math (35% of $1.00 per episode unlock)
  const grossRevenue = writerUnlocks * 1.00;
  const writerRoyaltyPayout = grossRevenue * 0.35;
  const platformOpsShare = grossRevenue * 0.65;

  return (
    <div className="relative min-h-screen bg-brand-bg text-white sky-grid overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="ambient-glow-violet top-20 left-10 pointer-events-none" />
      <div className="ambient-glow-gold top-[350px] right-20 pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-brand-border py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`} 
            alt="EpisodicAI Logo" 
            className="w-10 h-10 rounded-lg object-cover shadow-md ring-1 ring-brand-gold/40" 
          />
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-gold to-gray-300">
            EpisodicAI
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-sm text-gray-300 font-medium">
          <a href="#cold-opens" className="hover:text-brand-gold transition font-bold text-white flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" /> Free Cold Opens
          </a>
          <a href="#features" className="hover:text-brand-gold transition">Two-Front Model</a>
          <a href="#workflow" className="hover:text-brand-gold transition">How It Works</a>
          <a href="#pricing" className="hover:text-brand-gold transition">Pricing &amp; Pass</a>
          <a href="#coin-store" className="hover:text-brand-gold transition">Coin Store</a>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/signin" 
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md border border-brand-gold/30 hover:bg-brand-gold/10 text-brand-gold transition"
          >
            Sign In
          </Link>
          <Link 
            href="/onboarding" 
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-md bg-gradient-to-r from-brand-gold via-brand-violet to-brand-cyan hover:brightness-110 text-white shadow-lg shadow-brand-gold/20 transition"
          >
            Start Writing ($5/mo) <ChevronRight className="w-4 h-4 text-brand-gold" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-full bg-brand-gold/15 border border-brand-gold/40 text-brand-gold font-mono tracking-wider uppercase text-[10px]">
            <Sparkles className="w-3.5 h-3.5" /> Pocket FM Video Model • Cold Opens Free • $5 = 5 Episodes + Writer Pass
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white tracking-tight">
            Stream free Cold Opens.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-gold via-white to-gray-300">
              Get hooked &amp; write your own.
            </span>
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
            Passersby can play Cold Opens across dozens of AI series completely free. When a story hooks you, subscribe for <strong>$5.00</strong> to instantly unlock the next <strong>5 full episodes</strong> and receive your <strong>AI Writer Pass</strong> to create your own series with a <strong>35% cash royalty</strong>.
          </p>

          {/* Quick Metrics: The Two Fronts */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-brand-border/80">
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-white">FREE</div>
              <div className="text-xs text-gray-400 font-mono tracking-wide uppercase text-[9px] mt-1">Play Cold Opens Free</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-brand-gold">$5.00<span className="text-xs text-gray-400 font-normal">/mo</span></div>
              <div className="text-xs text-gray-400 font-mono tracking-wide uppercase text-[9px] mt-1">5 Episodes + Writer Pass</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-brand-cyan">35%</div>
              <div className="text-xs text-gray-400 font-mono tracking-wide uppercase text-[9px] mt-1">Writer Cash Royalty</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <a 
              href="#cold-opens" 
              className="inline-flex items-center gap-2 px-6 py-3.5 font-bold rounded-lg bg-gradient-to-r from-brand-gold via-brand-violet to-brand-cyan hover:brightness-110 text-white shadow-xl shadow-brand-gold/15 transition"
            >
              <Play className="w-4.5 h-4.5 fill-white" /> Stream Free Cold Opens (6+ Shows)
            </a>
            <Link 
              href="/onboarding" 
              className="inline-flex items-center gap-2 px-6 py-3.5 font-semibold rounded-lg bg-brand-card hover:bg-brand-border/60 border border-brand-border text-gray-200 transition"
            >
              <PenTool className="w-4.5 h-4.5 text-brand-gold" /> Become a Writer ($5/mo)
            </Link>
          </div>
        </div>

        {/* Right Column - Pocket FM Live Engine Visualizer */}
        <div className="lg:col-span-6 relative flex items-center justify-center py-8">
          <div className="absolute -inset-2 bg-gradient-to-tr from-brand-gold/15 to-brand-violet/15 rounded-2xl blur-xl opacity-80 float-slow pointer-events-none" />

          {/* Floating Card 1: Writer Royalty Payout */}
          <div className="absolute -top-5 -right-2 bg-brand-card/95 border border-brand-gold/40 p-3.5 rounded-lg shadow-2xl float-medium z-20 w-48 space-y-1">
            <span className="text-[9px] font-mono font-bold text-brand-gold uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-brand-gold" /> 35% Writer Payout
            </span>
            <div className="text-base font-extrabold text-white font-mono">+$1,750.00 USD</div>
            <div className="text-[10px] text-gray-400">35% on 5,000 episode unlocks</div>
          </div>

          {/* Floating Card 2: 5 Episodes Unlocked */}
          <div className="absolute -bottom-6 -left-2 bg-brand-card/95 border border-brand-cyan/40 p-3.5 rounded-lg shadow-2xl float-fast z-20 w-52 space-y-1">
            <span className="text-[9px] font-mono font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1">
              <Gift className="w-3 h-3 text-brand-cyan" /> $5.00 Hooked Pass
            </span>
            <div className="text-sm font-extrabold text-white font-mono">Ep 1 to 5 Unlocked</div>
            <div className="text-[10px] text-gray-400">+ Full AI Writer Studio Access</div>
          </div>

          {/* Main Visualizer Board */}
          <div className="w-full rounded-xl border border-brand-border bg-brand-card/85 backdrop-blur p-6 shadow-2xl space-y-6 float-slow relative z-10">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
                <span className="text-xs font-semibold text-gray-300 tracking-wider font-mono">COLD OPEN THEATER ACTIVE</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
              </div>
            </div>

            {/* Simulated Live Show Cards */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#141724] border border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-brand-gold/20 to-brand-violet/20 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                    <Film className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Gravity’s Belief</h4>
                    <p className="text-xs text-gray-400">Passerby Cold Open: 0:58 Free • Cliffhanger Ready</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleOpenCinema(COLD_OPEN_STORIES[0])}
                  className="px-3 py-1.5 text-xs rounded bg-brand-gold text-black font-extrabold uppercase tracking-wider hover:brightness-110 flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-black" /> Play
                </button>
              </div>

              {/* Status Stages */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded bg-brand-gold/20 border border-brand-gold/50 font-bold text-brand-gold">
                  1. Play Free
                </div>
                <div className="p-2.5 rounded bg-brand-border/80 border border-brand-border/50 font-semibold text-gray-300">
                  2. Get Hooked
                </div>
                <div className="p-2.5 rounded bg-brand-border/80 border border-brand-border/50 font-semibold text-brand-cyan">
                  3. $5 = 5 Eps
                </div>
                <div className="p-2.5 rounded bg-brand-border/80 border border-brand-border/50 font-semibold text-white">
                  4. 35% Royalty
                </div>
              </div>

              {/* Live Status logs ticker */}
              <div className="rounded-lg bg-[#0a0c14] border border-brand-border p-3.5 font-mono text-[11px] min-h-[96px] flex flex-col justify-end space-y-2">
                <div className="text-gray-400 font-bold border-b border-brand-border/40 pb-1 flex justify-between">
                  <span>POCKET FM EVENT BUS</span>
                  <span className="text-green-400">MONETIZATION LIVE</span>
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

      {/* ──────────────────────────────────────────────────────────────────────────
          FEATURED: MULTITUDE OF COLD OPENS THEATER (PLAY FOR FREE)
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="cold-opens" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/40">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-brand-gold text-xs font-mono uppercase tracking-wider">
              <Play className="w-3 h-3 fill-brand-gold" /> Passersby Watch Free • Zero Paywall
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Multitude of Cold Opens: <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-gold via-white to-gray-300">Play Any Story Free</span>
            </h2>
            <p className="text-gray-400 max-w-2xl text-sm md:text-base">
              Explore diverse AI video universes. Click to stream the full opening episode with voice acting, cinematic shots, and cliffhangers. When you get hooked, subscribe for $5.00 to immediately unlock the next 5 full episodes + your AI Writer Pass!
            </p>
          </div>

          {/* Genre Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Sci-Fi', 'Romance', 'Fantasy', 'Crime', 'Mystery'].map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedGenre === genre
                    ? 'bg-brand-gold text-black font-extrabold'
                    : 'bg-brand-card hover:bg-brand-border/60 text-gray-300 border border-brand-border'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div 
              key={story.id}
              className={`rounded-xl border ${story.accentBorder} bg-gradient-to-b ${story.gradient} p-6 flex flex-col justify-between space-y-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-gold/10 group`}
            >
              {/* Header Badges */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase bg-black/40 border border-white/10 ${story.accentColor}`}>
                    {story.genre}
                  </span>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <span>★ {story.rating}</span>
                    <span>•</span>
                    <span>{story.views}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-brand-gold transition">
                  {story.title}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                  {story.logline}
                </p>

                {/* Cliffhanger Hook Teaser Box */}
                <div className="p-3 rounded-lg bg-[#0a0c14]/90 border border-white/10 space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-[9px] text-brand-gold uppercase tracking-wider font-bold">
                    <span className="flex items-center gap-1">
                      <FlameKindling className="w-3 h-3 text-brand-gold" /> Cold Open Cliffhanger
                    </span>
                    <span className="text-gray-400">{story.duration}</span>
                  </div>
                  <p className="text-gray-300 italic text-[11px] leading-snug">
                    &quot;{story.cliffhanger}&quot;
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => handleOpenCinema(story)}
                  className="w-full py-2.5 rounded-lg font-bold text-xs bg-white text-black hover:bg-brand-gold hover:text-black transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Play Free Cold Open ({story.duration})
                </button>
                <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                  <span>Hooked? $5.00 = 5 Episodes</span>
                  <span className="text-brand-cyan font-bold">+ Writer Pass</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          INTERACTIVE CINEMA PLAYER MODAL & $5.00 HOOKED PAYWALL
      ────────────────────────────────────────────────────────────────────────── */}
      {playingStory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl rounded-2xl border border-brand-border bg-[#0d0f19] shadow-2xl overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-[#141724]">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-[10px] font-mono font-bold uppercase">
                  EPISODE 1: COLD OPEN (FREE)
                </span>
                <h3 className="text-sm font-bold text-white">{playingStory.title}</h3>
              </div>
              <button 
                onClick={handleCloseCinema}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Canvas Simulation */}
            <div className="relative aspect-video bg-[#05060b] flex flex-col justify-between p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

              {/* Camera & Shot Overlay */}
              <div className="relative z-10 flex justify-between items-start text-[10px] font-mono text-gray-400">
                <div className="bg-black/60 px-2.5 py-1 rounded border border-white/10 flex items-center gap-1.5">
                  <Film className="w-3 h-3 text-brand-cyan" />
                  <span>{playingStory.cameraDirective}</span>
                </div>
                <div className="bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  STREAMING FREE
                </div>
              </div>

              {/* Subtitles & Audio Soundwave simulation */}
              <div className="relative z-10 space-y-3 max-w-xl mx-auto text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-brand-gold/30 text-brand-gold text-xs font-medium">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>{playingStory.subtitles[Math.min(Math.floor((cinemaProgress / 100) * playingStory.subtitles.length), playingStory.subtitles.length - 1)]}</span>
                </div>
                <p className="text-xs text-gray-300 bg-black/60 p-2 rounded max-w-md mx-auto">
                  {playingStory.logline}
                </p>
              </div>

              {/* Scrubber and Timeline Controls */}
              <div className="relative z-10 space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>0:{Math.floor((cinemaProgress / 100) * 58).toString().padStart(2, '0')}</span>
                  <span className="text-brand-gold font-bold">CLIFFHANGER IN 0:{Math.max(0, 58 - Math.floor((cinemaProgress / 100) * 58)).toString().padStart(2, '0')}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-brand-gold to-brand-cyan h-full transition-all duration-150"
                    style={{ width: `${cinemaProgress}%` }}
                  />
                </div>
              </div>

              {/* Cliffhanger Hook Overlay Modal (Triggers when complete or skipped) */}
              {showPaywallHook && (
                <div className="absolute inset-0 z-30 bg-black/95 flex items-center justify-center p-6 animate-fade-in">
                  <div className="max-w-md text-center space-y-5">
                    <div className="inline-flex p-3 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/40">
                      <Lock className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-mono font-bold text-brand-gold uppercase tracking-wider">
                        ⚡ CLIFFHANGER HIT • YOU&apos;RE HOOKED!
                      </div>
                      <h3 className="text-2xl font-black text-white">
                        Want to know what happens next in <span className="text-brand-gold">{playingStory.title}</span>?
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Passersby watch the Cold Open free. Subscribe for just <strong>$5.00/month</strong> to unlock this story and join the creators:
                      </p>
                    </div>

                    {/* The $5.00 Value Stack (5 Episodes + Writer Pass) */}
                    <div className="p-4 rounded-xl bg-[#141724] border border-brand-gold/30 text-left space-y-2.5 text-xs text-gray-200">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span><strong>Instant 5 Full Episodes (Ep 1 to 5)</strong> of {playingStory.title} immediately unlocked!</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                        <span><strong>Full AI Writer Pass</strong>: Write your own series with automated 4K AI video generation.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                        <span><strong>35% Lifetime Royalties</strong> paid directly to you on all viewer coin unlocks.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-violet shrink-0 mt-0.5" />
                        <span><strong>18 Monthly Bonus Coins</strong> replenished every month for future binge unlocks.</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href="/onboarding"
                      className="w-full py-3.5 rounded-lg font-black text-sm text-black bg-gradient-to-r from-brand-gold via-white to-brand-cyan hover:brightness-110 shadow-xl shadow-brand-gold/25 flex items-center justify-center gap-2 transition"
                    >
                      Subscribe $5.00: Unlock 5 Episodes + Writer Pass <ChevronRight className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => {
                        setShowPaywallHook(false);
                        setCinemaProgress(0);
                        setIsCinemaPlaying(true);
                      }}
                      className="text-xs text-gray-400 hover:text-white transition"
                    >
                      Replay Free Cold Open
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-brand-border bg-[#141724] flex items-center justify-between text-xs">
              <div className="text-gray-400 text-[11px]">
                Cold Open Cliffhanger: <span className="text-gray-200 italic">&quot;{playingStory.cliffhanger}&quot;</span>
              </div>
              {!showPaywallHook && (
                <button
                  onClick={() => {
                    setIsCinemaPlaying(false);
                    setCinemaProgress(100);
                    setShowPaywallHook(true);
                  }}
                  className="px-3 py-1.5 rounded bg-brand-gold/20 text-brand-gold border border-brand-gold/40 hover:bg-brand-gold hover:text-black font-bold flex items-center gap-1.5 transition text-xs shrink-0"
                >
                  <FastForward className="w-3 h-3" /> Jump to Cliffhanger Offer ($5.00)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. FEATURES SECTION: TWO-FRONT MODEL */}
      <section id="features" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/40">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-brand-violet text-xs font-mono uppercase tracking-wider">
            Pocket FM Architecture
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">The Two Fronts: Viewers &amp; Storytellers</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Traditional studios spend millions upfront. EpisodicAI empowers subscribers to write cinematic shows and earn 35% royalties, while viewers binge episodes with micro-coins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Free Cold Open Hook",
              desc: "Every passerby can stream Episode 1 Cold Opens completely free across all titles. Instant cinematic hook with zero paywalls, ensuring organic discovery and viral sharing.",
              icon: Play,
              badge: "Front 1: Viewer Hook"
            },
            {
              title: "$5.00 = 5 Episodes + Writer Pass",
              desc: "Subscribing for $5.00/month immediately unlocks the next 5 full episodes of your hooked story AND grants you the AI Writer Pass to write and direct your own original series.",
              icon: PenTool,
              badge: "Front 1: Dual Qualifier"
            },
            {
              title: "9-Coin Episode Unlocks ($1.00)",
              desc: "Viewers unlock subsequent episodes at 9 coins each ($1.00 for 9 coins). Exactly like Pocket FM, viewers buy coin bundles with bonus coins and ad-free binge windows.",
              icon: Coins,
              badge: "Front 1: Binge Economy"
            },
            {
              title: "35% Creator Revenue Share",
              desc: "Writers earn a lifetime 35% royalty on every coin spent by viewers to unlock their episodes. Automated ledger tracks every coin unlock and delivers direct cash payouts.",
              icon: DollarSign,
              badge: "Front 2: Creator Royalties"
            },
            {
              title: "Series Canon Fact Lock",
              desc: "AI ensures characters, costumes, voice acoustic timbre, and world rules remain 100% consistent across 50+ episodes without visual drift or logic holes.",
              icon: Database,
              badge: "Story Continuity"
            },
            {
              title: "65% AI Margin & Routing Protection",
              desc: "The remaining 65% revenue covers multi-provider AI video generation (Kling AI, MiniMax, Wan 2.1) and infrastructure, keeping the studio profitable on every single render.",
              icon: ShieldCheck,
              badge: "Front 2: Platform Engine"
            }
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div 
                key={index} 
                className="p-6 rounded-xl border border-brand-border bg-brand-card hover:border-brand-gold/50 hover:shadow-lg hover:shadow-brand-gold/5 transition duration-300 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 px-2.5 py-0.5 rounded-full">
                    {feat.badge}
                  </span>
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">How the Pocket FM Video Pipeline Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From free cold open hooks to continuous subscriber binging and automated 35% creator royalties.
          </p>
        </div>

        {/* Tabs Headers */}
        <div className="flex justify-center border-b border-brand-border gap-2 overflow-x-auto pb-px">
          {[
            { id: 'coldopen', label: '1. Free Cold Opens', icon: Play },
            { id: 'subscription', label: '2. $5 = 5 Eps + Writer Pass', icon: Users },
            { id: 'coins', label: '3. 9-Coin Binge Unlocks', icon: Coins },
            { id: 'royalty', label: '4. 35% Writer Royalty', icon: DollarSign }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm whitespace-nowrap transition ${
                  activeTab === t.id 
                    ? 'border-brand-gold text-brand-gold' 
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
          {activeTab === 'coldopen' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-mono">
                  ZERO-BARRIER HOOK
                </div>
                <h3 className="text-2xl font-extrabold text-white">Passersby Watch Cold Opens Free</h3>
                <p className="text-gray-300 leading-relaxed">
                  Just like Pocket FM hooks millions of listeners with episode 1, every visitor can stream opening Cold Opens across all series titles without creating an account.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">✔ <strong className="text-brand-cyan">Multitude of Titles</strong>: Sci-Fi, Romance, Fantasy, Crime, Horror.</li>
                  <li className="flex items-center gap-2">✔ <strong className="text-brand-cyan">Cliffhanger Hook</strong>: Drives organic transition to the $5.00 subscription.</li>
                  <li className="flex items-center gap-2">✔ <strong className="text-brand-cyan">Canon Lore Access</strong>: Read character dossiers and world lore for free.</li>
                </ul>
              </div>
              <div className="p-5 rounded-lg bg-[#0a0c14] border border-brand-border/60 font-mono text-xs text-gray-300 space-y-3">
                <div className="text-brand-cyan font-bold border-b border-brand-border/30 pb-1">// VIEWER COLD OPEN RULES</div>
                <div><strong className="text-brand-gold">&quot;cold_open_cost&quot;:</strong> &quot;0 COINS (100% FREE)&quot;</div>
                <div><strong className="text-brand-gold">&quot;hooked_offer&quot;:</strong> &quot;$5.00 = 5 EPISODES + WRITER PASS&quot;</div>
                <div><strong className="text-brand-gold">&quot;conversion_rate&quot;:</strong> &quot;32% cold-open to paid subscriber rate&quot;</div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-violet/15 border border-brand-violet/40 text-brand-violet text-xs font-mono">
                  THE DUAL QUALIFIER
                </div>
                <h3 className="text-2xl font-extrabold text-white">$5.00 Gives 5 Episodes + AI Writer Studio</h3>
                <p className="text-gray-300 leading-relaxed">
                  When a passerby gets hooked on a Cold Open, their $5.00 subscription immediately unlocks <strong>Episodes 1 through 5</strong> of that series AND qualifies them as an active writer with full AI Studio access.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">✔ <strong className="text-brand-gold">5 Episodes Included</strong>: Immediate binge gratification for your hooked show.</li>
                  <li className="flex items-center gap-2">✔ <strong className="text-brand-gold">AI Writer Studio</strong>: Write stories, generate scenes, direct 4K video.</li>
                  <li className="flex items-center gap-2">✔ <strong className="text-brand-gold">18 Monthly Bonus Coins</strong>: Additional free episode unlocks included monthly.</li>
                </ul>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-[#141724] border border-brand-border/60">
                  <h4 className="text-sm font-bold text-white mb-1">Instant Binge Delivery</h4>
                  <p className="text-xs text-gray-400">Viewers don&apos;t just subscribe to wait — they get 5 full continuous episodes immediately.</p>
                </div>
                <div className="p-4 rounded-lg bg-[#141724] border border-brand-border/60">
                  <h4 className="text-sm font-bold text-white mb-1">Writer Qualification</h4>
                  <p className="text-xs text-gray-400">Every subscriber is an empowered creator. Write the script — EpisodicAI animates and voices it.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coins' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-mono">
                  MICRO-MONETIZATION
                </div>
                <h3 className="text-2xl font-extrabold text-white">9 Coins ($1.00) per Episode Beyond Ep 5</h3>
                <p className="text-gray-300 leading-relaxed">
                  After enjoying the initial 5 episodes, viewers binge subsequent episodes at 9 coins ($1.00) each. Viewers can purchase bonus packs with up to 25% free bonus coins and ad-free windows.
                </p>
                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-3 rounded bg-[#141724] border border-brand-border">
                    <div className="text-brand-gold font-bold">9 Coins</div>
                    <div className="text-[10px] text-gray-400">$1.00 / Single Episode</div>
                  </div>
                  <div className="p-3 rounded bg-[#141724] border border-brand-border">
                    <div className="text-brand-cyan font-bold">165 Coins</div>
                    <div className="text-[10px] text-gray-400">$19.99 (20% Bonus + No Ads)</div>
                  </div>
                  <div className="p-3 rounded bg-[#141724] border border-brand-border">
                    <div className="text-brand-violet font-bold">212 Coins</div>
                    <div className="text-[10px] text-gray-400">$24.99 (20% Bonus + No Ads)</div>
                  </div>
                  <div className="p-3 rounded bg-[#141724] border border-brand-border">
                    <div className="text-green-400 font-bold">255 Coins</div>
                    <div className="text-[10px] text-gray-400">$29.99 (25% Bonus + No Ads)</div>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-lg bg-[#0a0c14] border border-brand-border/60 space-y-3 font-mono text-xs">
                <div className="text-brand-cyan font-bold border-b border-brand-border/30 pb-1">// EPISODE UNLOCK LEDGER</div>
                <div className="text-gray-300">Episode: S1 • Ep 6 &quot;Citadel Break&quot;</div>
                <div className="text-brand-gold">Coin Deduction: -9 Coins ($1.00 USD)</div>
                <div className="text-green-400">Writer Payout (35%): +$0.35 credited</div>
                <div className="text-brand-violet">Platform AI Compute (65%): +$0.65 retained</div>
              </div>
            </div>
          )}

          {activeTab === 'royalty' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono">
                  35% CREATOR ROYALTY
                </div>
                <h3 className="text-2xl font-extrabold text-white">Automated Cash Royalties on Every Coin</h3>
                <p className="text-gray-300 leading-relaxed">
                  Every time a viewer spends 9 coins to watch your episode, 35% ($0.35) is deposited into your creator wallet immediately. 10,000 episode unlocks = $3,500.00 cash payout.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                    <span className="text-gray-400">Writer Royalty Share</span>
                    <span className="text-green-400 font-bold text-base">35% of Gross Spend</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                    <span className="text-gray-400">Platform AI Compute &amp; Margin</span>
                    <span className="text-brand-gold font-bold text-base">65% of Gross Spend</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                    <span className="text-gray-400">Payout Settlement</span>
                    <span className="text-white font-bold">Monthly Direct Stripe Payout</span>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-lg bg-[#0a0c14] border border-brand-border/60 font-mono text-xs space-y-2">
                <div className="text-brand-cyan font-bold border-b border-brand-border/30 pb-1">// WRITER EARNINGS FORMULA</div>
                <div className="text-gray-400">gross_spend = episode_unlocks * $1.00</div>
                <div className="text-green-400 font-bold">writer_royalty = gross_spend * 0.35</div>
                <div className="text-brand-violet">platform_share = gross_spend * 0.65</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. COST ROUTER SECTION */}
      <section id="router" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/40">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-brand-violet text-xs font-mono uppercase tracking-wider">
            AI Provider Abstraction Layer
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">How We Protect the 65% Platform Margin</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            To guarantee writers their 35% royalty while keeping the platform profitable, our intelligent router generates 1-5 minute episodes under $0.65 compute cost using Kling AI, MiniMax, Wan 2.1, and Seedance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Simulate Shot Directing</h4>
            
            {[
              { id: 'action', title: "High-Action Hero Shot", desc: "Kling AI 3.0 Pro ($0.05-$0.10/s) with clip extend" },
              { id: 'dialogue', title: "Dialogue / Conversation", desc: "MiniMax Hailuo ($0.08/s) + ElevenLabs LipSync" },
              { id: 'ambient', title: "Establishing B-Roll Scene", desc: "Wan 2.1 Open-Weights ($0.01-$0.02/s via fal.ai)" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setRouterCategory(cat.id as any)}
                className={`w-full text-left p-4 rounded-lg border transition duration-200 flex flex-col gap-1 ${
                  routerCategory === cat.id 
                    ? 'border-brand-gold bg-brand-gold/10 text-white' 
                    : 'border-brand-border bg-brand-card hover:bg-brand-border/40 text-gray-300'
                }`}
              >
                <span className="font-bold text-sm">{cat.title}</span>
                <span className="text-xs text-gray-400">{cat.desc}</span>
              </button>
            ))}

            <div className="p-4 rounded bg-[#141724] border border-brand-border space-y-2 mt-4 text-xs text-gray-300">
              <span className="font-bold text-brand-gold block uppercase">Unit Economics Safeguard</span>
              When an episode is unlocked for 9 coins ($1.00), $0.35 is locked for the writer. The router enforces that total episode AI rendering compute never exceeds $0.40, guaranteeing a minimum 25% net profit.
            </div>
          </div>

          {/* Results Console */}
          <div className="lg:col-span-7 rounded-xl border border-brand-border bg-[#0a0c14] p-6 font-mono text-sm flex flex-col justify-between space-y-6">
            <div className="border-b border-brand-border/50 pb-3 flex justify-between items-center text-xs text-gray-400">
              <span className="font-bold text-brand-cyan flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> MULTI-PROVIDER ROUTER CONSOLE
              </span>
              <span className="text-green-400">ONLINE</span>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <span className="text-gray-500">// Evaluated Shot:</span>
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
                  <span className="text-xs text-gray-400 block">Compute Rate:</span>
                  <span className="text-brand-violet font-bold text-md">{routerData.costSec}</span>
                </div>
                <div className="p-3.5 rounded bg-brand-card border border-brand-border/60">
                  <span className="text-xs text-gray-400 block">Platform Share:</span>
                  <span className="text-brand-gold font-bold text-md">{routerData.expectedMargin}</span>
                </div>
              </div>

              <div className="text-xs text-gray-300 leading-relaxed bg-brand-card border border-brand-border/40 p-3.5 rounded">
                <span className="font-bold text-gray-200 uppercase block mb-1">Routing Rationale:</span>
                {routerData.reason}
              </div>
            </div>

            <div className="border-t border-brand-border/30 pt-3 text-[11px] text-gray-500 flex justify-between">
              <span>POCKET FM VIDEO ROUTER v2.0</span>
              <span>EPISODICAI OS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION (POCKET FM MODEL) */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/40">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-mono uppercase tracking-wider">
            Pocket FM Pricing Structure
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Simple, Creator-First Monetization</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Cold Open is free. Subscribe for $5.00/month to unlock 5 full episodes of your hooked story + your AI Writer Pass. Binge continuous episodes beyond Ep 5 with coins (9 coins = 1 episode). Writers earn 35% on all revenue.
          </p>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Card 1: Free Viewer */}
          <div className="relative rounded-xl border p-8 flex flex-col justify-between space-y-6 border-brand-border bg-brand-card">
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Front 1: Free Passerby</span>
              <h4 className="text-xl font-bold text-white">Cold Open Pass</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-gray-400">/forever</span>
              </div>
              <div className="text-sm font-semibold text-brand-cyan uppercase tracking-wider">Play Cold Opens Across All Shows</div>
            </div>

            <ul className="space-y-3 text-sm text-gray-300 flex-1 py-4 border-t border-brand-border/40">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-cyan mt-0.5" />
                <span>Stream Cold Open / Pilot Episode of any title 100% free</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-cyan mt-0.5" />
                <span>Experience full cliffhanger plots with zero paywall</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-cyan mt-0.5" />
                <span>Explore public Series Bibles and character lore</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-cyan mt-0.5" />
                <span>Zero credit card or account required to start</span>
              </li>
            </ul>

            <a 
              href="#cold-opens"
              className="w-full text-center py-3 rounded-lg font-bold text-sm transition bg-brand-border/80 hover:bg-brand-border text-white"
            >
              Stream Free Cold Opens
            </a>
          </div>

          {/* Card 2: Subscriber & Writer Pass (MOST POPULAR) */}
          <div className="relative rounded-xl border p-8 flex flex-col justify-between space-y-6 border-brand-gold bg-gradient-to-b from-brand-gold/15 via-brand-card to-brand-card shadow-2xl shadow-brand-gold/10 scale-105 z-10">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-brand-gold to-brand-violet text-black text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular • 5 Episodes Included
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-wider font-mono">Front 1 &amp; 2: Dual Role</span>
              <h4 className="text-xl font-bold text-white">All-Access &amp; Writer Pass</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-brand-gold">$5.00</span>
                <span className="text-xs text-gray-400">/month</span>
              </div>
              <div className="text-sm font-semibold text-brand-cyan uppercase tracking-wider">5 Episodes Included + Writer Studio</div>
            </div>

            <ul className="space-y-3 text-sm text-gray-200 flex-1 py-4 border-t border-brand-border/40">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-gold mt-0.5" />
                <span><strong className="text-white">🎁 Instant 5 Full Episodes</strong> of your hooked show immediately unlocked</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-gold mt-0.5" />
                <span><strong className="text-white">✍️ AI Writer Studio</strong>: Create your own series universes &amp; direct video</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-gold mt-0.5" />
                <span><strong className="text-green-400">💰 35% Lifetime Royalties</strong> on viewer coin unlocks</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-gold mt-0.5" />
                <span><strong className="text-white">🪙 18 Free Bonus Coins/mo</strong> (~2 full episode unlocks)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-gold mt-0.5" />
                <span>Full Series Bible, Canon Fact Lock &amp; Voice Consistency</span>
              </li>
            </ul>

            <Link 
              href="/onboarding"
              className="w-full text-center py-3 rounded-lg font-bold text-sm transition bg-gradient-to-r from-brand-gold via-brand-violet to-brand-cyan text-white hover:brightness-110 shadow-lg shadow-brand-gold/20"
            >
              Subscribe for $5.00 &amp; Get 5 Episodes
            </Link>
          </div>

          {/* Card 3: Coin Unlock Packs */}
          <div className="relative rounded-xl border p-8 flex flex-col justify-between space-y-6 border-brand-border bg-brand-card">
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider font-mono">Front 1: Binge Coins (Ep 6+)</span>
              <h4 className="text-xl font-bold text-white">Episode Coin Packs</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">From $1.00</span>
                <span className="text-xs text-gray-400">/9 coins</span>
              </div>
              <div className="text-sm font-semibold text-brand-cyan uppercase tracking-wider">9 Coins = 1 Episode Unlock</div>
            </div>

            <ul className="space-y-3 text-sm text-gray-300 flex-1 py-4 border-t border-brand-border/40">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-cyan mt-0.5" />
                <span><strong className="text-white">$1.00 for 9 Coins</strong>: Exact cost to unlock 1 episode beyond Ep 5</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-cyan mt-0.5" />
                <span><strong className="text-white">Binge Bundles</strong>: 20% to 25% free bonus coins</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-cyan mt-0.5" />
                <span><strong className="text-white">Ad-Free Viewing</strong> included with bonus coin packs</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-cyan mt-0.5" />
                <span><strong className="text-green-400">Directly supports writers</strong> (35% payout to author)</span>
              </li>
            </ul>

            <a 
              href="#coin-store"
              className="w-full text-center py-3 rounded-lg font-bold text-sm transition bg-brand-border/80 hover:bg-brand-border text-white"
            >
              View Pocket FM Coin Store
            </a>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE SECTION: COIN STORE MODAL UI + WRITER 35% ROYALTY CALCULATOR */}
      <section id="coin-store" className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/40">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-mono uppercase tracking-wider">
            Interactive Pocket FM Experience
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Pocket FM Coin Store &amp; Writer Earnings</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Test the exact Pocket FM episode unlock modal and calculate how much you earn as a writer with a 35% revenue royalty.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Recreated Pocket FM "Buy coins to unlock episodes" Modal */}
          <div className="lg:col-span-6 rounded-2xl border border-brand-border bg-[#0d0f19] p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-4 mb-6">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Lock className="w-4 h-4 text-brand-gold" /> Buy coins to unlock episodes
              </div>
              <button className="text-gray-500 hover:text-white p-1 rounded-full bg-white/5">
                <span className="text-xs">✕</span>
              </button>
            </div>

            {/* Coin Options List (as in user screenshot) */}
            <div className="space-y-4">
              {coinPacks.map((pack) => {
                const isSelected = selectedCoinPack === pack.id;
                return (
                  <div
                    key={pack.id}
                    onClick={() => setSelectedCoinPack(pack.id as any)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'border-brand-violet bg-brand-violet/10 shadow-lg shadow-brand-violet/10' 
                        : 'border-brand-border bg-[#141724] hover:bg-brand-border/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Radio dot */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-brand-violet bg-brand-violet' : 'border-gray-500'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      <div className="space-y-1">
                        <div className="inline-block text-[9px] font-mono font-bold text-brand-gold bg-brand-gold/15 px-2 py-0.5 rounded uppercase">
                          {pack.badge}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                          <span className="text-brand-gold">🪙 {pack.baseCoins}</span>
                          {pack.bonusCoins > 0 && (
                            <span className="text-brand-gold font-bold">+{pack.bonusCoins} free coins</span>
                          )}
                          <span className="text-xs text-gray-400 font-normal">({pack.episodesUnlocked})</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-extrabold text-white">{pack.price}</div>
                      <div className="text-[10px] text-gray-400">{pack.perEp}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coin Balance Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-brand-border/60 mt-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">COIN BALANCE</span>
              <div className="flex items-center gap-1.5 font-bold text-sm text-brand-gold">
                <span>🪙 1 Coin</span>
                <span className="text-xs text-gray-500">(Cold open free)</span>
              </div>
            </div>

            {/* Pink/Purple Gradient Button (as in Pocket FM screenshot) */}
            <div className="pt-4">
              <Link
                href="/signin"
                className="w-full py-3.5 rounded-full font-extrabold text-sm text-white flex items-center justify-center gap-2 shadow-xl shadow-brand-violet/25 hover:brightness-110 transition bg-gradient-to-r from-[#9d174d] via-[#7c3aed] to-[#db2777]"
              >
                <Zap className="w-4 h-4" /> Buy coins
              </Link>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                9 coins unlock 1 full episode • 35% of your purchase goes directly to the series writer
              </p>
            </div>
          </div>

          {/* Right Column: Writer 35% Royalty Simulator */}
          <div className="lg:col-span-6 rounded-2xl border border-brand-border bg-brand-card p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-brand-border/60 pb-4">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Writer 35% Revenue Royalty Calculator</h3>
                <p className="text-xs text-gray-400">Calculate your passive creator income as viewers unlock your series.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Slider for episode unlocks */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-semibold">Monthly Episode Unlocks on Your Series</span>
                  <span className="text-brand-cyan font-mono font-bold text-base">
                    {writerUnlocks.toLocaleString()} unlocks
                  </span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="50000" 
                  step="500"
                  value={writerUnlocks}
                  onChange={e => setWriterUnlocks(Number(e.target.value))}
                  className="w-full accent-brand-gold bg-[#0a0c14] rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>500 unlocks (~$175)</span>
                  <span>10,000 unlocks (~$3,500)</span>
                  <span>50,000 unlocks (~$17,500)</span>
                </div>
              </div>

              {/* Earnings Breakdown Box */}
              <div className="p-6 rounded-xl border border-brand-gold/30 bg-[#0a0c14] space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                  <span className="text-xs text-gray-400 uppercase font-mono">Gross Viewer Spend (@ $1.00 / ep)</span>
                  <span className="text-sm font-bold text-white font-mono">
                    ${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-green-400 font-bold uppercase tracking-wider font-mono">
                    YOUR 35% WRITER CASH PAYOUT
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold text-green-400 font-mono">
                    +${writerRoyaltyPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-400">
                    Paid directly to your bank via Stripe Connect every month
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-brand-border/40 pt-3 text-xs text-gray-400">
                  <span>Platform AI Compute &amp; Video Operations (65%):</span>
                  <span className="font-mono text-brand-gold font-bold">
                    ${platformOpsShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#141724] border border-brand-border text-xs text-gray-300 leading-relaxed space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Why the Pocket FM Model Wins:
                </div>
                <p>
                  You write the plot, dialogue, and lore. EpisodicAI generates the cinematic shots, character voices, sound effects, and multi-episode continuity automatically. You keep 35% of all unlock income with zero equipment or production cost.
                </p>
              </div>

              <Link
                href="/onboarding"
                className="w-full py-3.5 rounded-lg font-bold text-sm text-center block bg-gradient-to-r from-brand-gold via-brand-violet to-brand-cyan hover:brightness-110 text-white shadow-lg shadow-brand-gold/15 transition"
              >
                Become a Writer &amp; Earn 35% Royalties ($5/mo)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border/60 py-12 px-6 md:px-12 text-center text-sm text-gray-400 bg-[#0a0c14]">
        <div className="flex justify-center gap-6 mb-4">
          <a href="#" className="hover:text-brand-gold transition">Privacy Policy</a>
          <a href="#" className="hover:text-brand-gold transition">Terms of Use</a>
          <a href="#" className="hover:text-brand-gold transition">Creator Royalty Agreement</a>
          <a href="#" className="hover:text-brand-gold transition">Support</a>
        </div>
        <p>© 2026 EpisodicAI. Built on the Pocket FM Video Model. Created for Next-Generation Storytellers.</p>
      </footer>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-tr from-brand-gold to-brand-violet text-white shadow-lg shadow-brand-gold/20 hover:brightness-110 transition"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
