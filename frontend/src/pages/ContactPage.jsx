import React, { useState, useEffect } from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import { Send, CheckCircle2, Terminal, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const possibleFeeds = [
    "Processing query from Tokyo server...",
    "Document vectorized: enterprise_handbook.pdf",
    "RAG context retrieved successfully (latency: 14ms)",
    "Generating context-aware response for user #4992",
    "Vector cache hit. Routing payload instantly.",
    "Global knowledge graph synchronized.",
    "New workspace document ingestion detected.",
    "System payload processing: 1.4% - All relays operational."
  ];

  const [feed, setFeed] = useState([
    "Initializing global support AI node...",
    "Connection verified. Subsystems online.",
    "Awaiting incoming user queries."
  ]);

  // Handle fake live terminal feed
  useEffect(() => {
    const container = document.getElementById("landing-scroll-container");
    if (container) container.scrollTo(0, 0);

    let idx = 0;
    const interval = setInterval(() => {
      const nextLine = possibleFeeds[Math.floor(Math.random() * possibleFeeds.length)];
      setFeed(prev => {
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newFeed = [...prev, `[${timeStr}] SYSTEM: ${nextLine}`];
        if (newFeed.length > 8) return newFeed.slice(newFeed.length - 8);
        return newFeed;
      });
      idx++;
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Connect to the newly built backend route map
      const res = await fetch(`${import.meta.env.VITE_API_URL || "https://patient-comfort-production-9aee.up.railway.app"}/api/contact/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        // After 4 sec, let them send another if they want
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || "Failed to route message through node.");
      }
    } catch (err) {
      setError("Global server timeout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="landing-scroll-container"
      className="bg-[#0B0C10] w-full h-screen overflow-y-auto overflow-x-hidden selection:bg-brand selection:text-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <LandingNavbar />

      <section className="w-full pt-40 pb-24 relative z-10 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 w-full">

          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight leading-[1.1] mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl font-light">
              Whether you need enterprise configuration, API quota increases, or just have a general inquiry, our team is always online.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

            {/* LEFT: THE FORM */}
            <div className="lg:col-span-5 flex flex-col">

              {success ? (
                <div className="w-full h-full min-h-[400px] border border-green-500/20 bg-green-500/[0.02] p-8 rounded-[2px] flex flex-col items-center justify-center text-center animate-fade-in-up">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Transmission Received</h3>
                  <p className="text-gray-400 font-light">
                    Your logic map has been ingested. Our support engineers will sync with you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {error && (
                    <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-[2px] flex items-start gap-3 text-red-400 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-white text-sm font-medium tracking-wide">Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-[#050505] border border-white/10 rounded-[2px] px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6C63FF] transition-colors font-light"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-white text-sm font-medium tracking-wide">Email</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-[#050505] border border-white/10 rounded-[2px] px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6C63FF] transition-colors font-light"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-medium tracking-wide">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-[#050505] border border-white/10 rounded-[2px] px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6C63FF] transition-colors font-light"
                      placeholder="Enterprise Integration Inquiry"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-medium tracking-wide">Message</label>
                    <textarea
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full bg-[#050505] border border-white/10 rounded-[2px] px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6C63FF] transition-colors font-light resize-none"
                      placeholder="How can we help optimize your workflow?"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative overflow-hidden rounded-[2px] w-full py-4 font-semibold border border-white/30 text-white transition-all duration-300 bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    <span className="absolute inset-0 w-0 bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
                    <span className="relative z-10 group-hover:text-black transition-colors duration-300 flex items-center justify-center gap-2">
                      {isSubmitting ? "Transmitting..." : "Send Message"}
                      {!isSubmitting && <Send className="w-4 h-4 ml-1 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                    </span>
                  </button>
                </form>
              )}

            </div>

            {/* RIGHT: LIVE FEED ANIMATION */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[400px]">

              <div className="w-full h-full border border-white/10 bg-[#050505] rounded-[2px] shadow-2xl flex flex-col overflow-hidden relative group">

                {/* Simulated Glass/Glare */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6C63FF]/[0.02] blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                {/* Header */}
                <div className="h-12 border-b border-white/10 bg-[#0A0A0A] flex items-center justify-between px-6 border-t-[1px] border-t-white/5">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400 font-mono text-xs tracking-widest uppercase">ChatRAG Global Network Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-green-500 font-mono text-xs tracking-widest uppercase">Live</span>
                  </div>
                </div>

                {/* Terminal Window */}
                <div className="flex-1 p-6 font-mono text-sm leading-8 flex flex-col justify-end relative z-10">
                  <div className="flex flex-col gap-2">
                    {feed.map((line, idx) => (
                      <div key={idx} className="flex items-start text-gray-500 animate-fade-in-up" style={{ animationDuration: '400ms' }}>
                        <span className="text-green-400/80 mr-3 opacity-70">➔</span>
                        <span className={`${idx === feed.length - 1 ? 'text-gray-300' : 'text-gray-600'}`}>{line}</span>
                      </div>
                    ))}
                    {/* Blinking Cursor */}
                    <div className="flex items-center mt-2">
                      <span className="text-green-400/80 mr-3 opacity-70">➔</span>
                      <span className="w-2 h-4 bg-[#6C63FF]/70 animate-pulse"></span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <LandingFooter hideCTA={true} />
    </div>
  );
}
