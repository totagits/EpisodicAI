'use client';

import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  HelpCircle, 
  Info,
  GitBranch
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'character' | 'location' | 'object' | 'thread';
  details: string;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

export default function StoryGraph() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [sliderVal, setSliderVal] = useState(1);

  const nodes: GraphNode[] = [
    { id: 'luna', label: 'Luna', type: 'character', details: 'A young mechanic. Has illegal gravity boots.' },
    { id: 'leo', label: 'Leo', type: 'character', details: 'Luna\'s close friend and assistant. Secretly suspicious of Sky Guard.' },
    { id: 'guard', label: 'Sky Guard', type: 'character', details: 'The militaristic regime enforcing gravity tax laws.' },
    { id: 'workshop', label: 'Slum Workshop', type: 'location', details: 'Luna\'s lab. Floor plans contains escape chute.' },
    { id: 'boots', label: 'Gravity Boots', type: 'object', details: 'Created in S1E1. Enables belief-based levitation.' },
    { id: 'conspiracy', label: 'Citadel Theft', type: 'thread', details: 'Plot to infiltrate Sky Citadel and secure energy core.' }
  ];

  const links: GraphLink[] = [
    { source: 'luna', target: 'leo', label: 'Allies' },
    { source: 'luna', target: 'boots', label: 'Owns / Creator' },
    { source: 'luna', target: 'workshop', label: 'Works In' },
    { source: 'leo', target: 'workshop', label: 'Works In' },
    { source: 'boots', target: 'workshop', label: 'Stored In' },
    { source: 'guard', target: 'workshop', label: 'Patrols' },
    { source: 'luna', target: 'conspiracy', label: 'Primary Lead' },
    { source: 'leo', target: 'conspiracy', label: 'Supporter (Captured)' }
  ];

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Left Column: Interactive SVG Canvas Graph */}
      <div className="flex-1 rounded-xl border border-brand-border bg-[#020306] p-4 flex flex-col relative min-h-[400px]">
        <div className="absolute top-4 left-4 z-10 space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-brand-cyan" /> Interactive Story & Canon Graph
          </h3>
          <p className="text-[11px] text-gray-500">Chronological slider simulates universe timeline development.</p>
        </div>

        {/* Dynamic Node Graph Rendering */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <svg className="w-full h-full min-h-[350px]" style={{ background: 'radial-gradient(circle, #0e111d 0%, #05060b 80%)' }}>
            {/* Draw Links */}
            {links.map((link, idx) => {
              const srcNode = nodes.find(n => n.id === link.source);
              const tgtNode = nodes.find(n => n.id === link.target);
              if (!srcNode || !tgtNode) return null;
              
              // Mock coordinates
              const coords: Record<string, {x: number, y: number}> = {
                luna: { x: 180, y: 180 },
                leo: { x: 100, y: 100 },
                boots: { x: 260, y: 120 },
                workshop: { x: 300, y: 220 },
                guard: { x: 420, y: 260 },
                conspiracy: { x: 100, y: 260 }
              };

              const start = coords[link.source] || { x: 150, y: 150 };
              const end = coords[link.target] || { x: 250, y: 250 };

              // Hide some links if timeline slider is pulled back (simulating chronology)
              if (sliderVal === 1 && (link.target === 'conspiracy' || link.source === 'guard')) return null;

              return (
                <g key={idx}>
                  <line 
                    x1={start.x} 
                    y1={start.y} 
                    x2={end.x} 
                    y2={end.y} 
                    stroke="rgba(139, 92, 246, 0.25)" 
                    strokeWidth="1.5" 
                  />
                  <text 
                    x={(start.x + end.x) / 2} 
                    y={(start.y + end.y) / 2 - 4} 
                    fill="#6b7280" 
                    fontSize="9" 
                    textAnchor="middle"
                  >
                    {link.label}
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {nodes.map(node => {
              const coords: Record<string, {x: number, y: number}> = {
                luna: { x: 180, y: 180 },
                leo: { x: 100, y: 100 },
                boots: { x: 260, y: 120 },
                workshop: { x: 300, y: 220 },
                guard: { x: 420, y: 260 },
                conspiracy: { x: 100, y: 260 }
              };
              const { x, y } = coords[node.id] || { x: 200, y: 200 };

              if (sliderVal === 1 && (node.id === 'conspiracy' || node.id === 'guard')) return null;

              const isSelected = selectedNode?.id === node.id;
              let color = 'fill-brand-violet';
              if (node.type === 'location') color = 'fill-brand-cyan';
              if (node.type === 'object') color = 'fill-brand-amber';
              if (node.type === 'thread') color = 'fill-red-500';

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode(node)}
                >
                  <circle 
                    r={isSelected ? 20 : 16} 
                    className={`${color} transition-all duration-300 stroke-[#1f2438] stroke-2 hover:brightness-125`}
                  />
                  <text 
                    y="30" 
                    fill="#f3f4f6" 
                    fontSize="11" 
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Timeline Slider Overlay */}
        <div className="p-3 border-t border-brand-border/40 flex items-center gap-4">
          <span className="text-xs font-bold text-gray-400">Story Date Chronology</span>
          <input 
            type="range" 
            min="1" 
            max="3" 
            value={sliderVal} 
            onChange={e => setSliderVal(Number(e.target.value))}
            className="flex-1 accent-brand-cyan" 
          />
          <span className="text-xs font-bold text-brand-cyan">
            {sliderVal === 1 && "S1E1 Intro"}
            {sliderVal === 2 && "S1E2 Infiltration"}
            {sliderVal === 3 && "S1E3 Fall Climax"}
          </span>
        </div>
      </div>

      {/* Right Column: Node Details Panel */}
      <div className="w-full lg:w-72 rounded-xl border border-brand-border bg-brand-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-brand-violet" /> Canon details Inspector
        </h3>
        
        {selectedNode ? (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 bg-brand-border px-2 py-0.5 rounded">
                {selectedNode.type}
              </span>
              <h4 className="text-lg font-bold text-white mt-2">{selectedNode.label}</h4>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{selectedNode.details}</p>

            <div className="pt-2 border-t border-brand-border/40 space-y-2">
              <span className="text-xs text-gray-500 font-bold uppercase block">Known by</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-brand-border text-xs text-gray-300">Luna</span>
                {selectedNode.id !== 'boots' && (
                  <span className="px-2 py-0.5 rounded bg-brand-border text-xs text-gray-300">Leo</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center text-xs text-gray-500">
            <HelpCircle className="w-8 h-8 text-brand-border mb-2" />
            Click on a story node in the graph to inspect its canon facts, history, and relationships.
          </div>
        )}
      </div>
    </div>
  );
}
