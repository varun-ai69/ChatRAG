export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left — decorative */}
      <aside className="relative hidden min-h-[220px] flex-[0_0_50%] overflow-hidden bg-[#0f0f1a] lg:flex lg:flex-col">
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="pointer-events-none absolute -left-8 -top-8 h-64 w-64 animate-float-slow text-white/10"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden
          >
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
          </svg>
          <svg
            className="pointer-events-none absolute bottom-20 right-4 h-48 w-48 animate-float-slow2 text-white/10"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden
          >
            <rect
              x="20"
              y="20"
              width="160"
              height="160"
              rx="12"
              stroke="currentColor"
              strokeWidth="1"
              transform="rotate(12 100 100)"
            />
          </svg>
          <svg
            className="pointer-events-none absolute bottom-8 left-1/4 h-32 w-32 text-white/15"
            viewBox="0 0 100 100"
            aria-hidden
          >
            {[0, 1, 2, 3, 4].map((row) =>
              [0, 1, 2, 3, 4].map((col) => (
                <circle
                  key={`dot-${row}-${col}`}
                  cx={10 + col * 20}
                  cy={10 + row * 20}
                  r="2"
                  fill="currentColor"
                />
              ))
            )}
          </svg>
          <div className="pointer-events-none absolute left-0 top-1/3 h-px w-full rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col p-8 lg:p-12">
          <h1 className="text-xl font-bold text-white">ChatRAG</h1>
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <p className="max-w-md text-3xl font-bold leading-tight text-white md:text-4xl">
              Turn your documents into a 24/7 support agent
            </p>
            <p className="mt-4 text-lg text-white/70">Upload. Train. Deploy. In minutes.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-white/80">
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5">
              ✦ No code required
            </span>
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5">
              ✦ Works on any website
            </span>
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5">
              ✦ Powered by AI
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile: stacked hero + form */}
      <div className="bg-[#0f0f1a] px-6 py-8 lg:hidden">
        <span className="text-lg font-bold text-white">ChatRAG</span>
        <p className="mt-4 text-xl font-bold leading-tight text-white">
          Turn your documents into a 24/7 support agent
        </p>
        <p className="mt-2 text-sm text-white/70">Upload. Train. Deploy. In minutes.</p>
      </div>

      {/* Right — form */}
      <main className="flex flex-1 flex-col bg-white">{children}</main>
    </div>
  );
}
