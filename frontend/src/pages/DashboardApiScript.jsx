import { useEffect, useState } from "react";
import {
  Copy, Check, RefreshCw, AlertCircle,
  Key, Zap, Clock, ArrowRight, Terminal,
  Wifi, Activity
} from "lucide-react";
import { api } from "../utils/api";

// ── helpers ───────────────────────────────────────────────────────────────────
function timeAgo(d) {
  if (!d) return "—";
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Sk({ cls = "" }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${cls}`} />;
}

function useCopy(text) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return [copied, copy];
}

// ── Platform config ───────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: "HTML",    label: "HTML",    emoji: "🌐" },
  { id: "React",   label: "React",   emoji: "⚛️" },
  { id: "PHP",     label: "PHP",     emoji: "🐘" },
  { id: "Django",  label: "Django",  emoji: "🐍" },
  { id: "Shopify", label: "Shopify", emoji: "🛍️" },
];

function buildSnippet(platform, apiKey, apiUrl) {
  const base = apiUrl?.replace("/api/chat", "") || "https://your-backend.com";
  const src  = `${base}/widget.js`;
  const url  = apiUrl || "https://your-backend.com/api/chat";
  const key  = apiKey || "pk_live_••••••••••••";
  const tag  = `<script\n  src="${src}"\n  data-api-key="${key}"\n  data-api-url="${url}"\n></script>`;
  const wrappers = {
    HTML:    `<!-- Paste before </body> -->\n${tag}`,
    React:   `<!-- public/index.html → before </body> -->\n${tag}`,
    PHP:     `<!-- footer.php → before </body> -->\n${tag}`,
    Django:  `{# base.html → before </body> #}\n${tag}`,
    Shopify: `{%- comment -%} theme.liquid → before </body> {%- endcomment -%}\n${tag}`,
  };
  return wrappers[platform] || wrappers.HTML;
}

const STEPS = {
  HTML: [
    { title: "Copy the script",   desc: "Your API key is pre-filled. Just copy.", code: `<script src="...widget.js"\n  data-api-key="pk_live_...">\n</script>` },
    { title: "Open your HTML",    desc: "Open index.html or your main layout file.", code: `project/\n  ├── index.html  ← here\n  ├── style.css\n  └── main.js` },
    { title: "Paste before body", desc: "Find </body> and paste the script just above it.", code: `  <!-- content -->\n  <script ...></script>\n</body>  ← paste here` },
    { title: "Done — test it",    desc: "Save, open browser. Chat bubble appears bottom-right.", code: `✓ Save file\n✓ Open browser\n✓ Bubble → bottom-right` },
  ],
  React: [
    { title: "Copy the script",       desc: "No npm needed — it's just a script tag.", code: `<script src="...widget.js"\n  data-api-key="pk_live_...">\n</script>` },
    { title: "Open public/index.html",desc: "Find index.html inside the /public folder.", code: `my-app/\n  ├── public/\n  │   └── index.html ← here\n  └── src/` },
    { title: "Paste before body",     desc: "Find </body> and paste just above it.", code: `  <div id="root"></div>\n  <script ...></script>\n</body>  ← paste here` },
    { title: "Run dev server",        desc: "Widget loads on every route automatically.", code: `npm run dev\n\n✓ Works on all routes\n✓ Bubble → bottom-right` },
  ],
  PHP: [
    { title: "Copy the script", desc: "Your API key is pre-filled.", code: `<script src="...widget.js"\n  data-api-key="pk_live_...">\n</script>` },
    { title: "Open footer.php", desc: "Find your main layout or footer file.", code: `project/\n  ├── includes/\n  │   └── footer.php ← here\n  └── index.php` },
    { title: "Paste before body",desc: "Find </body> and paste just above it.", code: `<?php // footer.php ?>\n  <script ...></script>\n</body>  ← paste here` },
    { title: "Upload & test",   desc: "Upload and visit your website.", code: `✓ Upload footer.php\n✓ Visit website\n✓ Bubble → bottom-right` },
  ],
  Django: [
    { title: "Copy the script",  desc: "Your API key is pre-filled.", code: `<script src="...widget.js"\n  data-api-key="pk_live_...">\n</script>` },
    { title: "Open base.html",   desc: "Find templates/base.html.", code: `myapp/\n  ├── templates/\n  │   └── base.html ← here\n  └── views.py` },
    { title: "Paste before body",desc: "Find </body> in base template, paste above it.", code: `  {% block content %}{% endblock %}\n  <script ...></script>\n</body>  ← paste here` },
    { title: "Restart & test",   desc: "Restart Django server. Widget is live.", code: `python manage.py runserver\n\n✓ Widget on all pages\n✓ Bubble → bottom-right` },
  ],
  Shopify: [
    { title: "Copy the script",  desc: "Your API key is pre-filled.", code: `<script src="...widget.js"\n  data-api-key="pk_live_...">\n</script>` },
    { title: "Go to theme editor",desc: "Admin → Online Store → Themes → Edit code.", code: `Shopify Admin\n  → Online Store\n  → Themes\n  → Edit code` },
    { title: "Open theme.liquid",desc: "Find Layout → theme.liquid.", code: `Layout/\n  └── theme.liquid ← here\n\nFind </body>` },
    { title: "Paste & save",     desc: "Paste before </body>, click Save. Live instantly.", code: `  {{ content_for_layout }}\n  <script ...></script>\n</body>  ← paste here` },
  ],
};

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, label = "Copy" }) {
  const [copied, copy] = useCopy(text);
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
      {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

// ── Mono field ────────────────────────────────────────────────────────────────
function MonoField({ label, value }) {
  const [copied, copy] = useCopy(value);
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3">
        <p className="flex-1 font-mono text-sm text-gray-800 truncate">{value}</p>
        <button onClick={copy}
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
          {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────────
function StepCard({ n, step }) {
  return (
    <div className="relative w-full max-w-[420px] h-[180px] rounded-2xl border border-gray-300 bg-white p-5 shadow-sm">
      
      {/* Step number */}
      <div className="absolute -top-3.5 left-5 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-gray-900 flex items-center justify-center text-[11px] font-bold text-white">
          {n}
        </div>
        <span className="bg-white border border-gray-200 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-gray-500">
          Step {n}
        </span>
      </div>

      <div className="mt-3 h-full flex flex-col">
        <p className="text-sm font-bold text-gray-800 mb-1">{step.title}</p>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{step.desc}</p>

        <pre className="mt-auto bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[11px] font-mono text-gray-600 overflow-hidden">
          {step.code}
        </pre>
      </div>
    </div>
  );
}

// ── Zigzag connector ──────────────────────────────────────────────────────────
function ZigConnector({ fromRight }) {
  return (
    <div className="grid grid-cols-2 items-center py-2">
      
      {fromRight ? (
        <>
          {/* EMPTY LEFT */}
          <div />

          {/* RIGHT → LEFT arrow */}
          <div className="flex justify-start">
            <svg width="100%" height="60" viewBox="0 0 400 60">
              <path
                d="M380 10 C380 10 400 10 400 30 C400 50 20 50 20 50"
                stroke="#d1d5db"
                strokeWidth="1.5"
                strokeDasharray="6 5"
                fill="none"
              />
              <path
                d="M28 44 L20 50 L28 56"
                stroke="#d1d5db"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
        </>
      ) : (
        <>
          {/* LEFT → RIGHT arrow */}
          <div className="flex justify-end">
            <svg width="100%" height="60" viewBox="0 0 400 60">
              <path
                d="M20 10 C20 10 0 10 0 30 C0 50 380 50 380 50"
                stroke="#d1d5db"
                strokeWidth="1.5"
                strokeDasharray="6 5"
                fill="none"
              />
              <path
                d="M372 44 L380 50 L372 56"
                stroke="#d1d5db"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>

          {/* EMPTY RIGHT */}
          <div />
        </>
      )}
    </div>
  );
}

// ── Zigzag steps ──────────────────────────────────────────────────────────────
function ZigzagSteps({ steps }) {
  return (
    <div className="relative">

      {/* Vertical main line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-200 -translate-x-1/2" />

      <div className="space-y-20">
        {steps.map((step, i) => {
          const isLeft = i % 2 === 0;

          return (
            <div key={i} className="relative grid grid-cols-2 items-center">

              {/* LEFT SIDE */}
              {isLeft ? (
                <div className="flex justify-end pr-12 relative">
                  
                  {/* horizontal root line */}
                  <div className="absolute right-0 top-1/2 w-12 h-[2px] bg-gray-200" />

                  <StepCard n={i + 1} step={step} />
                </div>
              ) : (
                <div />
              )}

              {/* RIGHT SIDE */}
              {!isLeft ? (
                <div className="flex justify-start pl-12 relative">
                  
                  {/* horizontal root line */}
                  <div className="absolute left-0 top-1/2 w-12 h-[2px] bg-gray-200" />

                  <StepCard n={i + 1} step={step} />
                </div>
              ) : (
                <div />
              )}

              {/* CENTER DOT (root node) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="h-3 w-3 rounded-full bg-gray-400 border-2 border-white" />
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Decorative dots ───────────────────────────────────────────────────────────
function DotGrid({ className = "" }) {
  return (
    <svg className={className} width="120" height="80" viewBox="0 0 120 80">
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={col * 14 + 7} cy={row * 14 + 7} r="1.5" fill="#e5e7eb" />
        ))
      )}
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardApiScript() {
  const [platform, setPlatform] = useState("HTML");
  const [scriptData, setScriptData] = useState(null);
  const [status, setStatus]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  async function fetchAll() {
    setLoading(true); setError(null);
    try {
      const [s, t] = await Promise.all([
        api.get("/api/admin/script"),
        api.get("/api/admin/script/test"),
      ]);
      setScriptData(s.data);
      setStatus(t.data);
    } catch { setError("Could not load script data."); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchAll(); }, []);

  const snippet = buildSnippet(platform, scriptData?.apiKey, scriptData?.apiUrl);
  const steps   = STEPS[platform];

  return (
    <div className="h-full w-full overflow-y-auto bg-white">
      <div className="w-full px-8 py-8 xl:px-12 xl:py-10">

        {/* ── Header ── */}
        <div className="mb-10 flex items-start justify-between border-b border-gray-200 pb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Integration</p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 xl:text-4xl">API & Script</h1>
            <p className="mt-2 text-sm text-gray-400 max-w-lg">
              Embed the chat widget on any website in under 2 minutes using your unique API key.
            </p>
          </div>
          <button onClick={fetchAll}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={15} className="shrink-0" /> {error}
            <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
          </div>
        )}

        {/* ── Row 1: Status + API Key ── */}
        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Status card */}
          <div className="rounded-2xl border border-gray-300 bg-white p-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5">Widget status</p>
            <div className="space-y-0">
              {[
                {
                  Icon: Wifi, label: "Live on website",
                  val: loading ? <Sk cls="h-5 w-16" />
                    : status?.isLive
                    ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                      </span>
                    : <span className="text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">Not detected</span>,
                },
                {
                  Icon: Activity, label: "Sessions via widget",
                  val: loading ? <Sk cls="h-5 w-10" />
                    : <span className="text-sm font-bold text-gray-900">{status?.sessionCount ?? 0}</span>,
                },
                {
                  Icon: Clock, label: "Last used",
                  val: loading ? <Sk cls="h-5 w-20" />
                    : <span className="text-sm text-gray-600">{timeAgo(status?.lastUsed)}</span>,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 py-4 border-b border-gray-100 last:border-0 last:pb-0 first:pt-0">
                  <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                    <row.Icon size={14} className="text-gray-400" />
                  </div>
                  <span className="flex-1 text-sm text-gray-700">{row.label}</span>
                  {row.val}
                </div>
              ))}
            </div>
          </div>

          {/* API Key card */}
          <div className="rounded-2xl border border-gray-300 bg-white p-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5">Your API key</p>
            {loading
              ? <div className="space-y-4"><Sk cls="h-12 w-full rounded-xl" /><Sk cls="h-12 w-full rounded-xl" /></div>
              : <div className="space-y-4">
                  <MonoField label="API Key" value={scriptData?.apiKey || "pk_live_••••••••••"} />
                  <MonoField label="API URL" value={scriptData?.apiUrl || "https://your-backend.com/api/chat"} />
                  <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3">
                    <Key size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">Keep your API key private. Never expose it in client-side code other than this script tag.</p>
                  </div>
                </div>
            }
          </div>
        </div>

        {/* ── Embed Script — centered with decorations ── */}
        <div className="mb-10">
          <div className="rounded-2xl border border-gray-300 bg-white overflow-hidden">
            {/* header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Embed script</p>
                <p className="text-xs text-gray-500 mt-0.5">Choose your platform and paste the script</p>
              </div>
              {!loading && <CopyBtn text={snippet} label="Copy script" />}
            </div>

            {/* platform tabs */}
            <div className="flex items-center gap-1.5 px-6 pt-4 pb-2 border-b border-gray-100 flex-wrap">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all
                    ${platform === p.id
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}>
                  <span className="text-sm leading-none">{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>

            {/* code + decoration */}
            <div className="relative flex items-stretch">
              {/* left decoration */}
              <div className="hidden lg:flex w-32 items-center justify-center border-r border-gray-100 bg-gray-50/50 shrink-0">
                <DotGrid />
              </div>

              {/* code block center */}
              <div className="flex-1 px-6 py-6">
                {loading
                  ? <Sk cls="h-32 w-full rounded-xl" />
                  : <pre className="bg-gray-50 border border-gray-300 rounded-2xl px-5 py-5 text-xs font-mono text-gray-700 overflow-x-auto leading-relaxed whitespace-pre">
                      {snippet}
                    </pre>
                }
              </div>

              {/* right decoration */}
              <div className="hidden lg:flex w-32 items-center justify-center border-l border-gray-100 bg-gray-50/50 shrink-0">
                <DotGrid className="rotate-90" />
              </div>
            </div>

            {/* hint */}
            <div className="px-6 pb-5 pt-1">
              <p className="text-xs text-gray-400 text-center">
                {platform === "HTML" && "Paste before the </body> closing tag in your HTML file."}
                {platform === "React" && "Paste in public/index.html before </body>. Works on all React routes."}
                {platform === "PHP" && "Add to your footer.php or main layout file before </body>."}
                {platform === "Django" && "Add to base.html before </body>. Appears on all Django pages."}
                {platform === "Shopify" && "Shopify Admin → Themes → Edit code → theme.liquid → before </body>."}
              </p>
            </div>
          </div>
        </div>

        {/* ── Setup Guide — zigzag ── */}
        <div>
          <div className="rounded-2xl border border-gray-300 bg-white overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Setup guide</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Follow these steps to get your chatbot live on {PLATFORMS.find(p => p.id === platform)?.label}
              </p>
            </div>
            <div className="px-8 py-8">
              <ZigzagSteps steps={steps} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}