import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const sequences = [
  {
    line1: "ChatRAG — Plugin your data.",
    line2: "Launch AI support.",
    sub: "Upload. Train. Deploy. In minutes."
  },
  {
    line1: "Turn your documents into",
    line2: "a 24/7 support agent.",
    sub: "Automate your customer service instantly."
  }
];

export default function LandingHero() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationState, setAnimationState] = useState("enter"); // "enter", "idle", "leave"

  useEffect(() => {
    const cycleTime = 4000;

    const interval = setInterval(() => {
      setAnimationState("leave");

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sequences.length);
        setAnimationState("enter");

        // After slight delay, move to idle (fully shown)
        setTimeout(() => setAnimationState("idle"), 50);
      }, 600); // Wait for leave animation to finish

    }, cycleTime);

    // Initial idle state
    setTimeout(() => setAnimationState("idle"), 50);

    return () => clearInterval(interval);
  }, []);

  const currentSequence = sequences[currentIndex];

  // Map state to left-to-right classes
  const getTextClasses = () => {
    if (animationState === "enter") return "-translate-x-8 opacity-0";
    if (animationState === "leave") return "translate-x-8 opacity-0";
    return "translate-x-0 opacity-1";
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Abstract Background Elements (Minimal) */}
      <div className="absolute top-1/4 left-1/4 w-px h-64 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-64 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>
      
      {/* 1 or 2 minimal dots floating */}
      <div className="absolute top-1/2 left-10 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 right-[15%] w-2 h-2 rounded-full bg-white/10 animate-float-slow pointer-events-none"></div>
      
      {/* 1 Large minimal thin circle */}
      <div className="absolute right-10 top-20 w-32 h-32 border border-white/5 rounded-full pointer-events-none"></div>

      {/* 2. Dotted pattern in the bottom left */}
      <div className="absolute bottom-24 left-[10%] grid grid-cols-4 gap-6 opacity-20 pointer-events-none animate-float-slow2">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-20 text-center relative z-10 flex flex-col items-center">

        {/* Animated Text Container */}
        <div className={`transition-all duration-700 ease-out transform ${getTextClasses()} min-h-[160px] md:min-h-[180px] flex flex-col items-center justify-center mb-6 w-full max-w-[1000px]`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight px-4 w-full">
            <span className="block md:whitespace-nowrap w-full">{currentSequence.line1}</span>
            <span className="block">{currentSequence.line2}</span>
          </h1>
        </div>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-400 mb-12 animate-fade-in-up">
          {currentSequence.sub}
        </p>

        {/* Badges / Floating Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-14 animate-fade-in-up" style={{ animationDelay: "200ms", opacity: 0, animationFillMode: "forwards" }}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gray-300">
            <span className="text-white font-bold leading-none">+</span> No code required
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gray-300">
            <span className="text-white font-bold leading-none">+</span> Works on any website
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gray-300">
            <span className="text-white font-bold leading-none">+</span> Powered by AI
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full animate-fade-in-up" style={{ animationDelay: "400ms", opacity: 0, animationFillMode: "forwards" }}>
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-semibold rounded-[2px] transition-all hover:bg-gray-200"
          >
            Launch Workspace
          </button>
          <button
            onClick={() => { }}
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white/30 text-white hover:bg-white/10 font-medium rounded-[2px] transition-all"
          >
            Explore Live Demo
          </button>
        </div>
      </div>
    </div>
  );
}
