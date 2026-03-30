import React from "react";
import { Play } from "lucide-react";

export default function LandingDemo() {
  
  // ==========================================
  // 🔌 FUTURE VIDEO LINK CONFIGURATION
  // Paste your YouTube, Vimeo, or MP4 URL here.
  // Example: "https://www.youtube.com/embed/YOUR_VIDEO_ID"
  // If left empty, the "No Signal / Broken TV" placeholder renders.
  // ==========================================
  const DEMO_VIDEO_URL = ""; 

  return (
    <section className="w-full py-32 bg-[#0B0C10] border-t border-white/5 relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Section Header */}
        <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">
          See ChatRAG in Action
        </h2>
        <p className="text-xl text-gray-400 mb-16 max-w-2xl">
          Watch exactly how seamless it is to turn raw data into a wildly intelligent customer orchestrator in under two minutes.
        </p>

        {/* Video Player Container (16:9 Aspect Ratio Focus) */}
        <div className="relative w-full max-w-5xl aspect-video rounded-[2px] overflow-hidden border border-white/10 bg-[#050505] shadow-[0_0_50px_rgba(0,0,0,0.8)] group">
          
          {DEMO_VIDEO_URL ? (
            
            /* ====================================
               ACTIVE STATE (When URL is provided)
               ==================================== */
            <iframe 
              src={DEMO_VIDEO_URL} 
              className="w-full h-full object-cover outline-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="ChatRAG Demo Video"
            ></iframe>

          ) : (

            /* ====================================
               PLACEHOLDER STATE (Broken TV / Glitch)
               ==================================== */
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#080808] overflow-hidden">
              
              {/* Scanlines Effect */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}
              ></div>
              
              {/* Static Grain Overlay (Subtle) */}
              <div 
                className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
              ></div>

              {/* Occasional glitch bar animation via Tailwind classes */}
              <div className="absolute top-[20%] w-full h-2 bg-white/[0.02] transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:transition-all group-hover:duration-[2s] group-hover:translate-y-[200px] pointer-events-none"></div>

              {/* Center Content */}
              <div className="relative z-10 flex flex-col items-center gap-6 animate-pulse" style={{ animationDuration: '3s' }}>
                
                {/* Red warning badge */}
                <div className="px-4 py-1 border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-mono tracking-[0.3em] uppercase rounded-[2px]">
                  No Signal
                </div>
                
                {/* Main Glitch Text */}
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-3xl md:text-5xl font-black font-mono text-gray-700 tracking-widest uppercase select-none">
                    Demo Uploading
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 font-mono text-xs tracking-[0.3em]">
                    <span className="w-2 h-2 rounded-full bg-gray-600 animate-ping" style={{ animationDuration: '2s' }}></span>
                    AWAITING TRANSMISSION
                  </div>
                </div>

                {/* Dead Play Button */}
                <div className="mt-8 w-16 h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-700 ml-2">
                  <Play className="w-6 h-6 ml-1" />
                </div>

              </div>
              
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
