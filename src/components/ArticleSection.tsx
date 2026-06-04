import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from './DataContext';
import { FileText, Eye, Timer, Calendar, Search, SlidersHorizontal, BookOpen, FileDown, ArrowLeft, Activity, Layers, Microscope, Plus } from 'lucide-react';
import { viewPdf, downloadPdf } from './pdfHelper';
import ReactMarkdown from 'react-markdown';

export default function ArticleSection({ isAdmin = false, setCurrentTab }: { isAdmin?: boolean; setCurrentTab?: (tab: string) => void }) {
  const { articles, articleIndexes } = useData();
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'views'>('date');
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const selectedArticle = useMemo(() => {
    return articles.find(art => art.id === selectedArticleId);
  }, [articles, selectedArticleId]);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedArticleId]);

  // Filter list of 60+ articles in real-time
  const filteredArticles = useMemo(() => {
    let list = [...articles];

    // Category filter
    if (activeCategory !== 'All') {
      list = list.filter(art => art.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Search query matching
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(art => 
        art.title.toLowerCase().includes(q) || 
        art.snippet.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q)
      );
    }

    // Sorterm logic
    if (sortBy === 'views') {
      list.sort((a, b) => b.views - a.views);
    }

    return list;
  }, [articles, activeCategory, search, sortBy]);

  const showMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, filteredArticles.length));
  };

  return (
    <div id="articles-section" className="relative text-white min-h-[95vh] pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <AnimatePresence mode="wait">
        {selectedArticle ? (
          <motion.div
            key="article-detail"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="w-full max-w-4xl mx-auto"
          >
            {/* Elegant Back button */}
            <div className="mb-8">
              <button
                onClick={() => setSelectedArticleId(null)}
                className="group px-5 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-950 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition-all text-xs font-mono font-bold tracking-wider cursor-pointer hover:border-[#10b981]/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] shadow-md"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
                Back to Articles
              </button>
            </div>

            {/* Glowing container with detailed content */}
            {/* Glowing container with detailed content */}
            <div className="bg-slate-900/40 border border-emerald-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
              {/* Artistic fluorescent ambient light halos */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-teal-500/5 to-transparent blur-3xl pointer-events-none" />

              {/* 1. Title display */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-6 leading-tight bg-gradient-to-r from-white via-emerald-100 to-[#10b981] bg-clip-text text-transparent">
                {selectedArticle.title}
              </h1>

              {/* 2. Category */}
              {selectedArticle.category && (
                <div className="mb-4">
                  <span className="text-[10px] font-mono text-slate-550 font-bold uppercase tracking-wider block mb-1">Category & Specialty</span>
                  <span className="px-3.5 py-1 text-[11px] font-mono font-black uppercase tracking-widest bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 rounded-full inline-block">
                    {selectedArticle.category}
                  </span>
                </div>
              )}

              {/* 3. Publication Date */}
              {selectedArticle.date && (
                <div className="mb-6">
                  <span className="text-[10px] font-mono text-slate-550 font-bold uppercase tracking-wider block mb-1">Publication Date</span>
                  <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    {selectedArticle.date}
                  </span>
                </div>
              )}

              {/* 4. Excerpt */}
              {selectedArticle.snippet && (
                <div className="mb-6 bg-slate-950/30 p-5 rounded-2xl border border-slate-800/40">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-2">Excerpt Summary</span>
                  <p className="italic text-slate-300 leading-relaxed font-sans">{selectedArticle.snippet}</p>
                </div>
              )}

              {/* 5. Tags */}
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="mb-6">
                  <span className="text-[10px] font-mono text-slate-550 font-bold uppercase tracking-wider block mb-2">Indexed Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 rounded text-xs font-mono bg-slate-950 text-emerald-400 border border-emerald-950">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Full Content */}
              {selectedArticle.content && (
                <div className="bg-slate-950/45 rounded-2xl p-5 sm:p-6 border border-slate-800/60 transition-all mb-8">
                  <span className="text-[10px] font-mono text-[#10b981] font-bold uppercase tracking-wider block mb-3">Full Article Content</span>
                  <div className="markdown-body text-sm text-slate-300 leading-relaxed font-sans prose prose-invert bg-slate-950/20 p-4.5 rounded-xl border border-slate-850 max-w-none">
                    <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* 7. PDF Actions */}
              {selectedArticle.pdfUrl && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[11px] font-mono font-semibold text-slate-350 uppercase tracking-widest">
                      PDF Attached Manuscript
                    </span>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => viewPdf(selectedArticle.title, selectedArticle.category, selectedArticle.snippet, selectedArticle.pdfUrl)}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-emerald-500/30 hover:border-emerald-400 rounded-xl font-mono text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Eye className="w-4 h-4" /> View PDF
                    </button>
                    <button
                      onClick={() => downloadPdf(selectedArticle.title, selectedArticle.category, selectedArticle.snippet, selectedArticle.pdfUrl, selectedArticle.title)}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-555/20"
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
            key="article-list"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Admin Controls bar */}
            {isAdmin && (
              <div className="mb-8 bg-slate-900/50 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fadeIn">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">ADMIN CONTROL PORTAL ACTIVE</span>
                </div>
                <button
                  onClick={() => {
                    if (setCurrentTab) {
                      setCurrentTab('admin');
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-550 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-900 rounded-xl font-mono text-xs font-black bg-emerald-400 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Manage, Upload, Edit or Delete Articles
                </button>
              </div>
            )}

            {/* Visual Title Header */}
            <div className="flex flex-col items-center text-center gap-2 mb-10">
              <span className="px-3 py-1 text-[11px] font-mono leading-none tracking-widest text-[#10b981] uppercase bg-emerald-950/40 border border-emerald-500/20 rounded-full">
                Academic Writings
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-emerald-200 to-teal-400 bg-clip-text text-transparent">
                Pharmacology Articles
              </h2>
              <p className="max-w-2xl text-slate-400 text-xs sm:text-sm leading-relaxed">
                Dr. Chouhan's clinical summaries, toxicological studies, and regulatory reviews. Fully searchable library of 60+ medical compositions.
              </p>
            </div>

            {/* Responsive Filter Control Deck */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-3xl mb-8 space-y-4 shadow-xl">
              
              {/* Row 1: Search & Sort Selects */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="relative md:col-span-8">
                  <Search className="absolute left-4 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    id="articles-search-input"
                    className="w-full bg-slate-950 border border-slate-800/80 focus:border-[#10b981] rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-300 focus:outline-none transition-colors"
                    placeholder="Search by title, compound keywords, or biomedical themes..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setVisibleCount(12); }}
                  />
                </div>
                
                <div className="md:col-span-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    id="articles-sort-select"
                    className="w-full bg-slate-950 border border-slate-800/80 focus:border-[#10b981] rounded-full px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'views')}
                  >
                    <option value="date">Sort: Recent Contributions</option>
                    <option value="views">Sort: Most Read Archives</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Category Pills Scrolling */}
              <div className="flex items-center gap-2 border-t border-slate-800/30 pt-3 overflow-x-auto pb-1 scrollbar-thin">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase shrink-0 mr-1">
                  Index:
                </span>
                <div className="flex gap-1.5">
                  {(articleIndexes || []).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setVisibleCount(12); }}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all cursor-pointer shrink-0 ${
                        activeCategory === cat
                          ? 'bg-[#10b981] text-slate-950 font-semibold shadow-lg shadow-emerald-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Scientific Article Counter */}
            <div className="flex justify-between items-center mb-6 px-1">
              <p className="text-xs font-mono text-slate-400">
                Showing <span className="text-emerald-400 font-bold">{Math.min(filteredArticles.length, visibleCount)}</span> of{' '}
                <span className="text-emerald-400 font-bold">{filteredArticles.length}</span> matching records
              </p>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-850 text-slate-500">
                ARCHIVE STACK: DYNAMIC
              </span>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="articles-items-grid">
              {filteredArticles.slice(0, visibleCount).map((art) => (
                <motion.article
                  key={art.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setSelectedArticleId(art.id)}
                  className="bg-slate-900/55 hover:bg-slate-900 border border-slate-800/70 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-emerald-905/10 cursor-pointer"
                >
                  <div>
                    {/* 1. Title */}
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors leading-snug line-clamp-2 mb-2.5">
                      {art.title}
                    </h3>

                    {/* 2. Category & 3. Publication Date */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider bg-slate-950 text-emerald-400 border border-emerald-950">
                        {art.category}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500/50" />
                        <span>{art.date}</span>
                      </div>
                    </div>

                    {/* 4. Excerpt */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-3.5">
                      {art.snippet}
                    </p>

                    {/* 5. Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {art.tags && art.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-900">
                          #{tag}
                        </span>
                      ))}
                      {art.tags && art.tags.length > 3 && (
                        <span className="text-[9px] font-mono text-slate-500 pt-0.5">+{art.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="border-t border-slate-800/40 pt-3 mt-auto flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="text-emerald-405 font-bold uppercase">Article Entry</span>
                    <span className="text-emerald-400 font-black uppercase flex items-center gap-1 group-hover:translate-x-1 transition-all">
                      Read Article →
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* No articles state */}
            {filteredArticles.length === 0 && (
              <div className="py-24 text-center rounded-2xl bg-slate-900/10 border border-slate-800 border-dashed max-w-md mx-auto">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-mono text-xs">No entries match your diagnostic parameters.</p>
              </div>
            )}

            {/* Pagination Footer */}
            {filteredArticles.length > visibleCount && (
              <div className="flex justify-center mt-12" id="articles-pagination-bar">
                <button
                  id="show-more-articles-btn"
                  onClick={showMore}
                  className="px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-xs font-mono font-bold tracking-widest text-[#10b981] hover:text-white transition-all shadow-lg hover:shadow-emerald-900/5 cursor-pointer"
                >
                  SHOW MORE RESEARCH ARTICLES ({filteredArticles.length - visibleCount} REMAINING)
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
