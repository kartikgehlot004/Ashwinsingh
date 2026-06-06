import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { viewPdf, downloadPdf } from './pdfHelper';
import { 
  Beaker, Award, FileText, ArrowUpRight, ShieldCheck, HeartPulse, 
  HardDriveDownload, Calendar, Mail, User, Info, ArrowRight, Download, 
  CheckCircle2, MessageSquare, Send, Sparkles, BookOpen, VolumeX, Eye, BookMarked, MapPin
} from 'lucide-react';
import { useData } from './DataContext';
import { Research, Article, Publication, Note } from '../types';

interface HomeSectionProps {
  setCurrentTab: (tab: string) => void;
}

export default function HomeSection({ setCurrentTab }: HomeSectionProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState('');
  
  // Highlight states
  const [expandedResearchId, setExpandedResearchId] = useState<string | null>(null);
  const [flippedPubId, setFlippedPubId] = useState<string | null>(null);
  const [downloadingNoteId, setDownloadingNoteId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Load from context
  const { 
    researches, 
    articles, 
    publications, 
    notes, 
    timeline, 
    homeConfig, 
    addContactSubmission 
  } = useData();

  // Take subset of data to optimize space and relevance
  const sampleResearches = researches.slice(0, 3);
  const sampleArticles = articles.slice(0, 3);
  const samplePublications = publications.slice(0, 2);
  const sampleNotes = notes.slice(0, 3);
  const sampleMilestones = (() => {
    // Attempt preferred key years first
    const preferredYears = ['2013', '2021', '2026', '2015', '2018', '2023'];
    const filtered = timeline.filter(m => preferredYears.includes(m.year));
    if (filtered.length >= 2) {
      return filtered.slice(0, 3);
    }
    // Fallback to taking the latest items by chronological order descending
    const sorted = [...timeline].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    if (sorted.length >= 2) {
      return sorted.slice(0, 3);
    }
    return timeline.slice(0, 3);
  })();

  // Tagline typewriter effect
  useEffect(() => {
    const fullText = homeConfig.typedText || "";
    setTypedText('');
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypedText(prev => prev + fullText[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [homeConfig.typedText]);

  // 3D Card rotation effect on hover mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate rotation angles based on mouse offset from center
    const cardWidth = rect.width;
    const cardHeight = rect.height;
    const centerX = rect.left + cardWidth / 2;
    const centerY = rect.top + cardHeight / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Bound limit is 15 degrees max
    const rotateX = -(mouseY / (cardHeight / 2)) * 12;
    const rotateY = (mouseX / (cardWidth / 2)) * 12;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  // Simulated download handler
  const handleDownloadNote = (noteId: string) => {
    setDownloadingNoteId(noteId);
    setDownloadSuccessId(null);
    setTimeout(() => {
      setDownloadingNoteId(null);
      setDownloadSuccessId(noteId);
      setTimeout(() => {
        setDownloadSuccessId(null);
      }, 3000);
    }, 1800);
  };

  // Mini form handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormLoading(true);
    
    // Push submission to dynamic central Inbox
    addContactSubmission({
      name: formData.name,
      email: formData.email,
      message: formData.message
    });
    
    try {
      const response = await fetch("https://formspree.io/f/xlgkgoov", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message
        })
      });

      if (response.ok) {
        setFormLoading(false);
        setFormSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setFormSubmitted(false), 5000);
      } else {
        const data = await response.json();
        alert(data.error || "There was a problem sending your message. Please try again.");
        setFormLoading(false);
      }
    } catch (error) {
      console.error("Formspree submission error:", error);
      alert("An error occurred. Your message was recorded locally, but the online delivery failed.");
      setFormLoading(false);
      // Still set submitted state so the user experience is smooth
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setFormSubmitted(false), 5000);
    }
  };

  const stats = (homeConfig.stats || []).map((s, index) => {
    let Icon = Beaker;
    if (s.iconName === 'FileText') Icon = FileText;
    else if (s.iconName === 'Award') Icon = Award;
    else if (s.iconName === 'HeartPulse') Icon = HeartPulse;

    const colors = [
      "text-cyan-400 border-cyan-500/20 bg-cyan-950/20",
      "text-emerald-400 border-emerald-500/20 bg-emerald-950/20",
      "text-violet-400 border-violet-500/20 bg-violet-950/20",
      "text-pink-400 border-pink-500/20 bg-pink-950/20"
    ];

    return {
      value: s.value,
      label: s.label,
      icon: Icon,
      color: colors[index % colors.length]
    };
  });

  return (
    <div className="relative text-white flex flex-col items-center justify-center min-h-[95vh] px-4 md:px-8 space-y-28 overflow-hidden pt-12">
      
      {/* ----------------- 1. HERO SECTION ----------------- */}
      <section id="hero-section" className="relative max-w-5xl w-full flex flex-col items-center text-center pt-16 gap-6">
        
        {/* Colorful Blurred Halos */}
        <div className="absolute top-1/4 left-10 w-80 h-80 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-72 h-72 rounded-full bg-purple-500/10 blur-[110px] pointer-events-none" />

        {/* Centered Hero Elements: Bold Titles and interactive stats */}
        <div className="flex flex-col items-center gap-6 max-w-4xl">
          
          <div className="space-y-3">
            <p className="text-xs md:text-sm font-mono text-slate-400 tracking-widest uppercase">
              PORTFOLIO PROFILE & DISCOVERY PORTAL
            </p>
            <h1 className="text-4xl sm:text-5.5xl xl:text-7xl font-extrabold tracking-tight leading-[1.08] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent filter drop-shadow-sm pb-1">
              {homeConfig.title}
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-cyan-300 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              {homeConfig.subtitle}
            </h2>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed min-h-[56px] font-medium border-y border-cyan-500/30 px-6 bg-slate-950/60 py-3 rounded-2xl max-w-3xl">
            {typedText}
            <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse" />
          </p>

          {/* Action Button Strip */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center w-full">
            <button
              onClick={() => setCurrentTab('researches')}
              className="px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:from-cyan-400 hover:to-pink-400 rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 transform hover:-translate-y-1 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-400/30 cursor-pointer text-white text-center focus:outline-none"
            >
              Explore Researches
              <Beaker className="w-4 h-4 text-white" />
            </button>
            
            <button
              onClick={() => setCurrentTab('notes')}
              className="px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 text-slate-300 hover:text-cyan-300 cursor-pointer shadow-md focus:outline-none"
            >
              Research Notes & PDFs
              <HardDriveDownload className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 w-full">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={`backdrop-blur-md p-4 rounded-2xl border ${stat.color} flex flex-col justify-between h-28 transform transition-all duration-300 hover:scale-103 hover:border-white/25 hover:shadow-lg`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">{stat.value}</span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium tracking-tight leading-snug text-left">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

      </section>

      {/* ----------------- 2. ABOUT US PREVIEW ----------------- */}
      <section id="about-preview" className="relative max-w-7xl w-full py-8 border-t border-slate-900">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left bio block */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-pink-400 font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> A Legacy of Academic Excellence
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                About Dr. Ashwin Singh Chouhan
              </h2>
            </div>
            
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Dr. Ashwin Singh Chouhan is a highly distinguished pharmacologist, chief researcher, and academic mentor carrying over a decade of deep involvement in pharmaceutical sciences. His professional research focuses heavily on targeted pharmaceutical drug delivery systems, advanced synergistic drug formulations, toxicology markers, and green nanoparticle syntheses.
            </p>

            <blockquote className="border-l-4 border-purple-500 pl-4 py-1.5 text-slate-400 italic text-sm">
              "We strive to blend traditional phytopharmaceutical agents with modern nanotechnology matrices to isolate targeted, high-efficacy remedies with minimized systemic side effects."
            </blockquote>

            <p className="text-slate-300 text-sm">
              Currently holding academic responsibilities as an Assistant Professor, Associate Editor, and Board Member, Dr. Chouhan leads preclinical investigation projects supporting safer patient pharmaceutical care options globally.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setCurrentTab('about')}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-full flex items-center gap-2 transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer focus:outline-none"
              >
                Read Professional Bio
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right vertical timeline preview with 3 key years */}
          <div className="lg:col-span-6 relative flex flex-col gap-6 bg-slate-900/30 p-6 sm:p-8 rounded-3xl border border-slate-800/80 backdrop-blur-sm shadow-xl">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Key Milestone Timeline
            </h3>

            <div className="relative pl-6 border-l border-slate-800 flex flex-col gap-8">
              {sampleMilestones.map((milestone, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline pointer with custom glowing border */}
                  <div className="absolute -left-[30px] top-1 w-4.5 h-4.5 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {milestone.year}
                    </span>
                    <h4 className="text-white font-bold text-sm tracking-wide">
                      {milestone.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {milestone.institution}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button below the milestones */}
            <div className="pt-4 border-t border-slate-800/50 flex justify-center">
              <button
                onClick={() => {
                  sessionStorage.setItem('scroll_to_milestones', 'true');
                  setCurrentTab('about');
                }}
                className="group px-6 py-2.5 bg-slate-950 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/10 focus:outline-none"
              >
                View More Milestones
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ----------------- 3. RESEARCH HIGHLIGHTS (EXPANDABLE CARDS) ----------------- */}
      <section id="researches-preview" className="relative max-w-7xl w-full py-8 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center gap-2">
          <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <Beaker className="w-3.5 h-3.5 animate-pulse" /> Preclinical Explorations
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Research Highlights
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Take a deep technical dive into sample molecular screening protocols and formulation methodologies spearheaded by Dr. Chouhan. Click a research card to expand the structural study.
          </p>
        </div>

        {/* 3 Columns of responsive expandable cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleResearches.map((res: Research) => {
            const isExpanded = expandedResearchId === res.id;
            return (
              <div
                key={res.id}
                className={`flex flex-col rounded-2xl border transition-all duration-300 bg-slate-950/70 p-6 relative overflow-hidden backdrop-blur-md ${
                  isExpanded 
                    ? 'border-cyan-400/50 shadow-2xl shadow-cyan-500/10 md:col-span-3' 
                    : 'border-slate-800 hover:border-cyan-500/30 hover:shadow-lg'
                }`}
              >
                {/* Visual Ambient glow strip inside card */}
                {isExpanded && (
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 to-purple-500" />
                )}

                {/* Primary header information */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="px-3 py-0.5 text-[9px] font-mono uppercase bg-slate-900 border border-slate-800 rounded-full text-cyan-300 font-bold">
                      {res.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{res.year}</span>
                  </div>

                  <h3 className="text-white font-extrabold text-base md:text-lg tracking-tight hover:text-cyan-300 transition-colors">
                    {res.title}
                  </h3>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {res.summary}
                  </p>

                  {/* Scientific Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {res.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[9px] font-mono bg-slate-900/80 rounded border border-slate-800/50 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Toggle Action and Expanded Content Area */}
                <div className="mt-4 pt-4 border-t border-slate-850 flex flex-col">
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 pb-2 text-xs sm:text-sm">
                          {/* Method block */}
                          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                            <h4 className="text-cyan-400 font-bold uppercase font-mono tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              Methodology & Design
                            </h4>
                            <p className="text-slate-300 leading-relaxed font-medium">
                              {res.methodology}
                            </p>
                          </div>

                          {/* Findings block */}
                          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                            <h4 className="text-pink-400 font-bold uppercase font-mono tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                              Key Discoveries
                            </h4>
                            <p className="text-slate-300 leading-relaxed font-medium">
                              {res.findings}
                            </p>
                          </div>

                          {/* Clinical impact block */}
                          <div className="bg-slate-905/60 p-4 rounded-xl border border-slate-800">
                            <h4 className="text-purple-400 font-bold uppercase font-mono tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              Clinical Clinical Impact
                            </h4>
                            <p className="text-slate-300 leading-relaxed font-medium">
                              {res.impact}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-cyan-950/10 border border-cyan-500/10 rounded-xl text-center text-xs mt-2 text-slate-400">
                          Published in <span className="text-cyan-300 font-bold font-mono">{res.journal}</span> | Standard Core Peer Reviewed Access Ledger
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-center mt-3">
                    <button
                      onClick={() => {
                        sessionStorage.setItem('selected_research_id', res.id);
                        setCurrentTab('researches');
                      }}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition-all cursor-pointer focus:outline-none border border-slate-700 hover:border-cyan-400"
                    >
                      Expand Researches
                    </button>

                    <span className="text-[10px] text-slate-500 font-mono italic">
                      {res.journal}
                    </span>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------- 4. ARTICLES PREVIEW ----------------- */}
      <section id="articles-preview" className="relative max-w-7xl w-full py-8 border-t border-slate-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <span className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Core Insights Grid
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
              Articles Preview
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Exploring standard toxicology pathways, organic extracts kinetics, and clinical safety frameworks index.
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('articles')}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-500 rounded-xl transition-all cursor-pointer text-slate-200 hover:text-white flex items-center gap-1.5 focus:outline-none"
          >
            View All Articles
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 titles in grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sampleArticles.map((art: Article) => (
            <div
              key={art.id}
              onClick={() => setCurrentTab('articles')}
              className="group p-5 rounded-xl border border-slate-800/80 hover:border-emerald-500/40 bg-slate-950/40 hover:bg-slate-900/40 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 h-48 select-none"
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono uppercase font-bold text-emerald-400">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {art.readTime}
                  </span>
                </div>

                <h3 className="text-white font-bold text-xs sm:text-sm tracking-tight leading-snug group-hover:text-emerald-300 transition-colors line-clamp-2">
                  {art.title}
                </h3>
                
                <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                  {art.snippet}
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-900 pt-2 text-[10px] font-mono text-slate-500 group-hover:text-slate-400 transition-colors">
                <span>{art.date}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {art.views} views
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- 5. PUBLICATIONS PREVIEW (GLOWING 3D FLIP CARDS) ----------------- */}
      <section id="publications-preview" className="relative max-w-7xl w-full py-8 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center gap-2">
          <span className="text-purple-400 font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> High-Impact Academic Journals
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Featured Publications & Patents
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Highlighting indexed clinical models in leading high-impact channels. **Click any flip card** or tap below to rotate and read abstracts.
          </p>
        </div>

        {/* 2 sample publications with glowing 3D flip card effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {samplePublications.map((pub: Publication) => {
            const isFlipped = flippedPubId === pub.id;
            return (
              <div 
                key={pub.id}
                className="w-full h-85 cursor-pointer [perspective:1400px] select-none"
                onClick={() => setFlippedPubId(isFlipped ? null : pub.id)}
              >
                <div 
                  className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
                  style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
                >
                  
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-purple-500/35 p-6 flex flex-col justify-between shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/60 transition-all duration-300">
                    
                    {/* Glowing neon top corners */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[40px] pointer-events-none" />
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="px-3 py-1 bg-purple-950/40 text-purple-300 border border-purple-800/50 rounded-full font-bold">
                          {pub.journal}
                        </span>
                        <span className="text-slate-400 font-bold">{pub.year}</span>
                      </div>

                      <h3 className="text-white text-sm sm:text-base font-extrabold tracking-tight leading-snug mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200">
                        "{pub.title}"
                      </h3>

                      <p className="text-slate-400 text-xs mt-1">
                        Authors: <span className="text-slate-300 font-medium font-mono">{pub.authors}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono font-bold">
                        <BookMarked className="w-4 h-4 text-pink-400 animate-pulse" />
                        <span>Citations: {pub.citationCount}</span>
                      </div>

                      <span className="text-[10px] font-mono font-extrabold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg animate-pulse">
                        Click to Flip Abstract ⟳
                      </span>
                    </div>

                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-900 border border-pink-500/35 p-6 flex flex-col justify-between shadow-2xl">
                    
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[85%] pr-1 scrollbar-thin">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-400">
                        Scientific Abstract Outline
                      </span>
                      <p className="text-slate-200 text-xs leading-relaxed font-normal">
                        {pub.abstract}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                      <span className="font-mono text-slate-500 text-[10px] truncate max-w-[200px]">
                        DOI: {pub.doi}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent flipping again
                          setCurrentTab('publications');
                        }}
                        className="px-3.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest bg-pink-500 text-slate-950 hover:bg-pink-400 transition-colors focus:outline-none"
                      >
                        View Full DOI Link ↗
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------- 6. NOTES PREVIEW ----------------- */}
      <section id="notes-preview" className="relative max-w-7xl w-full py-8 border-t border-slate-900">
        <div className="absolute top-10 left-10 w-64 h-64 bg-amber-500/5 blur-[90px] pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <span className="text-amber-400 font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> High-Yield Lectures & Guides
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
              Sample Research Notes
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Hand-compiled study guides and chemical kinetics lecture sheets for pharmacy academic reference.
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('notes')}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-500 rounded-xl transition-all cursor-pointer text-slate-200 hover:text-white flex items-center gap-1.5 focus:outline-none animate-pulse"
          >
            Go to Notes Vault
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 sample notes cards with download animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleNotes.map((note: Note) => {
            const isThisDownloading = downloadingNoteId === note.id;
            const isThisSuccess = downloadSuccessId === note.id;
            
            return (
              <div
                key={note.id}
                className="p-6 rounded-2xl border border-slate-850 bg-slate-950/50 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between min-h-60 group hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 text-[9px] font-mono uppercase bg-amber-950/20 text-amber-400 ring-1 ring-amber-500/20 rounded">
                      {note.type} DOCUMENT
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">{note.size}</span>
                  </div>

                  <h3 className="text-white font-extrabold text-sm sm:text-base tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
                    {note.title}
                  </h3>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                    {note.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-900/60 flex gap-2 w-full">
                  <button
                    onClick={() => viewPdf(note.title, note.type, note.content, note.pdfUrl || note.downloadUrl)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-400 text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer focus:outline-none shadow-md"
                  >
                    <Eye className="w-3.5 h-3.5 animate-pulse" /> View PDF
                  </button>
                  <button
                    onClick={() => downloadPdf(note.title, note.type, note.content, note.pdfUrl || note.downloadUrl, note.title)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-450 hover:to-orange-450 text-slate-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer focus:outline-none shadow-lg shadow-amber-500/10"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------- 7. CONTACT PREVIEW (MINI FORM) ----------------- */}
      <section id="contact-preview" className="relative max-w-4xl w-full py-8 border-t border-slate-900 mx-auto">
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-950/40 p-6 sm:p-10 rounded-3xl border border-slate-850 backdrop-blur-md shadow-2xl">
          
          <div className="md:col-span-5 flex flex-col gap-4">
            <span className="text-pink-400 font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Collaborative Channels
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Connect Directly & Quick Inquiry
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Have a clinical trial inquiry, pharmacological advisory requirement, or guest lecture offer? Fill this mini contact slot to establish communication instantly with Dr. Ashwin's desk.
            </p>
            
            <div className="flex flex-col gap-2 pt-2 text-[11px] sm:text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Office response rating: Within 24-48 Hours
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                Current coordinates: State Department, India
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7 select-none">
            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-950/30 p-6 border border-emerald-500/40 rounded-2xl flex flex-col items-center text-center gap-3 shadow-xl"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/25 border border-emerald-400 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-emerald-300 font-bold text-base">Inquiry Saved Successfully</h3>
                <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
                  Thank you for your message! Dr. Ashwin Singh Chouhan's administrative deck has registered your inquiry. An agent will revert back to your mail shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
                <div>
                  <label htmlFor="mini-name" className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="mini-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Jennifer Carter"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="mini-email" className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="mini-email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. jennifer@university.edu"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="mini-message" className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                    Brief Message
                  </label>
                  <textarea
                    id="mini-message"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Brief outline of formulation inquiry, collaboration proposals..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-medium resize-none"
                  />
                </div>

                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={formLoading}
                    whileHover={{ scale: 1.01, boxShadow: '0 0 15px rgba(236, 72, 153, 0.3)' }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 via-fuchsia-600 to-pink-500 text-white hover:from-pink-400 hover:to-pink-400 transition-all cursor-pointer shadow-lg shadow-pink-500/10 flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50"
                  >
                    {formLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transmitting Cipher...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Transmit Inquiry Securely
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ----------------- 8. CALL TO ACTION ----------------- */}
      <section id="cta-banner" className="relative max-w-5xl w-full text-center py-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative p-8 md:p-14 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center gap-6">
          {/* Subtle neon lines */}
          <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-cyan-500 opacity-60" />
          <div className="absolute top-0 bottom-0 right-0 w-[4px] bg-pink-500 opacity-60" />

          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-2xl leading-tight">
            Dive into Preclinical Science & High-Yield Analysis
          </h2>
          
          <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
            Gain immediate access to structured pharmacological findings, drug clearance formulas, patent outlines, and analytical chemistry validation manuals.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setCurrentTab('researches')}
              className="px-8 py-4 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 hover:shadow-cyan-400/20 hover:scale-103 transform rounded-full flex items-center justify-center gap-2.5 transition-all outline-none cursor-pointer"
            >
              Explore My Work
              <ArrowRight className="w-4 h-4 font-black" />
            </button>
            <button
              onClick={() => setCurrentTab('contact')}
              className="px-8 py-4 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-full text-slate-300 hover:text-white transition-all outline-none cursor-pointer"
            >
              Consult On Formulation
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
