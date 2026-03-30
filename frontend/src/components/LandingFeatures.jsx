import React from "react";
import { FileText, BrainCircuit, Clock, CodeXml, BookOpenCheck, Zap } from "lucide-react";

const features = [
  {
    title: "AI trained on your documents",
    description: "Turn PDFs, policies, and guides into a smart support assistant.",
    icon: <FileText className="w-6 h-6 text-white" strokeWidth={1.5} />,
  },
  {
    title: "Context-aware responses",
    description: "Answers are generated using your actual data, not generic AI guesses.",
    icon: <BrainCircuit className="w-6 h-6 text-white" strokeWidth={1.5} />,
  },
  {
    title: "24/7 automated support",
    description: "Handle customer queries anytime without scaling your team.",
    icon: <Clock className="w-6 h-6 text-white" strokeWidth={1.5} />,
  },
  {
    title: "Easy website integration",
    description: "Add ChatRAG to your site with a simple script tag in minutes.",
    icon: <CodeXml className="w-6 h-6 text-white" strokeWidth={1.5} />,
  },
  {
    title: "Source-backed answers",
    description: "Every response is grounded with references straight from your documents.",
    icon: <BookOpenCheck className="w-6 h-6 text-white" strokeWidth={1.5} />,
  },
  {
    title: "Built for scale",
    description: "Handle thousands of conversations without any performance issues.",
    icon: <Zap className="w-6 h-6 text-white" strokeWidth={1.5} />,
  }
];

export default function LandingFeatures() {
  return (
    <section id="features" className="w-full py-32 bg-[#050505] border-t border-white/5 relative z-10 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-20 text-center max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight mb-8">
            Powerful AI support, built on your data
          </h2>
          
          {/* Hero-style feature pills instead of standard text subheading */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gray-300">
              <span className="text-white font-bold leading-none">+</span> Zero hallucinations
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gray-300">
              <span className="text-white font-bold leading-none">+</span> Enterprise security
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gray-300">
              <span className="text-white font-bold leading-none">+</span> Instant deployment
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="group p-8 border border-white/10 bg-[#0A0A0A] rounded-[2px] transition-all duration-300 hover:border-white/30 hover:bg-white/[0.02]"
            >
              <div className="mb-6 w-12 h-12 flex items-center justify-center border border-white/10 bg-white/5 rounded-[2px] group-hover:bg-white/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium text-white mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
