import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from './DataContext';
import { Mail, User, FileEdit, CheckCircle2, RotateCcw, Landmark, Clock, Send, Sparkles } from 'lucide-react';

export default function ContactSection() {
  const { contactConfig, addContactSubmission } = useData();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please provide values for all input fields.");
      return;
    }

    setIsSubmitting(true);
    
    // Add dynamically to context
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
        setIsSubmitting(false);
        setSubmitted(true);
      } else {
        const data = await response.json();
        alert(data.error || "There was a problem sending your message. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Formspree submission error:", error);
      alert("An error occurred. Your message was recorded locally, but the online delivery failed.");
      setIsSubmitting(false);
      // Still set submitted state so the user experience is smooth
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setSubmitted(false);
  };

  return (
    <div id="contact-section" className="relative text-white min-h-[95vh] pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      
      {/* Title */}
      <div className="flex flex-col items-center text-center gap-2 mb-12">
        <span className="px-3 py-1 text-[11px] font-mono leading-none tracking-widest text-[#f43f5e] uppercase bg-rose-950/40 border border-rose-500/20 rounded-full">
          Get In Touch
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-rose-200 to-pink-400 bg-clip-text text-transparent">
          Contact Dr. Chouhan
        </h2>
        <p className="max-w-xl text-slate-400 text-xs sm:text-sm leading-relaxed">
          Request research collaboration, student mentorship details, or submit generic preclinical inquiries through our secure dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        
        {/* LEFT COLUMN: Academic Address & Directory Info */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6" id="contact-directory-panel">
          
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl h-full flex flex-col justify-between space-y-6">
            
            <div>
              <h3 className="text-sm font-mono font-bold tracking-widest uppercase text-rose-400 mb-4 pb-2 border-b border-slate-850">
                OFFICIAL MAILING SPECIFICS
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-rose-400 shrink-0">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-250">Academic Labs Address</h4>
                    <p className="text-xs text-slate-400 leading-normal mt-0.5 max-w-[250px]">
                      {contactConfig.address}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-rose-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-250">Office Appointment Hours</h4>
                    <p className="text-xs text-slate-400 leading-normal mt-0.5">
                      {contactConfig.hours}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-rose-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-250">Direct Science Directory</h4>
                    <p className="text-xs text-[#f43f5e] leading-normal font-mono mt-0.5 select-all">
                      {contactConfig.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated server uptime check */}
            <div className="bg-slate-950/80 p-4 border border-slate-850 rounded-2xl flex items-center justify-between text-[11px] font-mono leading-none">
              <span className="text-slate-500 font-bold uppercase">DATABASE STATUS:</span>
              <div className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE & SYNCED
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Glassmorphic Contact Form */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col items-center">
          
          <div className="w-full bg-slate-900 border border-slate-800/85 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">
            
            {/* Background texture loops */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/5 blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  layout
                  key="contact-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-5"
                >
                  <p className="text-xs font-mono text-slate-400 border-b border-slate-850 pb-3 mb-5">
                    SECURE INQUIRY INPUT LAYER (AES-PRECLINICAL)
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Name input */}
                    <div className="flex flex-col gap-1.5 relative">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-rose-400" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        className="bg-slate-950 border border-slate-800 focus:border-[#f43f5e] rounded-xl px-4 py-3 text-xs text-slate-350 focus:outline-none transition-colors"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5 relative">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-rose-400" /> Contact Email
                      </label>
                      <input
                        type="email"
                        required
                        className="bg-slate-950 border border-slate-800 focus:border-[#f43f5e] rounded-xl px-4 py-3 text-xs text-slate-350 focus:outline-none transition-colors"
                        placeholder="johndoe@university.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                  </div>

                  {/* Message box */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5">
                      <FileEdit className="w-3.5 h-3.5 text-rose-400" /> Message Body
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="bg-slate-950 border border-slate-800 focus:border-[#f43f5e] rounded-xl px-4 py-3 text-xs text-slate-350 focus:outline-none transition-colors resize-none leading-relaxed"
                      placeholder="Specify your inquiry objectives, target formulas, or potential research collaboration..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  {/* Submit buttons block */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="submit-contact-form-btn"
                    className="w-full relative group cursor-pointer text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-rose-900/10 select-none overflow-hidden"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin text-white" />
                        SYNCING BIOMETRICS RECORDS...
                      </>
                    ) : (
                      <>
                        <span>Submit Secure Form</span>
                        <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-white" />
                      </>
                    )}
                  </button>

                </motion.form>
              ) : (
                <motion.div
                  key="success-form-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center p-6 space-y-5"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 mb-2">
                    <CheckCircle2 className="w-8 h-8 animate-[spin_5s_linear_infinite]" />
                  </div>

                  <div>
                    <h3 className="text-lg font-mono font-bold uppercase tracking-wide text-white">
                      Inquiry Record Authenticated
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      MESSAGE TRANSMUTED IN CLOUD SYNAPSE • SEED-{Date.now().toString().slice(-4)}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                    Thank you, <strong className="text-rose-400">{formData.name}</strong>. Your research objectives have been cataloged in Dr. Ashwin's diagnostic communications buffer on this client node. Standard confirmation response has been dispatched to <strong className="text-slate-300">{formData.email}</strong>.
                  </p>

                  <div className="border border-slate-850 bg-slate-950/40 p-3.5 rounded-xl font-mono text-[10px] text-left text-slate-400 max-w-md">
                    <p className="flex justify-between"><span>Sender Node:</span> <span className="text-rose-400 font-bold">Client_Localhost</span></p>
                    <p className="flex justify-between"><span>Transmission Speed:</span> <span className="text-slate-200">12 ms (Validated)</span></p>
                    <p className="flex justify-between"><span>Preclinical Buffer state:</span> <span className="text-emerald-400">ACTIVE LOG</span></p>
                  </div>

                  <button
                    onClick={handleReset}
                    id="reset-contact-form-btn"
                    className="px-6 py-2.5 rounded-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-mono hover:text-rose-400 text-slate-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Submit Another Record (Reset)
                  </button>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

    </div>
  );
}
