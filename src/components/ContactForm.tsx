import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePortfolio } from "../context/PortfolioContext";
import { 
  Check, 
  Send, 
  ArrowRight, 
  AtSign, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Asterisk,
  Compass
} from "lucide-react";

interface FormFields {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_FIELDS: FormFields = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactForm() {
  const { profile } = usePortfolio();
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
  const [errors, setErrors] = useState<Partial<FormFields>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Simple, rigorous client-side validator
  const validate = (): boolean => {
    const tempErrors: Partial<FormFields> = {};
    if (!fields.name.trim()) tempErrors.name = "Full name is required.";
    
    if (!fields.email.trim()) {
      tempErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      tempErrors.email = "Please specify a valid email format.";
    }
    
    if (!fields.subject.trim()) tempErrors.subject = "Subject line is required.";
    if (!fields.message.trim()) tempErrors.message = "Message body cannot be empty.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 1. Save to backend portfolio DB in real-time
      const response = await fetch("/api/submissions/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields)
      });

      if (!response.ok) {
        throw new Error("Failed to post submission to server.");
      }

      // 2. Fallback / Client backup log to client-side localStorage
      try {
        const existingMessages = JSON.parse(localStorage.getItem("hanzo-contact-logs") || "[]");
        const submission = {
          ...fields,
          timestamp: new Date().toISOString(),
          id: Math.random().toString(36).substring(2, 9),
        };
        localStorage.setItem("hanzo-contact-logs", JSON.stringify([...existingMessages, submission]));
      } catch (localErr) {
        console.error("Local storage sync error:", localErr);
      }

      setIsSuccess(true);
      setFields(INITIAL_FIELDS);
    } catch (err) {
      console.error("Transmission server error:", err);
      // Fallback local-only submission on network timeout
      try {
        const existingMessages = JSON.parse(localStorage.getItem("hanzo-contact-logs") || "[]");
        const submission = {
          ...fields,
          timestamp: new Date().toISOString(),
          id: Math.random().toString(36).substring(2, 9),
        };
        localStorage.setItem("hanzo-contact-logs", JSON.stringify([...existingMessages, submission]));
        setIsSuccess(true);
        setFields(INITIAL_FIELDS);
      } catch (nestedErr) {
        console.error("Fully offline backup write failure:", nestedErr);
      }
    } finally {
      setIsSubmitting(false);
      // Reset success status and form show state after some seconds
      setTimeout(() => {
        setIsSuccess(false);
        setShowForm(false);
      }, 5000);
    }
  };

  const gmailComposeUrl = profile.emailAddress 
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${profile.emailAddress}`
    : "https://mail.google.com/mail/?view=cm&fs=1&to=faizy2k2001@gmail.com";

  return (
    <div id="connect-container" className="relative w-full rounded-3xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] p-8 sm:p-12 lg:p-16 text-center select-none shadow-xl transition-all duration-500">
      
      {/* 1. Diagonal spotlight flare overlay matching the reference image */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(134,134,139,0.06),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_40%_10%,transparent_35%,rgba(0,0,0,0.03)_60%,rgba(0,0,0,0.08)_100%)] dark:bg-[radial-gradient(120%_120%_at_40%_10%,transparent_35%,rgba(255,255,255,0.01)_60%,rgba(255,255,255,0.03)_100%)] pointer-events-none" />

      {/* 3. Center Section: Header, Description & Expandable Action */}
      <div className="relative z-10 max-w-2xl mx-auto space-y-8 pb-10 pt-6">

        {/* Dynamic Typography Let's Connect Heading */}
        <h2 className="text-5xl sm:text-7xl lg:text-8xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white leading-[1.05]">
          Let's Connect
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-sans font-light max-w-lg mx-auto leading-relaxed pb-2">
          Feel free to contact me if having any questions. I'm available for new projects or just for chatting.
        </p>

        {/* Contact Credentials Display with elegant hover scale and border colors */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-1">
          {profile.mobileNumber && (
            <a
              href={`tel:${profile.mobileNumber}`}
              className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-200 hover:text-primary dark:hover:text-primary hover:border-primary/40 hover:scale-[1.04] transition-all flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-850 shadow-sm clickable"
              title="Call directly"
            >
              <span className="text-sm">📞</span>
              <span className="tracking-tight font-mono">{profile.mobileNumber}</span>
            </a>
          )}
          {profile.emailAddress && (
            <a
              href={`mailto:${profile.emailAddress}`}
              className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-200 hover:text-primary dark:hover:text-primary hover:border-primary/40 hover:scale-[1.04] transition-all flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-850 shadow-sm clickable"
              title="Navigate to email client"
            >
              <span className="text-sm">✉️</span>
              <span className="tracking-tight font-mono">{profile.emailAddress}</span>
            </a>
          )}
        </div>

        {/* Book Intro Call Trigger */}
        <div className="pt-4">
          <button
            id="book-intro-call-button"
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 rounded-full text-xs font-mono font-bold tracking-widest uppercase inline-flex items-center gap-3.5 shadow-md hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer clickable"
          >
            {showForm ? "DISMISS FORM" : "Book a free intro call"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4. Expandable Form Container */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="overflow-hidden pt-6"
            >
              <div className="border-t border-zinc-200/50 dark:border-zinc-800/80 pt-8 mt-4 text-left max-w-xl mx-auto">
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center py-8 space-y-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce">
                        <Check className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-zinc-900 dark:text-white">
                        Transmission Logged!
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm font-sans font-light leading-relaxed">
                        Your direct message was saved. Hanzo will reply within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="contact-form-inner"
                      onSubmit={handleSubmit}
                      className="space-y-4"
                      noValidate
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 uppercase font-bold">NAME</label>
                          <input
                            name="name"
                            type="text"
                            value={fields.name}
                            onChange={handleChange}
                            placeholder="Your Name"
                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
                          />
                          {errors.name && <p className="text-[10px] text-red-500 font-mono">{errors.name}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 uppercase font-bold">EMAIL</label>
                          <input
                            name="email"
                            type="email"
                            value={fields.email}
                            onChange={handleChange}
                            placeholder="name@agency.com"
                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
                          />
                          {errors.email && <p className="text-[10px] text-red-500 font-mono">{errors.email}</p>}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 uppercase font-bold">SUBJECT</label>
                        <input
                          name="subject"
                          type="text"
                          value={fields.subject}
                          onChange={handleChange}
                          placeholder="Project Scope / Scale"
                          className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
                        />
                        {errors.subject && <p className="text-[10px] text-red-500 font-mono">{errors.subject}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 uppercase font-bold">MESSAGE</label>
                        <textarea
                          name="message"
                          rows={3}
                          value={fields.message}
                          onChange={handleChange}
                          placeholder="Let's build something exceptional..."
                          className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-primary transition-all resize-none text-zinc-800 dark:text-zinc-100"
                        />
                        {errors.message && <p className="text-[10px] text-red-500 font-mono">{errors.message}</p>}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 disabled:opacity-50 rounded-xl text-[10px] font-mono font-bold tracking-widest uppercase inline-flex items-center justify-center gap-2 shadow-sm transition-all clickable"
                        >
                          {isSubmitting ? "TRANSMITTING..." : "SUBMIT RESPONSE"} <Send className="w-3.5 h-3.5" />
                        </button>
                        
                        <a
                          href={gmailComposeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-mono font-bold tracking-widest uppercase inline-flex items-center justify-center gap-2 transition-all"
                        >
                          GMAIL DIRECT
                        </a>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Bottom Navigation & Branding exactly like reference image */}
      <div className="relative z-10 border-t border-zinc-200/40 dark:border-zinc-800/60 pt-10 mt-12 flex flex-col sm:flex-row justify-between items-center gap-6">
        {/* Left trademark banner styled with standard outline & Admin entry gate */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            © Hanzo Studio, {new Date().getFullYear()}
          </div>
          <a
            href="#/admin"
            className="px-4 py-2 border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-primary rounded-lg text-[10px] font-mono text-zinc-400 dark:text-zinc-500 hover:text-primary uppercase tracking-widest transition-colors clickable"
          >
            Admin Panel ⚙️
          </a>
        </div>

        {/* Right Action Icons & Emblem */}
        <div className="flex items-center gap-4">
          {[
            { url: gmailComposeUrl, icon: <AtSign className="w-4 h-4" />, label: "Email" },
            { url: "https://twitter.com", icon: <Twitter className="w-4 h-4" />, label: "Twitter" },
            { url: "https://linkedin.com", icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn" },
            { url: "https://instagram.com", icon: <Instagram className="w-4 h-4" />, label: "Instagram" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 hover:text-primary dark:hover:text-primary hover:border-primary/20 flex items-center justify-center transition-all clickable"
              aria-label={item.label}
            >
              {item.icon}
            </a>
          ))}

          {/* Luxury Asterisk Star Icon */}
          <div className="w-10 h-10 rounded-full bg-orange-300 dark:bg-[#f39c12]/20 text-zinc-950 dark:text-[#f39c12] flex items-center justify-center font-bold">
            <Asterisk className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
          </div>
        </div>
      </div>

    </div>
  );
}
