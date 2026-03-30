import React, { useState } from "react";
import { Copy, Check, CheckCircle2, CloudFog, MessageSquare, Briefcase, Settings2, BarChart3, Database } from "lucide-react";

export default function LandingSetup() {
  const [activeTab, setActiveTab] = useState("HTML");
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    HTML: `<!-- Paste before </body> -->\n<script\n  src="https://patient-comfort-production-9aee.up.railway.app/widget.js"\n  data-api-key="pk_live_...f5de8d"\n  data-api-url="https://patient-comfort-production-9aee.up.railway.app/api/chat"\n></script>`,
    React: `<!-- public/index.html → before </body> -->\n<script\n  src="https://patient-comfort-production-9aee.up.railway.app/widget.js"\n  data-api-key="pk_live_...f5de8d"\n  data-api-url="https://patient-comfort-production-9aee.up.railway.app/api/chat"\n></script>`,
    Django: `{# base.html → before </body> #}\n<script\n  src="https://patient-comfort-production-9aee.up.railway.app/widget.js"\n  data-api-key="pk_live_...f5de8d"\n  data-api-url="https://patient-comfort-production-9aee.up.railway.app/api/chat"\n></script>`,
    PHP: `<!-- footer.php → before </body> -->\n<script\n  src="https://patient-comfort-production-9aee.up.railway.app/widget.js"\n  data-api-key="pk_live_...f5de8d"\n  data-api-url="https://patient-comfort-production-9aee.up.railway.app/api/chat"\n></script>`
  };

  const fullApiKeySnippet = {
    HTML: `<!-- Paste before </body> -->\n<script\n  src="https://patient-comfort-production-9aee.up.railway.app/widget.js"\n  data-api-key="pk_live_f01cfbae8c99c62d5dbb0ebc10a0d1ae8f2d516bf5de8d"\n  data-api-url="https://patient-comfort-production-9aee.up.railway.app/api/chat"\n></script>`,
    React: `<!-- public/index.html → before </body> -->\n<script\n  src="https://patient-comfort-production-9aee.up.railway.app/widget.js"\n  data-api-key="pk_live_f01cfbae8c99c62d5dbb0ebc10a0d1ae8f2d516bf5de8d"\n  data-api-url="https://patient-comfort-production-9aee.up.railway.app/api/chat"\n></script>`,
    Django: `{# base.html → before </body> #}\n<script\n  src="https://patient-comfort-production-9aee.up.railway.app/widget.js"\n  data-api-key="pk_live_f01cfbae8c99c62d5dbb0ebc10a0d1ae8f2d516bf5de8d"\n  data-api-url="https://patient-comfort-production-9aee.up.railway.app/api/chat"\n></script>`,
    PHP: `<!-- footer.php → before </body> -->\n<script\n  src="https://patient-comfort-production-9aee.up.railway.app/widget.js"\n  data-api-key="pk_live_f01cfbae8c99c62d5dbb0ebc10a0d1ae8f2d516bf5de8d"\n  data-api-url="https://patient-comfort-production-9aee.up.railway.app/api/chat"\n></script>`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullApiKeySnippet[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const integrationSteps = [
    { num: "01", title: "Login to Admin Portal", desc: "Log in to your ChatRAG admin dashboard to get started." },
    { num: "02", title: "Get Your API Key & Script", desc: "Navigate to the API & Integration section to access your secure API key and ready-to-use script tag." },
    { num: "03", title: "Choose Your Platform", desc: "Whether it's HTML, React, Django or PHP, we generate the exact snippet location required." },
    { num: "04", title: "Inject Secure Script", desc: "Paste the script at the required location. Securely store your key in a .env file and feed it via process.env.ChatRAGApiKey." },
    { num: "05", title: "Start Your Application", desc: "Run your project and your highly-trained chatbot will automatically be injected into your UI natively." }
  ];

  const usageSteps = [
    { icon: <Database />, title: "Upload Docs", desc: "Go to the Documents section and upload PDFs, Docs, or Policies to form the core brain." },
    { icon: <CloudFog />, title: "Automatic Processing", desc: "ChatRAG vectorizes and converts your docs into rapid searchable knowledge automatically." },
    { icon: <MessageSquare />, title: "Start Conversations", desc: "Users on your site can instantly ask questions and receive perfectly accurate responses." },
    { icon: <Briefcase />, title: "Manage Chats", desc: "Track queries, view active user sessions, and monitor the AI's real-time accuracy." },
    { icon: <Settings2 />, title: "Customize", desc: "Configure your chatbot's visual theme, behavior instructions, and welcome interactions." },
    { icon: <BarChart3 />, title: "Analytics", desc: "Track total query volume, dynamic response timelines, and ongoing user engagement." }
  ];

  return (
    <section id="setup-guide" className="w-full relative z-10">

      {/* =========================================
          SECTION 1: INTEGRATION (TECHNICAL SETUP)
          ========================================= */}
      <div className="w-full py-28 lg:py-40 bg-[#0B0C10] relative overflow-hidden">

        {/* Subtle wavy gradient background elements */}
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#6C63FF]/[0.02] rounded-full blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative z-10 items-center">

          {/* Left: The Timeline Flow */}
          <div className="flex flex-col">
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4">
              Add ChatRAG to<br />Your Website
            </h2>
            <p className="text-xl text-gray-400 font-light mb-16 max-w-lg">
              Five straightforward steps to natively embed your intelligent assistant directly into your project.
            </p>

            <div className="relative border-l-2 border-dashed border-white/10 pl-8 ml-4 flex flex-col gap-14">
              {integrationSteps.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Glow Dot */}
                  <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#0B0C10] border-2 border-white/20 group-hover:border-[#6C63FF] transition-colors duration-300"></div>

                  <div className="flex flex-col gap-1.5 transform group-hover:translate-x-1 transition-transform duration-300">
                    <span className="text-[#6C63FF] font-bold text-sm tracking-widest uppercase">Step {step.num}</span>
                    <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                    <p className="text-gray-400 text-base leading-relaxed max-w-md">{step.desc}</p>
                  </div>
                </div>
              ))}

              {/* Final State Check */}
              <div className="relative mt-2">
                <div className="absolute -left-[45px] top-1 w-6 h-6 rounded-full bg-[#6C63FF] text-white flex items-center justify-center shadow-[0_0_15px_rgba(108,99,255,0.4)]">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <div className="flex flex-col gap-1.5 ml-2">
                  <h3 className="text-xl font-semibold text-white">Your ChatRAG assistant is now live.</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Right: The Interactive Code Preview */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-lg rounded-xl overflow-hidden border border-white/10 bg-[#050505] shadow-2xl flex flex-col">

              {/* Mac-like Window Header */}
              <div className="h-10 border-b border-white/10 bg-[#0A0A0A] flex items-center px-4 gap-2 border-t-[1px] border-t-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>

              {/* Tabs */}
              <div className="flex items-center border-b border-white/10 bg-[#0A0A0A]">
                {Object.keys(codeSnippets).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === tab
                        ? "text-white border-[#6C63FF] bg-white/[0.02]"
                        : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/[0.01]"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Code Area */}
              <div className="relative bg-[#050505] p-6 text-sm font-mono leading-loose overflow-x-auto min-h-[16rem]">

                <button
                  onClick={handleCopy}
                  className="absolute top-4 right-4 p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 transition-colors z-10 flex items-center gap-2"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? <span className="text-xs text-green-400 font-sans">Copied!</span> : null}
                </button>

                <div className="text-gray-400">
                  <span className="text-green-400/80 select-none">
                    {codeSnippets[activeTab].split('\\n')[0]}
                  </span>
                  <br />
                  <span className="text-blue-400">&lt;script</span>
                  <br />
                  <span className="pl-4 text-purple-300">src</span><span className="text-gray-300">="</span><span className="text-green-300">https://patient-comfort-production-9aee.up.railway.app/widget.js</span><span className="text-gray-300">"</span>
                  <br />
                  <span className="pl-4 text-purple-300">data-api-key</span><span className="text-gray-300">="</span><span className="text-green-300">pk_live_f01cfbae8<span className="blur-[3px] select-none text-gray-500">c99c62d5dbb0ebc10a0d1ae8</span>f2d516bf5de8d2a</span><span className="text-gray-300">"</span>
                  <br />
                  <span className="pl-4 text-purple-300">data-api-url</span><span className="text-gray-300">="</span><span className="text-green-300">https://patient-comfort-production-9aee.up.railway.app/api/chat</span><span className="text-gray-300">"</span>
                  <br />
                  <span className="text-blue-400">&gt;&lt;/script&gt;</span>
                </div>
              </div>

              <div className="p-4 bg-[rgba(108,99,255,0.05)] border-t border-[#6C63FF]/20 flex items-start gap-3">
                <div className="mt-0.5 text-[#6C63FF]"><CheckCircle2 className="w-5 h-5" /></div>
                <div>
                  <p className="text-white text-sm font-medium mb-1">Masked Key Preview</p>
                  <p className="text-gray-400 text-xs leading-relaxed">Copying the block above will capture the full valid script block securely.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          SECTION 2: USAGE (PRODUCT EXPERIENCES)
          ========================================= */}
      <div className="w-full py-28 lg:py-36 bg-[#050505] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4">
              Train & Manage Your AI
            </h2>
            <p className="text-xl text-gray-400 font-light">
              We eliminated manual setup complexity. It takes six seamless steps to deploy a wildly intelligent custom assistant on any platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {usageSteps.map((card, idx) => (
              <div key={idx} className="group p-8 border border-white/10 bg-[#0A0A0A] rounded-[2px] transition-all duration-300 hover:border-white/30 hover:bg-white/[0.03]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-[2px] bg-white/5 border border-white/10 text-white group-hover:bg-[#6C63FF] group-hover:border-[#6C63FF] group-hover:text-white transition-colors duration-300">
                    {React.cloneElement(card.icon, { className: 'w-5 h-5 ' })}
                  </div>
                  <div>
                    <span className="text-[#6C63FF] font-bold text-xs tracking-widest uppercase block mb-1">Step {idx + 1}</span>
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>

    </section>
  );
}
