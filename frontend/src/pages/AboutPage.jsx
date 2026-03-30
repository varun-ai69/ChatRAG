import React, { useEffect } from "react";
import LandingNavbar from "../components/LandingNavbar";
import { Check, Upload, Cpu, MessageSquare, Zap, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LandingFooter from "../components/LandingFooter";

export default function AboutPage() {
  const navigate = useNavigate();

  // Ensure the container scrolls to the top when the page mounts
  useEffect(() => {
    const container = document.getElementById("landing-scroll-container");
    if (container) {
      container.scrollTo(0, 0);
    }
  }, []);

  const features = [
    { title: "Built on your data", desc: "No generic answers, only responses from your documents." },
    { title: "Context-aware", desc: "Understands queries and retrieves relevant information." },
    { title: "Always available", desc: "Provide 24/7 support without scaling your team." },
    { title: "Easy to integrate", desc: "Add to any website globally with a simple embedded script." },
    { title: "Designed for scale", desc: "Handle thousands of live conversations effortlessly." }
  ];

  const steps = [
    { num: "01", title: "Upload your documents", icon: <Upload className="w-5 h-5 text-[#6C63FF]" /> },
    { num: "02", title: "ChatRAG processes and understands your data", icon: <Cpu className="w-5 h-5 text-[#6C63FF]" /> },
    { num: "03", title: "Users ask questions through your website", icon: <MessageSquare className="w-5 h-5 text-[#6C63FF]" /> },
    { num: "04", title: "ChatRAG retrieves relevant info and generates accurate answers", icon: <Zap className="w-5 h-5 text-[#6C63FF]" /> },
  ];

  return (
    <div 
      id="landing-scroll-container" 
      className="bg-[#0B0C10] w-full h-screen overflow-y-auto overflow-x-hidden selection:bg-brand selection:text-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <LandingNavbar />

      {/* 1. HERO SECTION */}
      <section className="w-full pt-48 pb-20 lg:pt-56 lg:pb-28 relative z-10 flex flex-col items-center text-center px-6">
        <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight leading-[1.1] mb-6">
          About ChatRAG
        </h1>
        <p className="text-2xl md:text-3xl text-gray-300 font-medium tracking-tight mb-4 max-w-3xl">
          Built to turn your data into intelligent customer support.
        </p>
        <p className="text-lg text-gray-500 max-w-2xl">
          A smarter way to handle support — powered entirely by your own knowledge.
        </p>
      </section>

      {/* 2. CORE DESCRIPTION & FEATURES */}
      <section className="w-full py-24 bg-[#050505] border-t border-white/5 relative z-10">
        <div className="max-w-3xl mx-auto px-6 flex flex-col gap-8">
          
          <div className="flex flex-col gap-6 text-xl text-gray-300 leading-relaxed font-light mb-8">
            <span className="text-gray-500 font-bold tracking-[0.2em] text-sm uppercase mb-2 block">The Concept</span>
            <p className="text-2xl text-white font-medium mb-2">
              ChatRAG is built to transform how businesses handle customer support.
            </p>
            <p>
              Instead of relying on static FAQs or repetitive manual responses, ChatRAG turns your existing documents into a smart, context-aware AI assistant. Every answer is grounded in your actual data — not guesses.
            </p>
            <p>
              Whether it’s policies, product guides, or internal knowledge bases, ChatRAG understands your content and delivers accurate, instant responses to your users — 24/7.
            </p>
          </div>

          <div className="w-full border-t border-white/10 mb-2"></div>
          <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">Why ChatRAG?</h3>

          <ul className="flex flex-col gap-4">
            {features.map((item, idx) => (
              <li key={idx} className="flex items-start gap-4 p-5 border border-white/10 bg-[#0B0C10] rounded-[2px]">
                <div className="flex items-center justify-center w-6 h-6 rounded-[2px] bg-white/5 border border-white/10 mt-1 flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <div className="text-gray-300 leading-relaxed">
                  <span className="text-white font-semibold mr-2">{item.title}</span> 
                  <span className="text-gray-400">— {item.desc}</span>
                </div>
              </li>
            ))}
          </ul>

        </div>
      </section>

      {/* 4. HOW IT WORKS (NEW) */}
      <section className="w-full py-28 bg-[#050505] relative z-10 border-t border-white/5 overflow-hidden">
        
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#6C63FF]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">
              How ChatRAG Works
            </h2>
            <p className="text-xl text-gray-400">
              Four simple steps from raw data to intelligent support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative p-6 border border-white/10 bg-[#0A0A0A] rounded-[2px] hover:border-white/20 transition-colors">
                <div className="absolute -top-3 -right-3 text-6xl font-black text-white/[0.03] select-none pointer-events-none">{step.num}</div>
                <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <p className="text-white font-medium text-lg leading-snug">
                  {step.title}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center max-w-2xl mx-auto">
            <p className="text-xl text-gray-400 font-medium">
              <span className="text-white">No training complexity. No manual setup.</span><br/>
              Just your data, working for you.
            </p>
          </div>
        </div>
      </section>

      {/* 5 & 6. MISSION AND CLOSING STATEMENT */}
      <section className="w-full py-32 bg-[#0B0C10] border-t border-white/5 relative z-10 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          
          <span className="text-[#6C63FF] font-bold tracking-[0.2em] text-sm uppercase mb-6">Our Mission</span>
          <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight leading-tight mb-20 text-balance">
            To build AI that is reliable, grounded, and genuinely useful — enabling businesses to scale support without compromising accuracy or trust.
          </h2>
          
          <div className="w-full max-w-lg border-t border-white/10 mb-20"></div>

          <div className="flex flex-col items-center justify-center space-y-6">
            <p className="text-gray-400 text-2xl font-medium tracking-tight">
              ChatRAG isn’t just another chatbot.
            </p>
            <p className="text-white text-3xl md:text-4xl font-semibold tracking-tight leading-snug max-w-2xl text-balance">
              It’s your knowledge — intelligently delivered, instantly accessible, and built to scale with your business.
            </p>
          </div>

        </div>
      </section>

      {/* 7. OPTIONAL CTA */}
      <section className="w-full py-24 bg-[#050505] border-t border-white/5 relative z-10 text-center">
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-10">
            Start building your AI support in minutes
          </h2>
          
          <button
            onClick={() => navigate("/signup")}
            className="group relative overflow-hidden rounded-[2px] px-10 py-4 font-semibold border border-white/30 text-white transition-all duration-300 bg-white/5"
          >
            <span className="absolute inset-0 w-0 bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
            <span className="relative z-10 group-hover:text-black transition-colors duration-300 flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </section>
      
      <LandingFooter hideCTA={true} />
    </div>
  );
}
