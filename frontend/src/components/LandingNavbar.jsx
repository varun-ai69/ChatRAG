import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // Assuming scrollable container is custom, or checking natural body scroll
      const scrollTop = document.getElementById("landing-scroll-container")?.scrollTop || window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    // Add event listener to our specific scroll container
    const scrollContainer = document.getElementById("landing-scroll-container");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? "bg-[#0B0C10]/90 backdrop-blur-md"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">

        {/* Logo Container (Left aligned) */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="relative z-10 text-3xl tracking-tight">ChatRAG</span>
          </Link>
        </div>

        {/* Links (Centered) */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-10 text-lg font-medium text-gray-300">

          <Link to="/" className="group relative py-2 text-white transition-colors whitespace-nowrap">
            Home
            {/* Active minimal line */}
            {pathname === "/" ? (
              <span className="absolute left-0 bottom-0 w-full h-[1px] bg-white/70"></span>
            ) : (
              <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-white/70 transition-all duration-300 group-hover:w-full"></span>
            )}
          </Link>

          <Link to="/about" className="group relative py-2 text-white transition-colors whitespace-nowrap">
            About
            {/* Active minimal line */}
            {pathname === "/about" ? (
              <span className="absolute left-0 bottom-0 w-full h-[1px] bg-white/70"></span>
            ) : (
              <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-white/70 transition-all duration-300 group-hover:w-full"></span>
            )}
          </Link>

          <button 
            onClick={() => {
              if (pathname !== "/") {
                navigate("/");
                setTimeout(() => document.getElementById("setup-guide")?.scrollIntoView({ behavior: "smooth" }), 100);
              } else {
                document.getElementById("setup-guide")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="group relative py-2 hover:text-white transition-colors whitespace-nowrap"
          >
            Setup Guide
            <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-white/70 transition-all duration-300 group-hover:w-full"></span>
          </button>

          <Link to="/contact" className="group relative py-2 text-white transition-colors whitespace-nowrap">
            Contact
            {pathname === "/contact" ? (
              <span className="absolute left-0 bottom-0 w-full h-[1px] bg-white/70"></span>
            ) : (
              <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-white/70 transition-all duration-300 group-hover:w-full"></span>
            )}
          </Link>

          <a href="https://github.com/varun-ai69/ChatRAG.git" target="_blank" rel="noreferrer" className="group relative py-2 hover:text-white transition-colors whitespace-nowrap">
            Source Code
            <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-white/70 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </div>

        {/* Action Button (Right aligned) */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => navigate("/login")}
            className="group relative overflow-hidden rounded-[2px] px-8 py-3 font-medium border border-white/30 text-white transition-all duration-300 pointer-events-auto text-lg"
          >
            <span className="absolute inset-0 w-0 bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
            <span className="relative z-10 group-hover:text-black transition-colors duration-300">Launch Workspace</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
