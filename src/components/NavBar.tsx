import { motion } from 'motion/react';
import { Home, Beaker, FileText, Award, Notebook, User, Mail, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavBarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function NavBar({ currentTab, setCurrentTab }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, color: 'from-pink-500 to-rose-500' },
    { id: 'researches', label: 'Researches', icon: Beaker, color: 'from-cyan-400 to-blue-500' },
    { id: 'articles', label: 'Articles', icon: FileText, color: 'from-emerald-400 to-teal-500' },
    { id: 'publications', label: 'Publications', icon: Award, color: 'from-violet-500 to-purple-600' },
    { id: 'notes', label: 'Notes log', icon: Notebook, color: 'from-amber-400 to-orange-500' },
    { id: 'about', label: 'About Us', icon: User, color: 'from-indigo-400 to-blue-600' },
    { id: 'contact', label: 'Contact Us', icon: Mail, color: 'from-fuchsia-400 to-pink-600' }
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileOpen(false);
    // Smooth scroll to top of window when switching pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 py-3 md:py-4 mt-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-slate-900/65 backdrop-blur-xl border border-slate-800/80 shadow-2xl px-5 py-3 md:px-8 rounded-full">
        
        {/* Academic / Brand Signature */}
        <div id="nav-brand" className="cursor-pointer flex items-center gap-2.5 group" onClick={() => handleNavClick('home')}>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/10 group-hover:shadow-pink-500/20 group-hover:scale-105 transition-all duration-300">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-mono font-black text-sm text-cyan-400 group-hover:text-pink-400 transition-colors">
              AS
            </div>
          </div>
          <div>
            <h1 className="text-white text-xs md:text-sm font-bold tracking-wider group-hover:text-cyan-300 transition-colors">
              Dr. Ashwin S. Chouhan
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest hidden sm:block">
              PHARMACOLOGIST / RESEARCHER
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 rounded-full flex items-center gap-1.5 cursor-pointer ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-glow"
                    className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20 blur-sm rounded-full -z-10`}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full -z-20`}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile menu trigger button */}
        <button
          id="mobile-nav-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full bg-slate-800/40 border border-slate-700/30 text-white cursor-pointer"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer (Glassmorphic) */}
      {mobileOpen && (
        <motion.div
          id="mobile-menu-drawer"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-18 left-4 right-4 bg-slate-950/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-3xl overflow-hidden p-4 flex flex-col gap-1 z-50 lg:hidden"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-4 py-3 text-sm font-semibold flex items-center gap-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </header>
  );
}
