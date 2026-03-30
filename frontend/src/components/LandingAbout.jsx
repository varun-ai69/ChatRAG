import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

export default function LandingAbout() {
  const navigate = useNavigate();
  const [chatStep, setChatStep] = useState(0);

  useEffect(() => {
    let t1, t2, t3, t4;
    
    if (chatStep === 0) {
      t1 = setTimeout(() => setChatStep(1), 800);
    } else if (chatStep === 1) {
      t2 = setTimeout(() => setChatStep(2), 800);
    } else if (chatStep === 2) {
      t3 = setTimeout(() => setChatStep(3), 1800);
    } else if (chatStep === 3) {
      t4 = setTimeout(() => setChatStep(0), 5000);
    }

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, [chatStep]);

  return (
    <section className="w-full py-24 lg:py-32 bg-[#0B0C10] border-t border-white/5 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Column - Text Content */}
          <div className="flex flex-col items-start order-2 lg:order-1">
            <span className="text-gray-400 font-bold tracking-[0.2em] text-base md:text-lg uppercase mb-4">About ChatRAG</span>
            <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight leading-tight mb-6">
              It’s your knowledge,<br /> intelligently delivered.
            </h2>
            
            <p className="text-gray-300 text-xl leading-relaxed mb-8">
              Instead of relying on static FAQs or repetitive manual responses, ChatRAG enables you to turn your existing documents into a smart, context-aware AI assistant. Every response is grounded in your actual data — not guesses.
            </p>

            <ul className="flex flex-col gap-4 mb-10">
              <li className="flex items-center gap-3 text-gray-300">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 border border-white/20">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span><strong className="text-white font-medium">Built on your data</strong> — No generic responses</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 border border-white/20">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span><strong className="text-white font-medium">Context-aware</strong> — Retrieves relevant information</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 border border-white/20">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span><strong className="text-white font-medium">Always available</strong> — 24/7 round-the-clock support</span>
              </li>
            </ul>

            <button
              onClick={() => navigate("/about")}
              className="group relative overflow-hidden rounded-[2px] px-8 py-3.5 font-medium border border-white/30 text-white transition-all duration-300"
            >
              <span className="absolute inset-0 w-0 bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
              <span className="relative z-10 group-hover:text-black transition-colors duration-300">Read the Full Story</span>
            </button>
          </div>

          {/* Right Column - Conceptual Animation / Mock Widget */}
          <div className="relative w-full aspect-square md:aspect-video lg:aspect-square flex items-center justify-center order-1 lg:order-2">
            
            {/* Extremely accurate Widget UI Mockup */}
            <div className="relative w-full max-w-[368px] h-[520px] bg-white rounded-[20px] shadow-[0_20px_60px_rgba(108,99,255,0.25)] flex flex-col overflow-hidden animate-float-slow transform scale-95 lg:scale-100 z-20">
              
              {/* Widget Header */}
              <div className="bg-[#6C63FF] text-white px-4 py-3.5 flex items-center gap-3 relative z-10 flex-shrink-0">
                <div className="w-[44px] h-[44px] rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[40px] h-[40px]">
                    <circle cx="20" cy="20" r="20" fill="transparent"/>
                    <rect x="12" y="10" width="16" height="12" rx="4" fill="white"/>
                    <circle cx="16" cy="15" r="2" fill="#6C63FF"/>
                    <circle cx="24" cy="15" r="2" fill="#6C63FF"/>
                    <rect x="18" y="20" width="4" height="2" rx="1" fill="rgba(0,0,0,0.2)"/>
                    <rect x="9" y="14" width="3" height="5" rx="1.5" fill="white"/>
                    <rect x="28" y="14" width="3" height="5" rx="1.5" fill="white"/>
                    <rect x="15" y="22" width="10" height="10" rx="3" fill="white"/>
                    <rect x="13" y="27" width="4" height="7" rx="2" fill="white"/>
                    <rect x="23" y="27" width="4" height="7" rx="2" fill="white"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[15px] tracking-tight">Assistant</div>
                  <div className="flex items-center gap-1.5 text-xs text-white/85 mt-0.5">
                    <div className="w-[7px] h-[7px] bg-[#4ade80] rounded-full shadow-[0_0_0_2px_rgba(74,222,128,0.3)] animate-pulse"></div>
                    Online
                  </div>
                </div>
                <div className="p-1.5 text-white/80 cursor-pointer hover:bg-white/10 rounded-lg transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                </div>
              </div>

              {/* Widget Messages Area */}
              <div className="flex-1 bg-[#fafafa] p-4 flex flex-col gap-3.5 overflow-hidden font-sans">
                
                {/* Bot Message 1 */}
                <div className="flex items-end gap-2 transition-all duration-300 opacity-100 translate-y-0">
                  <div className="w-[30px] h-[30px] rounded-full bg-[#6C63FF] border border-[#6C63FF]/20 flex items-center justify-center flex-shrink-0 p-1">
                      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <rect x="12" y="10" width="16" height="12" rx="4" fill="white"/>
                        <circle cx="16" cy="15" r="2" fill="#6C63FF"/>
                        <circle cx="24" cy="15" r="2" fill="#6C63FF"/>
                        <rect x="15" y="22" width="10" height="10" rx="3" fill="white"/>
                        <rect x="13" y="27" width="4" height="7" rx="2" fill="white"/>
                        <rect x="23" y="27" width="4" height="7" rx="2" fill="white"/>
                      </svg>
                  </div>
                  <div className="bg-[#f0efff] text-[#1a1a2e] px-3.5 py-2.5 rounded-[16px] rounded-bl-[4px] text-[14px] max-w-[74%] leading-[1.55] shadow-sm">
                    Hey there! 👋<br/>I'm an AI assistant trained on product documentation.
                  </div>
                </div>

                {/* User Message */}
                <div className={`flex items-end gap-2 flex-row-reverse mt-2 transition-all duration-300 ${chatStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                  <div className="bg-[#6C63FF] text-white px-3.5 py-2.5 rounded-[16px] rounded-br-[4px] text-[14px] max-w-[74%] leading-[1.55] shadow-sm">
                    How long does it take to integrate ChatRAG on my website?
                  </div>
                </div>

                {/* Bot Typing Indicator */}
                {chatStep === 2 && (
                  <div className="flex items-end gap-2 mt-2 transition-all duration-300 animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                    <div className="w-[30px] h-[30px] rounded-full bg-[#6C63FF] border border-[#6C63FF]/20 flex items-center justify-center flex-shrink-0 p-1">
                       <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                          <rect x="12" y="10" width="16" height="12" rx="4" fill="white"/>
                          <circle cx="16" cy="15" r="2" fill="#6C63FF"/>
                          <circle cx="24" cy="15" r="2" fill="#6C63FF"/>
                          <rect x="15" y="22" width="10" height="10" rx="3" fill="white"/>
                          <rect x="13" y="27" width="4" height="7" rx="2" fill="white"/>
                          <rect x="23" y="27" width="4" height="7" rx="2" fill="white"/>
                        </svg>
                    </div>
                    <div className="bg-[#f0efff] px-4 py-3 rounded-[16px] rounded-bl-[4px] flex items-center gap-[5px] shadow-sm">
                      <div className="w-[7px] h-[7px] bg-[#6C63FF]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-[7px] h-[7px] bg-[#6C63FF]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-[7px] h-[7px] bg-[#6C63FF]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}

                {/* Bot Savage Reply */}
                {chatStep >= 3 && (
                  <div className="flex items-end gap-2 mt-2 transition-all duration-300 animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                    <div className="w-[30px] h-[30px] rounded-full bg-[#6C63FF] border border-[#6C63FF]/20 flex items-center justify-center flex-shrink-0 p-1">
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                          <rect x="12" y="10" width="16" height="12" rx="4" fill="white"/>
                          <circle cx="16" cy="15" r="2" fill="#6C63FF"/>
                          <circle cx="24" cy="15" r="2" fill="#6C63FF"/>
                          <rect x="15" y="22" width="10" height="10" rx="3" fill="white"/>
                          <rect x="13" y="27" width="4" height="7" rx="2" fill="white"/>
                          <rect x="23" y="27" width="4" height="7" rx="2" fill="white"/>
                        </svg>
                    </div>
                    <div className="bg-[#f0efff] text-[#1a1a2e] px-3.5 py-2.5 rounded-[16px] rounded-bl-[4px] text-[14px] max-w-[74%] leading-[1.55] shadow-sm">
                      Less time than you're spending asking about it. 😎
                    </div>
                  </div>
                )}

              </div>

              {/* Widget Footer Input */}
              <div className="p-[12px] border-t border-[#f0f0f0] bg-white flex items-center gap-2 flex-shrink-0">
                <div className="flex-1 border-[1.5px] border-[#ebebeb] bg-[#fafafa] rounded-[100px] px-4 py-2.5 text-[14px] text-[#bbb]">
                  Type a message...
                </div>
                <div className="w-[42px] h-[42px] rounded-full bg-[#6C63FF] flex items-center justify-center text-white flex-shrink-0 shadow-sm cursor-pointer hover:scale-110 transition-transform">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
            
            {/* Minimal Background Decoration for the Widget */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border border-white/5 rounded-full pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/[0.02] rounded-full pointer-events-none"></div>
          </div>

        </div>
      </div>
    </section>
  );
}
