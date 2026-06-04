import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ThreeDParticleCanvas from './components/ThreeDParticleCanvas';
import NavBar from './components/NavBar';
import HomeSection from './components/HomeSection';
import ResearchSection from './components/ResearchSection';
import ArticleSection from './components/ArticleSection';
import PublicationSection from './components/PublicationSection';
import NotesSection from './components/NotesSection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import { DataProvider, useData } from './components/DataContext';
import { Lock, User, KeyRound, CheckCircle2, ShieldAlert, X, Eye, EyeOff } from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('home');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('pg_is_admin_logged_in') === 'true';
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'PHARMACYGUIDE' && loginPassword === 'Ashwin@pharmtech') {
      setLoginSuccess(true);
      setLoginError('');
      setTimeout(() => {
        setIsAdminLoggedIn(true);
        sessionStorage.setItem('pg_is_admin_logged_in', 'true');
        setShowLoginModal(false);
        setLoginSuccess(false);
        setLoginUsername('');
        setLoginPassword('');
        setCurrentTab('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1200);
    } else {
      setLoginError('Invalid ID or Password credentials.');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('pg_is_admin_logged_in');
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderSection = () => {
    if (currentTab === 'admin') {
      if (isAdminLoggedIn) {
        return <AdminDashboard onLogout={handleLogout} setCurrentTab={setCurrentTab} />;
      } else {
        setCurrentTab('home');
      }
    }

    switch (currentTab) {
      case 'home':
        return <HomeSection setCurrentTab={setCurrentTab} />;
      case 'researches':
        return <ResearchSection isAdmin={isAdminLoggedIn} setCurrentTab={setCurrentTab} />;
      case 'articles':
        return <ArticleSection isAdmin={isAdminLoggedIn} setCurrentTab={setCurrentTab} />;
      case 'publications':
        return <PublicationSection isAdmin={isAdminLoggedIn} setCurrentTab={setCurrentTab} />;
      case 'notes':
        return <NotesSection isAdmin={isAdminLoggedIn} setCurrentTab={setCurrentTab} />;
      case 'about':
        return <AboutSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return <HomeSection setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080a12] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-300 font-sans overflow-x-hidden">
      
      {/* 1. Global Colorful 3D Floating Particle Network Background */}
      <ThreeDParticleCanvas />

      {/* 2. Glassmorphic Navigation Bar */}
      {currentTab !== 'admin' && (
        <NavBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}

      {/* 3. High-End 3D Animated Section Deck */}
      <main className={`relative z-10 w-full min-h-screen ${currentTab === 'admin' ? 'py-4' : 'py-10'}`}>
        
        <div 
          className="w-full h-full"
          style={{ perspective: '1500px', transformStyle: 'preserve-3d' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ 
                opacity: 0, 
                rotateY: 22, 
                scale: 0.94,
                translateZ: -120,
              }}
              animate={{ 
                opacity: 1, 
                rotateY: 0, 
                scale: 1,
                translateZ: 0,
              }}
              exit={{ 
                opacity: 0, 
                rotateY: -22, 
                scale: 0.94,
                translateZ: -120,
              }}
              transition={{ 
                duration: 0.5, 
                ease: [0.25, 1, 0.5, 1] 
              }}
              className="w-full h-full"
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* 4. Rich Elegant Interactive Footer */}
      {currentTab !== 'admin' && (
        <Footer setCurrentTab={setCurrentTab} />
      )}

      {/* 5. Hidden Admin Login Hover Zone at the absolute bottom-right corner */}
      {currentTab !== 'admin' && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-12 h-12 bg-transparent hover:bg-slate-900/40 rounded-full group transition-all duration-300">
          <button
            id="hidden-admin-login-trigger"
            onClick={() => {
              if (isAdminLoggedIn) {
                setCurrentTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setShowLoginModal(true);
              }
            }}
            className="opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 w-8 h-8 rounded-full bg-slate-100/10 hover:bg-slate-950 border border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 flex items-center justify-center cursor-pointer shadow-xl shadow-cyan-500/15 pointer-events-auto"
            title="System Login"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Admin Login Portal Modal overlay */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 overflow-hidden shadow-2xl relative"
            >
              {/* Halos */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 blur-[60px] pointer-events-none" />

              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-5 relative z-10">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-pink-500 animate-pulse" /> Secure Gate Login
                </span>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 text-slate-500 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {!loginSuccess ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
                  <p className="text-[10px] text-slate-400 font-mono text-center">
                    ENTER AUTHORIZED SYSTEM TOKENS
                  </p>

                  <div className="flex flex-col gap-1.55">
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-cyan-400" /> Executive ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Username ID"
                      className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.55">
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-cyan-400" /> Access Password
                    </label>
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••••"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-550 hover:text-cyan-400 transition-all duration-200 cursor-pointer focus:outline-none hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] active:scale-90"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <p className="text-[10px] font-mono text-center text-rose-500 font-bold bg-rose-950/20 border border-rose-500/10 rounded py-1 max-w-full">
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full text-xs font-bold font-mono tracking-widest uppercase py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white cursor-pointer shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    Authenticate Token
                  </button>
                </form>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 z-10 relative animate-fadeIn">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                  <h4 className="text-sm font-mono font-black text-white">ACCESS GRANTED</h4>
                  <p className="text-[10px] text-slate-400 font-mono">LOADING PHARMACOLOGIST PORTAL...</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
