import React from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowUp, Linkedin, Youtube, Presentation, Twitter, Github, Facebook, Globe, Link as LinkIcon } from 'lucide-react';
import { useData } from './DataContext';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  youtube: Youtube,
  slideshare: Presentation,
  email: Mail,
  twitter: Twitter,
  github: Github,
  facebook: Facebook,
  globe: Globe,
  default: LinkIcon
};

const colorMap: Record<string, string> = {
  linkedin: 'hover:text-blue-400 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] text-slate-300',
  youtube: 'hover:text-red-500 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.6)] text-slate-300',
  slideshare: 'hover:text-cyan-400 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] text-slate-300',
  email: 'hover:text-emerald-400 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.6)] text-slate-300',
  twitter: 'hover:text-sky-400 hover:border-sky-500/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] text-slate-300',
  github: 'hover:text-purple-400 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.6)] text-slate-300',
  facebook: 'hover:text-indigo-400 hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.6)] text-slate-300',
  globe: 'hover:text-pink-400 hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.6)] text-slate-300',
  default: 'hover:text-amber-400 hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.6)] text-slate-300',
};

export default function Footer({ setCurrentTab }: FooterProps) {
  const { footerConfig } = useData();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickLink = (tabId: string) => {
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { id: 'home', label: 'Home' },
    { id: 'researches', label: 'Researches' },
    { id: 'articles', label: 'Articles' },
    { id: 'publications', label: 'Publications' },
    { id: 'notes', label: 'Notes' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const socialLinks = (footerConfig.socialLinks || []).map((link) => {
    const rawUrl = link.url;
    let url = rawUrl;
    if (link.iconType === 'email') {
      url = rawUrl.startsWith('mailto:') ? rawUrl : `mailto:${rawUrl}`;
    } else {
      url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    }
    const key = (link.iconType || '').toLowerCase();
    const IconComponent = iconMap[key] || iconMap.default;
    const hoverColorClass = colorMap[key] || colorMap.default;

    return {
      icon: IconComponent,
      url,
      label: link.platform,
      color: hoverColorClass
    };
  });

  return (
    <footer className="relative z-10 w-full mt-24 border-t border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-black overflow-hidden pt-16 pb-8">
      {/* Dynamic colorful blur halos behind footer content */}
      <div className="absolute -top-10 left-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-80 h-80 rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/2 left-1/3 w-72 h-72 rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      {/* Decorative neon line on top edge */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-60" />

      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
          
          {/* Left Column: Short bio + Logo */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleQuickLink('home')}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/10 group-hover:shadow-cyan-400/30 transition-all duration-300">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-mono font-black text-sm text-cyan-400 group-hover:text-cyan-300">
                  AS
                </div>
              </div>
              <div>
                <h4 className="text-white font-black tracking-wider text-base">
                  Dr. Ashwin S. Chouhan
                </h4>
                <p className="text-[10px] text-slate-400 font-mono tracking-widest">
                  PHARMACOLOGIST & RESEARCHER
                </p>
              </div>
            </div>

            {footerConfig.tagline && (
              <p className="text-slate-400 text-sm leading-relaxed mt-2 whitespace-pre-line">
                {footerConfig.tagline}
              </p>
            )}
          </div>

          {/* Center Column: Quick Navigation Links */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h5 className="text-white text-xs font-bold uppercase tracking-widest border-b border-slate-800/80 pb-2">
              Quick Navigation
            </h5>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-400">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleQuickLink(link.id)}
                    className="hover:text-cyan-400 transition-colors py-1 cursor-pointer flex items-center gap-1.5 focus:outline-none focus:text-cyan-300 text-left"
                  >
                    <span className="w-1 h-1 rounded-full bg-cyan-500/50" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Contact & Social Handles */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h5 className="text-white text-xs font-bold uppercase tracking-widest border-b border-slate-800/80 pb-2">
              Get in Touch
            </h5>
            
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              {footerConfig.email && (
                <a 
                  href={`mailto:${footerConfig.email}`} 
                  className="flex items-center gap-2.5 hover:text-cyan-400 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-800/60 flex items-center justify-center text-cyan-400 border border-slate-700/30">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate select-all">{footerConfig.email}</span>
                </a>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      title={social.label}
                      className={`w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 transition-all duration-300 shadow hover:border-slate-500 hover:-translate-y-1 ${social.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Divider */}
        <hr className="my-10 border-slate-800/60" />

        {/* Bottom Strip with scroll to top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {footerConfig.copyright ? (
            <p className="text-slate-500 text-xs text-center sm:text-left font-mono">
              {footerConfig.copyright}
            </p>
          ) : (
            <div />
          )}

          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 font-bold flex items-center justify-center text-white cursor-pointer shadow-lg hover:shadow-purple-500/30 transition-all duration-300 focus:outline-none"
            aria-label="Scroll back to top"
          >
            <ArrowUp className="w-4 h-4 animate-bounce" />
          </motion.button>
        </div>

      </div>
    </footer>
  );
}
