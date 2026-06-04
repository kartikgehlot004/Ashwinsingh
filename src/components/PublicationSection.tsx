import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useData } from './DataContext';
import { Publication } from '../types';
import { Award, BookOpen, Quote, Share2, CornerRightDown, ExternalLink, BookmarkCheck, Plus } from 'lucide-react';

export default function PublicationSection({ isAdmin = false, setCurrentTab }: { isAdmin?: boolean; setCurrentTab?: (tab: string) => void }) {
  const { publications } = useData();
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Color mappings for glowing borders
  const colors = [
    { border: 'border-violet-500/40', glow: 'shadow-[0_0_20px_-3px_rgba(139,92,246,0.3)]', text: 'text-violet-400', accent: 'bg-violet-950/40 text-violet-300 border-violet-500/30' },
    { border: 'border-fuchsia-500/40', glow: 'shadow-[0_0_20px_-3px_rgba(217,70,239,0.3)]', text: 'text-fuchsia-400', accent: 'bg-fuchsia-950/40 text-fuchsia-300 border-fuchsia-500/30' },
    { border: 'border-cyan-500/40', glow: 'shadow-[0_0_20px_-3px_rgba(6,182,212,0.3)]', text: 'text-cyan-400', accent: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30' },
    { border: 'border-pink-500/40', glow: 'shadow-[0_0_20px_-3px_rgba(236,72,153,0.3)]', text: 'text-pink-400', accent: 'bg-pink-950/40 text-pink-300 border-pink-500/30' }
  ];

  const handleCitationCopy = (pub: Publication, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid flipping the card
    const citation = `${pub.authors}. (${pub.year}). ${pub.title}. ${pub.journal}. DOI: ${pub.doi}`;
    navigator.clipboard.writeText(citation);
    alert("APA Academic Citation copied to clipboard!");
  };

  return (
    <div id="publications-section" className="relative text-white min-h-[95vh] pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      
      {/* Admin Controls bar */}
      {isAdmin && (
        <div className="mb-8 bg-slate-900/50 border border-purple-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">ADMIN CONTROL PORTAL ACTIVE</span>
          </div>
          <button
            onClick={() => {
              if (setCurrentTab) {
                setCurrentTab('admin');
              }
            }}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-violet-550 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-mono text-xs font-black bg-purple-500 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Manage, Upload, Edit or Delete Publications
          </button>
        </div>
      )}

      {/* Visual Header */}
      <div className="flex flex-col items-center text-center gap-2 mb-12">
        <span className="px-3 py-1 text-[11px] font-mono leading-none tracking-widest text-[#a855f7] uppercase bg-purple-950/40 border border-purple-500/20 rounded-full">
          Peer-Reviewed Works
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-indigo-400 bg-clip-text text-transparent">
          Featured Achievements
        </h2>
        <p className="max-w-xl text-slate-400 text-xs sm:text-sm leading-relaxed">
          High-impact publications indexing molecular synthesis, transdermal carrier matrices, and toxicity evaluations. Click to flip in 3D and read abstract details.
        </p>
      </div>

      {/* Grid of Publications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="publications-cards-holder">
        {publications.map((pub, index) => {
          const styleSet = colors[index % colors.length];

          return (
            <div
              key={pub.id}
              className={`bg-slate-900/85 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between border ${styleSet.border} ${styleSet.glow} overflow-hidden`}
            >
              <div className="space-y-4">
                {/* 1. Title */}
                <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug bg-gradient-to-r from-white via-purple-100 to-indigo-300 bg-clip-text text-transparent">
                  {pub.title}
                </h3>

                {/* 2. Journal Name */}
                {pub.journal && (
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Journal Name</span>
                    <span className={`text-xs font-semibold ${styleSet.text}`}>
                      {pub.journal}
                    </span>
                  </div>
                )}
 
                 {/* 3. Published Date */}
                {pub.year && (
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Published Date</span>
                    <span className="text-xs font-mono text-slate-300">
                      {pub.year}
                    </span>
                  </div>
                )}
 
                 {/* 4. DOI Number and Link */}
                {(pub.doi || pub.doi_link) && (
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-1">DOI Number & Link</span>
                    <a
                      href={pub.doi_link || (pub.doi?.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="underline decoration-cyan-400/30 truncate max-w-[280px]">{pub.doi || pub.doi_link}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400/80" />
                    </a>
                  </div>
                )}
 
                 {/* 5. Co-Authors Name */}
                {pub.authors && (
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Co-Authors Name</span>
                    <p className="text-xs text-slate-300 font-sans">
                      {pub.authors}
                    </p>
                  </div>
                )}
 
                 {/* 6. Study Abstract Summary */}
                {pub.abstract && (
                  <div>
                    <span className="text-[10px] font-mono text-slate-550 font-bold uppercase tracking-wider block mb-1">Study Abstract Summary</span>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-6">
                      {pub.abstract}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
