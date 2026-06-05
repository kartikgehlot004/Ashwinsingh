import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from './DataContext';
import { TimelineMilestone } from '../types';
import { GraduationCap, Award, Microscope, BookOpen, Quote, ShieldAlert, ArrowDown } from 'lucide-react';

export default function AboutSection() {
  const { timeline, aboutConfig } = useData();
  const [selectedMilestoneState, setSelectedMilestoneState] = useState<TimelineMilestone | null>(null);

  const selectedMilestone = selectedMilestoneState || timeline[0];
  const setSelectedMilestone = (mile: TimelineMilestone | null) => setSelectedMilestoneState(mile);

  useEffect(() => {
    if (sessionStorage.getItem('scroll_to_milestones') === 'true') {
      sessionStorage.removeItem('scroll_to_milestones');
      setTimeout(() => {
        const el = document.getElementById('roadmap-timeline-scroller') || document.getElementById('about-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 600);
    }
  }, []);

  // Achievement type color mappings
  const typeIcons = {
    education: { icon: GraduationCap, bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30' },
    research: { icon: Microscope, bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    award: { icon: Award, bg: 'bg-pink-500', text: 'text-pink-400', border: 'border-pink-500/30' },
    publication: { icon: BookOpen, bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' }
  };

  return (
    <div id="about-section" className="relative text-white min-h-[95vh] pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      
      {/* Page Title */}
      <div className="flex flex-col items-center text-center gap-2 mb-12">
        <span className="px-3 py-1 text-[11px] font-mono leading-none tracking-widest text-[#6366f1] uppercase bg-indigo-950/40 border border-indigo-500/20 rounded-full">
          Academic Roadmap
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-indigo-200 to-blue-400 bg-clip-text text-transparent">
          About Dr. Ashwin Chouhan
        </h2>
        <p className="max-w-xl text-slate-400 text-xs sm:text-sm leading-relaxed">
          Ph.D. in Pharmacology with extensive experience in liposomal drug vectors, synergistic natural compounds, and preclinical studies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: Executive Biography */}
        <div className="lg:col-span-6 flex flex-col gap-6" id="personal-biography">
          
          <div className="bg-slate-900/40 border border-slate-800/80 p-5 md:p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl pointer-events-none" />
            
            <h3 className="text-base font-extrabold text-white mb-3 flex items-center gap-2 border-b border-slate-800/65 pb-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              Professional Background
            </h3>
            
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 mb-4 font-medium">
              {aboutConfig.bioParagraph1}
            </p>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
              {aboutConfig.bioParagraph2}
            </p>
          </div>

          {/* Core teaching quote card */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/10 to-slate-900 border border-indigo-500/20 p-5 rounded-2xl relative">
            <Quote className="absolute top-4 right-4 w-10 h-10 text-indigo-500/10" />
            <p className="text-xs sm:text-sm leading-relaxed text-indigo-200 italic font-medium pt-1">
              "{aboutConfig.quote}"
            </p>
            <span className="block mt-2.5 text-xs font-mono font-bold text-indigo-300">
              — {aboutConfig.quoteAuthor}
            </span>
          </div>

          {/* Active spotlight details */}
          <AnimatePresence mode="wait">
            {selectedMilestone && (
              <motion.div
                id="selected-road-node"
                key={selectedMilestone.year}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${typeIcons[selectedMilestone.achievementType].bg} text-slate-950`}>
                    {selectedMilestone.year} Node
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                    {selectedMilestone.achievementType} Detail
                  </span>
                </div>
                
                <h4 className="text-sm font-extrabold text-white">
                  {selectedMilestone.title}
                </h4>
                
                <p className="text-xs text-indigo-300 font-medium font-mono mt-0.5">
                  Institution: {selectedMilestone.institution}
                </p>
                
                <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                  {selectedMilestone.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* RIGHT COLUMN: Interactive Timeline Progress */}
        <div className="lg:col-span-6 w-full flex flex-col gap-5 bg-slate-900/20 border border-slate-800/80 p-5 rounded-3xl" id="roadmap-timeline-scroller">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3 px-1">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5">
              <ArrowDown className="w-3.5 h-3.5 text-indigo-400 animate-bounce" /> Click nodes to details
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase">
              Chronological ordering
            </span>
          </div>

          <div className="relative pl-6 md:pl-8 border-l border-slate-800 space-y-7 my-2">
            
            {timeline.map((mile) => {
              const isSelected = selectedMilestone?.year === mile.year;
              const { icon: Icon, bg, text, border } = typeIcons[mile.achievementType];
              
              return (
                <div
                  key={mile.year}
                  onClick={() => setSelectedMilestone(mile)}
                  className={`relative group cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
                    isSelected 
                      ? 'bg-slate-900 border-indigo-500/35 shadow-lg max-w-full' 
                      : 'bg-slate-950/40 border-slate-900 hover:bg-slate-900/40 hover:border-slate-800'
                  }`}
                >
                  
                  {/* Floating Left Circle Timeline Node */}
                  <div className={`absolute -left-10 md:-left-12.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 ${
                    isSelected ? 'border-indigo-400 scale-110' : 'border-slate-800 scale-100 group-hover:border-slate-650'
                  } bg-slate-950 flex items-center justify-center p-1.5 transition-all z-10`}>
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? text : 'text-slate-500 group-hover:text-slate-300'}`} />
                  </div>

                  {/* Pulsing state background for active indicators */}
                  {isSelected && (
                    <div className="absolute -left-11.5 md:-left-14 top-1/2 -translate-y-1/2 w-11 h-11 bg-indigo-500/5 blur-sm rounded-full pointer-events-none -z-10" />
                  )}

                  {/* Node Title & Year */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider w-fit ${border} ${text}`}>
                      {mile.year} • {mile.achievementType}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono truncate max-w-[200px]">
                      {mile.institution}
                    </span>
                  </div>

                  <h3 className={`text-xs font-bold leading-snug transition-colors ${
                    isSelected ? 'text-white font-black' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {mile.title}
                  </h3>

                </div>
              );
            })}

          </div>
        </div>

      </div>

    </div>
  );
}
