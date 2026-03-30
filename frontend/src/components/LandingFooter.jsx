import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Github, Linkedin, Twitter } from "lucide-react";

export default function LandingFooter({ hideCTA = false }) {
  const navigate = useNavigate();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", url: "#features" },
        { name: "Pricing", url: "#" },
        { name: "Integrations", url: "#" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", url: "/about" },
        { name: "Contact", url: "/contact" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", url: "#" },
        { name: "Setup Guide", url: "#setup-guide" },
        { name: "API", url: "#" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", url: "#" },
        { name: "Terms of Service", url: "#" },
      ]
    }
  ];

  return (
    <footer className="w-full bg-[#050505] border-t border-white/5 relative z-10 flex flex-col">
      
      {/* =========================================
          PRE-FOOTER CTA (No Glow / Clean Layout)
          ========================================= */}
      {!hideCTA && (
        <div className="w-full py-32 border-b border-white/5 bg-[#050505] flex flex-col items-center justify-center text-center px-6">
          
          <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-10 relative z-10">
            Ready to get started?
          </h2>
          
          <button
            onClick={() => navigate("/signup")}
            className="group relative overflow-hidden rounded-[2px] px-12 py-5 font-bold text-lg border border-white/30 text-white transition-all duration-300 bg-white/5 block z-10"
          >
            <span className="absolute inset-0 w-0 bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
            <span className="relative z-10 group-hover:text-black transition-colors duration-300 flex items-center gap-2">
              Get Started <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      )}

      {/* =========================================
          MAIN FOOTER STRUCTURE
          ========================================= */}
      <div className="max-w-7xl mx-auto w-full px-6 py-28">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-12 mb-28">
          
          {/* 1. LEFT - BRAND */}
          <div className="lg:col-span-5 flex flex-col gap-8 pr-12">
            <Link to="/" className="text-4xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="relative z-10">ChatRAG</span>
            </Link>
            
            <p className="text-gray-400 font-light max-w-sm leading-relaxed text-lg">
              Turn your documents into a 24/7 support agent.
            </p>
            
            {/* 3. SOCIAL ICONS */}
            <div className="flex items-center gap-6 mt-4">
              <a href="https://github.com/varun-ai69" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-[2px] border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-300">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/varun-kushwaha-52a0a8351" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-[2px] border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:border-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://x.com/VarunKu51655589" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-[2px] border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:border-[#1DA1F2] hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* 2. LINKS GRID (4 COLUMNS) */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8">
            {footerLinks.map((block, idx) => (
              <div key={idx} className="flex flex-col gap-8">
                <h4 className="text-white font-bold text-base tracking-widest uppercase">
                  {block.title}
                </h4>
                <ul className="flex flex-col gap-5">
                  {block.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      {link.url.startsWith('#') && link.url.length > 1 ? (
                        <button 
                          onClick={() => {
                            if (window.location.pathname !== "/") {
                              navigate("/");
                              setTimeout(() => document.getElementById(link.url.substring(1))?.scrollIntoView({ behavior: "smooth" }), 100);
                            } else {
                              document.getElementById(link.url.substring(1))?.scrollIntoView({ behavior: "smooth" });
                            }
                          }}
                          className="text-gray-400 text-base md:text-lg hover:text-white transition-colors flex items-center group relative w-fit font-medium"
                        >
                          {link.name}
                          <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-white/30 transition-all duration-300 group-hover:w-full"></span>
                        </button>
                      ) : (
                        <Link 
                          to={link.url}
                          className="text-gray-400 text-base md:text-lg hover:text-white transition-colors flex items-center group relative w-fit font-medium"
                        >
                          {link.name}
                          <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-white/30 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* 4. BOTTOM LINE */}
        <div className="w-full pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-base font-light">
            © 2026 ChatRAG. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-base text-gray-500 font-light">
            <span className="hover:text-gray-300 cursor-pointer transition-colors flex items-center gap-2">
              System Status: <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> <span className="text-green-500 font-medium">100% Operational</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
