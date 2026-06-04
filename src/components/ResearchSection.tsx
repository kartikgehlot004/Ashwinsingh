import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from './DataContext';
import { Research } from '../types';
import { Beaker, BookOpen, FlaskConical, CircleChevronRight, Landmark, ArrowLeft, Eye, FileDown, Plus } from 'lucide-react';
import { viewPdf, downloadPdf } from './pdfHelper';
import ReactMarkdown from 'react-markdown';

export default function ResearchSection({ isAdmin = false, setCurrentTab }: { isAdmin?: boolean; setCurrentTab?: (tab: string) => void }) {
  const { researches, researchIndexes } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Load from sessionStorage if navigated from Home page
  useEffect(() => {
    const preselectedId = sessionStorage.getItem('selected_research_id');
    if (preselectedId) {
      setSelectedId(preselectedId);
      sessionStorage.removeItem('selected_research_id');
    }
  }, [researches]);

  // Find the currently expanded research
  const selectedResearch = researches.find(r => r.id === selectedId);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedId]);

  // Categories extraction
  const categories = researchIndexes || ['All', 'Herbal Medicine', 'Nanotechnology', 'Cardiology', 'Chemistry', 'Gastroenterology'];

  // Filter lists
  const filteredResearches = researches.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.summary.toLowerCase().includes(search.toLowerCase()) ||
                          item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = activeCategory === 'All' || 
                            item.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
                            item.tags.some(t => t.toLowerCase().includes(activeCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  return (
    <div id="researches-section" className="relative text-white min-h-[95vh] pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <AnimatePresence mode="wait">
        {selectedResearch ? (
          <motion.div
            key="research-detail"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="w-full max-w-4xl mx-auto"
          >
            {/* Back button */}
            <div className="mb-8">
              <button
                onClick={() => setSelectedId(null)}
                className="group px-5 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-950 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition-all text-xs font-mono font-bold tracking-wider cursor-pointer hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] shadow-md"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
                Back to Researches
              </button>
            </div>

            {/* Complete research details viewport */}
            <div className="bg-slate-900/40 border border-cyan-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
              
              {/* Study Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-6 leading-tight bg-gradient-to-r from-white via-cyan-100 to-blue-400 bg-clip-text text-transparent">
                {selectedResearch.title}
              </h1>

              {/* Dynamic Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {selectedResearch.category && (
                  <div className="bg-slate-950/30 p-3.5 rounded-xl border border-slate-800/40">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-1">Academic Category</span>
                    <span className="text-xs font-semibold text-cyan-400 font-mono">{selectedResearch.category}</span>
                  </div>
                )}
                {selectedResearch.year && (
                  <div className="bg-slate-950/30 p-3.5 rounded-xl border border-slate-800/40">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-1">Publication Year</span>
                    <span className="text-xs font-semibold text-cyan-400 font-mono">{selectedResearch.year}</span>
                  </div>
                )}
                {selectedResearch.journal && (
                  <div className="bg-slate-950/30 p-3.5 rounded-xl border border-slate-800/40 sm:col-span-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-1">Journal / Reference Index</span>
                    <span className="text-xs font-medium text-slate-200">{selectedResearch.journal}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {selectedResearch.tags && selectedResearch.tags.length > 0 && (
                <div className="flex flex-wrap gap-2.5 items-center mb-6">
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Tags:</span>
                  {selectedResearch.tags.map((tag, idx) => (
                    <span key={idx} className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-cyan-950/40 text-cyan-400 border border-cyan-500/15">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Study Abstract / Short Summary */}
              {selectedResearch.summary && (
                <div className="bg-slate-950/45 rounded-2xl p-5 sm:p-6 border border-slate-800/60 transition-all mb-6">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 mb-2">Study Abstract / Short Summary</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">{selectedResearch.summary}</p>
                </div>
              )}

              {/* Methodology & Design */}
              {selectedResearch.methodology && (
                <div className="bg-slate-950/45 rounded-2xl p-5 sm:p-6 border border-slate-800/60 transition-all mb-6">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 mb-2">Methodology & Design</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">{selectedResearch.methodology}</p>
                </div>
              )}

              {/* Primary Discoveries */}
              {selectedResearch.findings && (
                <div className="bg-slate-950/45 rounded-2xl p-5 sm:p-6 border border-slate-800/60 transition-all mb-6">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 mb-2">Primary Discoveries</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">{selectedResearch.findings}</p>
                </div>
              )}

              {/* Clinical Impact */}
              {selectedResearch.impact && (
                <div className="bg-slate-950/45 rounded-2xl p-5 sm:p-6 border border-slate-800/60 transition-all mb-6">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 mb-2">Clinical Impact</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">{selectedResearch.impact}</p>
                </div>
              )}

              {/* Full Content */}
              {selectedResearch.fullContent && (
                <div className="bg-slate-950/45 rounded-2xl p-5 sm:p-6 border border-slate-800/60 transition-all mb-6">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 mb-2">Full Content</h3>
                  <div className="markdown-body text-sm text-slate-300 leading-relaxed font-sans prose prose-invert bg-slate-950/20 p-4.5 rounded-xl border border-slate-850 max-w-none">
                    <ReactMarkdown>{selectedResearch.fullContent}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* PDF upload (represented by View / Download) */}
              {selectedResearch.pdfUrl && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    <span className="text-[11px] font-mono font-semibold text-slate-350 uppercase tracking-widest">
                      PDF Attached Document
                    </span>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => viewPdf(selectedResearch.title, 'Research', selectedResearch.summary, selectedResearch.pdfUrl)}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-400 rounded-xl font-mono text-xs font-bold text-cyan-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Eye className="w-4 h-4" /> View PDF
                    </button>
                    <button
                      onClick={() => downloadPdf(selectedResearch.title, 'Research', selectedResearch.summary, selectedResearch.pdfUrl, selectedResearch.title)}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                    >
                      <FileDown className="w-4 h-4" /> Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="research-list"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Admin Controls bar */}
            {isAdmin && (
              <div className="mb-8 bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">ADMIN CONTROL PORTAL ACTIVE</span>
                </div>
                <button
                  onClick={() => {
                    if (setCurrentTab) {
                      setCurrentTab('admin');
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-mono text-xs font-black text-white hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Manage, Upload, Edit or Delete Researches
                </button>
              </div>
            )}

            {/* Title block */}
            <div className="flex flex-col items-center text-center gap-2 mb-10">
              <span className="px-3 py-1 text-[11px] font-mono leading-none tracking-widest text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-500/20 rounded-full">
                Preclinical Studies
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                Scientific Research Lab
              </h2>
              <p className="max-w-2xl text-slate-400 text-xs sm:text-sm leading-relaxed">
                Showcasing 9 key sample studies outlining therapeutic drug delivery, botanical synergies, and biochemical modeling pathways.
              </p>
            </div>

            {/* Category filters inside glassmorphic bar */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-3 sm:p-4 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSelectedId(null); }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              {/* Search Input inline */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-full px-4 py-2 text-xs text-slate-300 focus:outline-none transition-colors"
                  placeholder="Search methodology or compound tag..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedId(null); }}
                />
              </div>
            </div>

            {/* Grid listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResearches.map((item) => (
                <div
                  key={item.id}
                  id={`research-card-${item.id}`}
                  onClick={() => setSelectedId(item.id)}
                  className="relative bg-slate-900/60 hover:bg-slate-900 border transition-all duration-300 cursor-pointer rounded-2xl p-5 overflow-hidden group flex flex-col justify-between min-h-[220px] border-slate-800/80 hover:border-cyan-500/35 hover:shadow-2xl hover:shadow-cyan-500/5 active:scale-98"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Glowing neon tag card indicator */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/10 to-transparent blur-md pointer-events-none" />

                  <div>
                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug mb-2.5">
                      {item.title}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3.5">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-900">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Abstract / Short Summary */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                      {item.summary}
                    </p>
                  </div>

                  <div className="border-t border-slate-800/40 pt-3 flex items-center justify-between mt-auto">
                    <span className="text-[10px] uppercase font-mono text-cyan-400 block font-bold">
                      Research Study
                    </span>
                    
                    <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-all">
                      Read Study
                      <CircleChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}

              {filteredResearches.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/20 border border-slate-800 rounded-2xl border-dashed">
                  <FlaskConical className="w-8 h-8 text-slate-600 mx-auto mb-3 animate-bounce" />
                  <p className="text-xs font-mono">No research matches your formulation filter.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
