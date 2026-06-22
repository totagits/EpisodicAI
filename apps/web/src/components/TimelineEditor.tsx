'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Scissors, 
  Copy, 
  Trash2, 
  Volume2, 
  Plus, 
  RotateCw, 
  Sparkles, 
  Settings, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { Shot, ProductionMethod } from '@episodic-ai/types';

interface TimelineEditorProps {
  shots: Shot[];
  onUpdateShot: (id: string, updates: Partial<Shot>) => void;
  onRegenerateShot: (shot: Shot) => void;
}

export default function TimelineEditor({ shots, onUpdateShot, onRegenerateShot }: TimelineEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(15); // percentage of timeline
  const [selectedShot, setSelectedShot] = useState<Shot | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Compute total duration of all shots
  const totalDuration = shots.reduce((acc, sh) => acc + sh.durationSeconds, 0) || 10;

  const handleSelectShot = (shot: Shot) => {
    setSelectedShot(shot);
  };

  const handlePlayheadScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    setPlayheadPosition(pct);
  };

  return (
    <div className="w-full flex flex-col border border-brand-border rounded-xl bg-brand-card overflow-hidden shadow-2xl">
      {/* Editor Top Toolbar */}
      <div className="bg-brand-card/90 border-b border-brand-border px-4 py-3 flex justify-between items-center text-xs">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-brand-violet hover:bg-brand-violet/90 text-white flex items-center justify-center transition"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
          
          <div className="flex items-center gap-1.5 font-mono text-gray-300 font-bold bg-[#020306] border border-brand-border px-3 py-1 rounded">
            <span>00:00:{(Math.round((playheadPosition / 100) * totalDuration)).toString().padStart(2, '0')}</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-500">00:00:{Math.round(totalDuration).toString().padStart(2, '0')}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-brand-border text-gray-400" title="Split clip"><Scissors className="w-4 h-4" /></button>
            <button className="p-1.5 rounded hover:bg-brand-border text-gray-400" title="Duplicate clip"><Copy className="w-4 h-4" /></button>
            <button className="p-1.5 rounded hover:bg-brand-border text-gray-400" title="Delete clip"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))} className="p-1.5 rounded hover:bg-brand-border text-gray-400"><ZoomOut className="w-4.5 h-4.5" /></button>
            <span className="text-gray-500 font-semibold">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.1))} className="p-1.5 rounded hover:bg-brand-border text-gray-400"><ZoomIn className="w-4.5 h-4.5" /></button>
          </div>
          <button className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-brand-border border border-brand-border/60 hover:bg-brand-border/90 text-gray-300 font-semibold transition">
            <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
          </button>
        </div>
      </div>

      {/* Main Timeline Workspace Grid */}
      <div className="flex-1 min-h-[260px] relative overflow-x-auto flex">
        {/* Track Headers */}
        <div className="w-24 border-r border-brand-border bg-brand-card/90 select-none flex flex-col justify-between py-6 font-bold text-[10px] text-gray-500 uppercase tracking-wider">
          <div className="h-10 flex items-center px-3">Video</div>
          <div className="h-10 flex items-center px-3">Image Story</div>
          <div className="h-10 flex items-center px-3">Dialogue</div>
          <div className="h-10 flex items-center px-3">Sound FX</div>
          <div className="h-10 flex items-center px-3">Captions</div>
        </div>

        {/* Tracks Grid Area */}
        <div className="flex-1 min-w-[600px] relative" style={{ width: `${100 * zoomLevel}%` }}>
          {/* Timeline Time Grid Numbers */}
          <div className="h-6 border-b border-brand-border/30 relative flex items-center select-none font-mono text-[9px] text-gray-600 bg-brand-bg/40">
            {Array.from({ length: 11 }).map((_, idx) => (
              <div key={idx} className="absolute" style={{ left: `${idx * 10}%` }}>
                {idx * 2}s
              </div>
            ))}
          </div>

          {/* Timeline Tracks */}
          <div className="py-2 space-y-2 relative h-full">
            {/* Playhead Vertical Line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-brand-cyan z-30 pointer-events-none transition-all duration-100 ease-out" 
              style={{ left: `${playheadPosition}%` }}
            >
              <div className="w-2.5 h-2.5 bg-brand-cyan rounded-full -ml-1 -mt-1 shadow-lg shadow-brand-cyan/50"></div>
            </div>

            {/* Clickable Ruler to scrub */}
            <div 
              onClick={handlePlayheadScrub} 
              className="absolute inset-0 cursor-ew-resize opacity-0 z-20"
            />

            {/* Track 1: Video */}
            <div className="h-10 bg-brand-border/10 rounded border border-transparent flex items-center relative overflow-hidden">
              {shots.map((shot, idx) => {
                const widthPct = (shot.durationSeconds / totalDuration) * 100;
                const isSel = selectedShot?.id === shot.id;
                
                return (
                  <div 
                    key={shot.id}
                    onClick={() => handleSelectShot(shot)}
                    style={{ width: `${widthPct}%` }}
                    className={`h-full border-r border-brand-border/60 relative p-1.5 flex flex-col justify-between transition cursor-pointer select-none ${
                      isSel 
                        ? 'bg-brand-violet/20 border-y border-brand-violet/50' 
                        : 'bg-brand-violet/5 hover:bg-brand-violet/10'
                    }`}
                  >
                    <span className="text-[10px] text-white font-bold truncate">Shot {shot.shotNumber}</span>
                    <span className="text-[8px] text-brand-violet font-semibold uppercase">{shot.productionMethod}</span>
                  </div>
                );
              })}
            </div>

            {/* Track 2: Images */}
            <div className="h-10 bg-brand-border/10 rounded border border-transparent flex items-center relative overflow-hidden">
              {shots.map((shot, idx) => {
                const widthPct = (shot.durationSeconds / totalDuration) * 100;
                return (
                  <div 
                    key={idx}
                    style={{ width: `${widthPct}%` }}
                    className="h-full border-r border-brand-border/40 bg-brand-cyan/5 flex items-center justify-center p-1"
                  >
                    <div className="w-full h-full rounded bg-brand-border/40 border border-brand-cyan/20 overflow-hidden flex items-center justify-center">
                      <span className="text-[8px] text-brand-cyan font-bold truncate">Storyboard #{shot.shotNumber}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Track 3: Dialogue */}
            <div className="h-10 bg-brand-border/10 rounded border border-transparent flex items-center relative overflow-hidden">
              {shots.map((shot, idx) => {
                const widthPct = (shot.durationSeconds / totalDuration) * 100;
                if (!shot.dialogue) return <div key={idx} style={{ width: `${widthPct}%` }} className="h-full border-r border-brand-border/20" />;
                
                return (
                  <div 
                    key={idx}
                    style={{ width: `${widthPct}%` }}
                    className="h-full border-r border-brand-border/40 bg-brand-amber/10 p-1 flex flex-col justify-center text-[8px] leading-tight"
                  >
                    <span className="text-brand-amber font-bold truncate">{shot.dialogue.characterId}</span>
                    <span className="text-gray-400 truncate">"{shot.dialogue.text}"</span>
                  </div>
                );
              })}
            </div>

            {/* Track 4: Sound FX */}
            <div className="h-10 bg-brand-border/10 rounded border border-transparent flex items-center relative overflow-hidden">
              <div className="absolute left-[15%] w-[35%] h-full bg-brand-card/90 border-x border-brand-border/80 flex items-center px-2 text-[8px] text-gray-400 font-medium">
                ⚡ Slum Ambience Background.mp3
              </div>
              <div className="absolute left-[60%] w-[20%] h-full bg-brand-card/90 border-x border-brand-border/80 flex items-center px-2 text-[8px] text-brand-amber font-bold">
                💥 Sparks_Explode.sfx
              </div>
            </div>

            {/* Track 5: Captions */}
            <div className="h-10 bg-brand-border/10 rounded border border-transparent flex items-center relative overflow-hidden">
              {shots.map((shot, idx) => {
                const widthPct = (shot.durationSeconds / totalDuration) * 100;
                if (!shot.dialogue) return <div key={idx} style={{ width: `${widthPct}%` }} className="h-full border-r border-brand-border/20" />;
                return (
                  <div 
                    key={idx}
                    style={{ width: `${widthPct}%` }}
                    className="h-full border-r border-brand-border/20 flex items-center justify-center p-1 text-[8px] text-gray-500 font-mono truncate"
                  >
                    [Sub: {shot.dialogue.text}]
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Bottom Panel - Selected Clip Parameters Inspector */}
      {selectedShot ? (
        <div className="bg-[#020306] border-t border-brand-border p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          {/* Left Column: Properties */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold bg-brand-violet/20 border border-brand-violet/40 text-brand-violet px-2 py-0.5 rounded">
                Shot {selectedShot.shotNumber} Properties
              </span>
              <span className="text-[10px] text-gray-500 font-mono">ID: {selectedShot.id.substring(0,8)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500 uppercase font-bold text-[9px] block">Duration (Secs)</span>
                <input 
                  type="number" 
                  value={selectedShot.durationSeconds}
                  onChange={e => onUpdateShot(selectedShot.id, { durationSeconds: Number(e.target.value) })}
                  className="w-full rounded bg-brand-card border border-brand-border px-2 py-1 text-white text-xs mt-1" 
                />
              </div>
              <div>
                <span className="text-gray-500 uppercase font-bold text-[9px] block">Production Method</span>
                <select
                  value={selectedShot.productionMethod}
                  onChange={e => onUpdateShot(selectedShot.id, { productionMethod: e.target.value as ProductionMethod })}
                  className="w-full rounded bg-brand-card border border-brand-border px-2 py-1 text-white text-xs mt-1"
                >
                  <option value="talking-character">Lip-Sync Talk</option>
                  <option value="image-to-video">Image to Video</option>
                  <option value="text-to-video">Text to Video</option>
                  <option value="parallax-still">Parallax Still</option>
                </select>
              </div>
            </div>
          </div>

          {/* Middle Column: Prompt Director & Abstraction Layer Routing */}
          <div className="space-y-3">
            <div>
              <span className="text-gray-500 uppercase font-bold text-[9px] block">Prompt Director (Provider Instructions)</span>
              <textarea 
                value={selectedShot.promptText}
                onChange={e => onUpdateShot(selectedShot.id, { promptText: e.target.value })}
                className="w-full rounded bg-brand-card border border-brand-border p-2 text-xs text-white h-14 resize-none focus:outline-none focus:border-brand-cyan"
              />
            </div>
            
            {selectedShot.internalRequest && (
              <div className="rounded bg-brand-violet/5 border border-brand-violet/25 p-2 space-y-1">
                <span className="text-[9px] font-bold text-brand-violet uppercase tracking-wider block">Internal Abstraction Request (Routing Input)</span>
                <p className="text-[10px] text-gray-300 font-mono leading-relaxed italic bg-[#04050a] p-1.5 rounded border border-brand-border/40">
                  "{selectedShot.internalRequest}"
                </p>
                <div className="flex justify-between items-center text-[9px] text-gray-500 pt-0.5">
                  <span>Provider Routed: <strong className="text-brand-cyan">{selectedShot.providerName}</strong></span>
                  <span>Model: <strong className="text-brand-gold">{selectedShot.modelName}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Generation Controls */}
          <div className="flex flex-col justify-end space-y-2">
            <div className="flex justify-between items-center text-xs border-b border-brand-border/40 pb-1.5 mb-1.5">
              <span className="text-gray-400">Router Cost Estimate:</span>
              <span className="text-brand-cyan font-bold">{selectedShot.estimatedCostCredits} credits</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onRegenerateShot(selectedShot)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-gradient-to-r from-brand-violet to-brand-cyan hover:brightness-110 text-white text-xs font-bold transition"
              >
                <RotateCw className="w-3.5 h-3.5" /> Regenerate Shot
              </button>
              <button className="p-2 rounded bg-brand-card border border-brand-border hover:bg-brand-border text-gray-300">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#020306] border-t border-brand-border p-4 text-center text-xs text-gray-500">
          Click on any shot block in the Video track to inspect parameters, adjust duration, edit prompt direction, or swap providers.
        </div>
      )}
    </div>
  );
}
