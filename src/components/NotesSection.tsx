import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from './DataContext';
import { Note } from '../types';
import { Notebook, FileDown, Calendar, Search, Filter, UploadCloud, FileText, CheckCircle2, ChevronRight, Eye, Trash2, ArrowLeft, Landmark, FileJson, Plus } from 'lucide-react';
import { viewPdf, downloadPdf } from './pdfHelper';
import ReactMarkdown from 'react-markdown';

export default function NotesSection({ isAdmin = false, setCurrentTab }: { isAdmin?: boolean; setCurrentTab?: (tab: string) => void }) {
  const isAdminLoggedIn = isAdmin || (typeof window !== 'undefined' && sessionStorage.getItem('pg_is_admin_logged_in') === 'true');
  const { notes, setNotes, noteIndexes } = useData();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Handle URL Hash deep linking for Note ID to mimic dedicated pages like /notes/{id}
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#notes-(.+)$/);
      if (match) {
        setSelectedNoteId(match[1]);
      } else if (hash === '#notes-list') {
        setSelectedNoteId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync state to URL hash
  useEffect(() => {
    if (selectedNoteId) {
      window.location.hash = `notes-${selectedNoteId}`;
    } else {
      if (window.location.hash.startsWith('#notes-')) {
        window.location.hash = 'notes-list';
      }
    }
  }, [selectedNoteId]);
  
  const selectedNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Scroll to top on detail page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedNoteId]);

  // Drag & drop states
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                            n.description.toLowerCase().includes(search.toLowerCase());
      
      let matchesType = true;
      if (activeType !== 'All') {
        const typeLower = activeType.toLowerCase();
        if (typeLower === 'pdf' || typeLower === 'txt') {
          matchesType = n.type.toLowerCase() === typeLower;
        } else {
          matchesType = n.title.toLowerCase().includes(typeLower) ||
                        n.description.toLowerCase().includes(typeLower) ||
                        n.type.toLowerCase() === typeLower;
        }
      }
      return matchesSearch && matchesType;
    });
  }, [notes, search, activeType]);

  // Handle PDF download
  const handleDownload = (note: Note) => {
    downloadPdf(note.title, note.type, note.content, note.pdfUrl || note.downloadUrl, note.title);
  };

  // Handle PDF view
  const handleViewPdf = (note: Note) => {
    viewPdf(note.title, note.type, note.content, note.pdfUrl || note.downloadUrl);
  };

  // Drag & drop file handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Read files and add into state
  const handleFiles = (files: FileList) => {
    if (!isAdminLoggedIn) {
      alert("Access Denied: You must be logged in as an administrator to upload PDF notes.");
      return;
    }
    const file = files[0];
    
    // File parameters calculation
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'PDF';

    const reader = new FileReader();
    reader.onload = () => {
      let tempContent = '';
      let tempPdfUrl: string | undefined;

      if (fileExtension === 'PDF') {
        tempPdfUrl = typeof reader.result === 'string' ? reader.result : '';
        tempContent = `# User Uploaded PDF: ${file.name}\n\nOriginal file size: ${sizeInMB} MB. View the pristine uploaded PDF directly.`;
      } else {
        tempContent = typeof reader.result === 'string' ? reader.result : '';
      }

      const newNote: Note = {
        id: `uploaded-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""), // strip extension
        size: `${sizeInMB} MB`,
        type: fileExtension,
        description: `Uploaded file: ${file.name}. Fully indexed in local state.`,
        content: tempContent,
        pdfUrl: tempPdfUrl,
        isUserUploaded: true,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        tags: ['Syllabus', 'Uploaded File', fileExtension]
      };

      setNotes(prev => [newNote, ...prev]);
      
      // Always open the beautifully formatted page first
      setSelectedNoteId(newNote.id);

      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
      }, 4000);
    };

    if (fileExtension === 'PDF') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDeleteUploaded = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdminLoggedIn) {
      alert("Access Denied: You must be logged in as an administrator to delete notes.");
      return;
    }
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
  };

  return (
    <div id="notes-section" className="relative text-white min-h-[95vh] pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <AnimatePresence mode="wait">
        {selectedNote ? (
          <motion.div
            key="note-detail"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="w-full max-w-4xl mx-auto"
          >
            {/* Back Button */}
            <div className="mb-8">
              <button
                onClick={() => setSelectedNoteId(null)}
                className="group px-5 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-950 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition-all text-xs font-mono font-bold tracking-wider cursor-pointer hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] shadow-md"
              >
                <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition-transform" />
                Back to Notes
              </button>
            </div>

            {/* Glowing note reader box */}
            <div className="bg-slate-900/40 border border-amber-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
              {/* Fluoroscent decorative glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-orange-500/5 to-transparent blur-3xl pointer-events-none" />

              {/* 1. Lecture Title / Focus */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-6 leading-tight bg-gradient-to-r from-white via-amber-100 to-orange-400 bg-clip-text text-transparent">
                {selectedNote.title}
              </h1>

              {/* 2. Published Date */}
              {selectedNote.date && (
                <div className="mb-4">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-1">Published Date</span>
                  <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    {selectedNote.date}
                  </span>
                </div>
              )}

              {/* 3. Tags */}
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="mb-6">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-2">Indexed Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 rounded text-xs font-mono bg-slate-950 text-amber-400 border border-amber-950/45">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 4. Short Summary */}
              {selectedNote.description && (
                <div className="mb-6 bg-slate-950/30 p-5 rounded-2xl border border-slate-800/40">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-2">Short Summary</span>
                  <p className="italic text-slate-300 leading-relaxed font-sans">{selectedNote.description}</p>
                </div>
              )}

              {/* 5. Full Content */}
              {selectedNote.content && (
                <div className="bg-slate-950/45 rounded-2xl p-5 sm:p-6 border border-slate-800/60 transition-all mb-8">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block mb-3">Full Lecture Content</span>
                  <div className="markdown-body text-sm text-slate-300 leading-relaxed font-sans prose prose-invert bg-slate-950/20 p-4.5 rounded-xl border border-slate-850 max-w-none">
                    <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* 6. PDF Options */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-widest">
                    PDF Lecture Manuscript Options
                  </span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleViewPdf(selectedNote)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-400 rounded-xl font-mono text-xs font-bold text-amber-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Eye className="w-4 h-4" /> View PDF
                  </button>
                  <button
                    onClick={() => handleDownload(selectedNote)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    <FileDown className="w-4 h-4 text-slate-950" /> Download PDF
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="note-list"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Admin Controls bar */}
            {isAdminLoggedIn && (
              <div className="mb-8 bg-slate-900/50 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fadeIn">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">ADMIN CONTROL PORTAL ACTIVE</span>
                </div>
                <button
                  onClick={() => {
                    if (setCurrentTab) {
                      setCurrentTab('admin');
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-mono text-xs font-black text-slate-950 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-955" /> Manage, Upload, Edit or Delete Notes
                </button>
              </div>
            )}

            {/* Title deck */}
            <div className="flex flex-col items-center text-center gap-2 mb-10">
              <span className="px-3 py-1 text-[11px] font-mono leading-none tracking-widest text-[#f59e0b] uppercase bg-amber-950/40 border border-amber-500/20 rounded-full">
                Academic Resources
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-amber-200 to-[#f59e0b] bg-clip-text text-transparent">
                Student Lecture Guides
              </h2>
              <p className="max-w-2xl text-slate-400 text-xs sm:text-sm leading-relaxed">
                Free academic slide reviews, formulas, and methodologies. Download pre-indexed course archives or upload study guides onto your local browser stack.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Controls & Search */}
              <div className="lg:col-span-4 flex flex-col gap-6 w-full">
                
                {/* Diagnostic filters */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl flex flex-col gap-3 shadow-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800/80 focus:border-amber-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-300 focus:outline-none transition-colors"
                      placeholder="Find equations or formulas..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {(noteIndexes || []).map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveType(t)}
                        className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer shrink-0 ${
                          activeType === t
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                            : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/40'
                        }`}
                      >
                        {t === 'All' ? 'ALL' : (t === 'PDF' || t === 'TXT' ? `${t} FILES` : t.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Note Grid Cards List */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2 px-1">
                  <p className="text-xs font-mono text-slate-400">
                    Syllabus Indexes ({filteredNotes.length})
                  </p>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-900 border border-slate-850 text-slate-500">
                    CLICK CARD TO READ
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      id={`note-row-${note.id}`}
                      onClick={() => handleSelectNote(note)}
                      className="p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[170px]"
                    >
                      <div>
                        {/* 1. Lecture Title / Focus */}
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                          {note.title}
                        </h4>

                        {/* 2. Published Date */}
                        {note.date && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-2 mb-2">
                            <Calendar className="w-3.5 h-3.5 text-amber-500/50" />
                            <span>{note.date}</span>
                          </div>
                        )}

                        {/* 3. Tags */}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2.5">
                            {note.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-900">
                                #{tag}
                              </span>
                            ))}
                            {note.tags.length > 3 && (
                              <span className="text-[9px] font-mono text-slate-400 pt-0.5">+{note.tags.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* 4. Short Summary */}
                        <p className="text-xs text-slate-404 line-clamp-2 leading-relaxed mt-1">
                          {note.description}
                        </p>
                      </div>

                      {/* Footer Info Row */}
                      <div className="pt-3.5 border-t border-slate-800/40 mt-4 flex items-center justify-between">
                        <div>
                          {isAdminLoggedIn && note.isUserUploaded && (
                            <button
                              onClick={(e) => handleDeleteUploaded(note.id, e)}
                              className="w-7 h-7 flex items-center justify-center rounded bg-red-950/20 text-rose-500 hover:bg-rose-900/30 transition-all cursor-pointer border border-transparent hover:border-rose-905/30"
                              title="Delete note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-all">
                          Read Note
                          <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                      </div>

                    </div>
                  ))}

                  {filteredNotes.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-500 text-xs font-mono border border-slate-805 rounded-xl bg-slate-900/10 border-dashed">
                      No matching student study references found nearby.
                    </div>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
