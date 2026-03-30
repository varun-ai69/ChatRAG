import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, MessageSquare, TrendingDown, Users,
  Upload, Bot, ArrowRight, Database,
  CheckCircle2, Circle, Clock, RefreshCw,
  AlertCircle, File, Layers, ChevronRight
} from "lucide-react";
import { api } from "../utils/api";
import { getUser } from "../utils/auth";

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
function fmtBytes(b) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}
function greeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Good night";
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter({ text, delay = 0, speed = 48 }) {
  const [out, setOut] = useState("");
  const [go, setGo]   = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!go || !text) return;
    setOut("");
    let i = 0;
    const t = setInterval(() => {
      setOut(text.slice(0, ++i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [go, text, speed]);
  return (
    <>
      {out}
      {out.length < (text?.length || 0) && (
        <span className="inline-block w-[3px] h-[0.85em] bg-gray-900 align-middle ml-0.5 animate-pulse" />
      )}
    </>
  );
}

// ── Counter ───────────────────────────────────────────────────────────────────
function Counter({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (value == null) return;
    const raw = parseFloat(String(value).replace("%",""));
    if (isNaN(raw)) return;
    let cur = 0;
    const t = setInterval(() => {
      cur += (raw / 700) * 16;
      if (cur >= raw) { setN(raw); clearInterval(t); } else setN(cur);
    }, 16);
    return () => clearInterval(t);
  }, [value]);
  if (value == null) return <span>—</span>;
  return String(value).includes("%")
    ? <span>{n.toFixed(1)}%</span>
    : <span>{Math.round(n).toLocaleString()}</span>;
}

function Sk({ cls = "" }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${cls}`} />;
}

function Chip({ status }) {
  const m = {
    ACTIVE:"bg-green-50 text-green-700", PROCESSING:"bg-yellow-50 text-yellow-700",
    FAILED:"bg-red-50 text-red-700", active:"bg-green-50 text-green-700",
    resolved:"bg-blue-50 text-blue-700", flagged:"bg-red-50 text-red-700",
  };
  return (
    <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${m[status]||"bg-gray-100 text-gray-400"}`}>
      {status}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const nav = useNavigate();
  const user = getUser();
  const name = user?.name?.trim() || "";

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [ready, setReady]     = useState(false);

  async function load() {
    setLoading(true); setError(null); setReady(false);
    try {
      const r = await api.get("/api/admin/home");
      setData(r.data);
      setTimeout(() => setReady(true), 80);
    } catch { setError("Could not load dashboard data."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const s  = data?.stats;
  const cl = data?.checklist;
  const rc = data?.recentChats     || [];
  const rd = data?.recentDocuments || [];

  const steps = [
    { key:"accountCreated",    label:"Create your account",        done:cl?.accountCreated,    to:null },
    { key:"documentUploaded",  label:"Upload your first document", done:cl?.documentUploaded,  to:"/dashboard/documents" },
    { key:"chatbotConfigured", label:"Configure your chatbot",     done:cl?.chatbotConfigured, to:"/dashboard/chatbot" },
    { key:"scriptCopied",      label:"Add widget to your website", done:cl?.scriptCopied,      to:"/dashboard/api" },
  ];
  const done   = steps.filter(x => x.done).length;
  const allDone= done === steps.length;

  const stats = [
    { label:"Documents",    value:s?.totalDocuments, dot:"bg-blue-500" },
    { label:"Sessions",     value:s?.totalSessions,  dot:"bg-emerald-500" },
    { label:"Messages",     value:s?.totalMessages,  dot:"bg-violet-500" },
    { label:"Fallback Rate",value:s?.fallbackRate,   dot:"bg-orange-400" },
  ];

  const actions = [
    { label:"Upload Documents",   sub:"Add PDFs and docs to your knowledge base", Icon:Upload,        to:"/dashboard/documents", ib:"bg-blue-50",    ic:"text-blue-600" },
    { label:"View Conversations", sub:"Browse all customer chat sessions",         Icon:MessageSquare, to:"/dashboard/chats",     ib:"bg-emerald-50", ic:"text-emerald-600" },
    { label:"Customize Chatbot",  sub:"Edit colors, name, and welcome message",    Icon:Bot,           to:"/dashboard/chatbot",   ib:"bg-violet-50",  ic:"text-violet-600" },
    { label:"Get Embed Script",   sub:"Copy widget script for your website",       Icon:Layers,        to:"/dashboard/api",       ib:"bg-orange-50",  ic:"text-orange-500" },
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-white">
      {/* ── inner: full width, generous padding ── */}
      <div className="w-full px-8 py-8 xl:px-12 xl:py-10">

        {/* ── Welcome ─────────────────────────────── */}
        <div className="mb-10 border-b border-gray-200 pb-8"
             style={{ opacity: ready ? 1 : 0, transition: "opacity .4s" }}>
          <p className="text-sm font-semibold text-gray-400 tracking-wide">
            {greeting()}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 xl:text-5xl">
            {name ? <Typewriter text={name} delay={180} speed={48} /> : <Sk cls="h-11 w-56 mt-1" />}
          </h1>
          <p className="mt-3 text-sm text-gray-400 max-w-2xl leading-relaxed"
             style={{ opacity: ready ? 1 : 0, transition: "opacity .5s .35s" }}>
            Here is an overview of your knowledge base, active sessions, and chatbot performance.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={15} className="shrink-0" /> {error}
            <button onClick={load} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        {/* ── Stats row ───────────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-px rounded-xl border border-gray-300 bg-gray-300 overflow-hidden lg:grid-cols-4">
          {loading
            ? [1,2,3,4].map(i => <div key={i} className="bg-white px-6 py-6"><Sk cls="h-3 w-20 mb-4"/><Sk cls="h-8 w-14"/></div>)
            : stats.map((st, i) => (
              <div key={st.label} className="bg-white px-6 py-6"
                   style={{ opacity: ready ? 1 : 0, transition: `opacity .4s ${i*70}ms` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${st.dot}`} />
                  <span className="text-xs font-semibold text-gray-400">{st.label}</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 tabular-nums xl:text-4xl">
                  <Counter value={st.value} />
                </p>
              </div>
            ))
          }
        </div>

        {/* ── Getting started + Quick actions ─────── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Getting started */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-base font-semibold text-gray-800">Getting started</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {allDone ? "All steps complete" : `${done} of ${steps.length} steps done`}
                </p>
              </div>
              {!loading && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold
                  ${allDone ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"}`}>
                  {Math.round((done / steps.length) * 100)}%
                </span>
              )}
            </div>

            {/* progress */}
            <div className="my-4 h-px w-full bg-gray-100">
              {!loading && (
                <div className="h-px bg-violet-400 transition-all duration-1000"
                     style={{ width:`${(done/steps.length)*100}%` }} />
              )}
            </div>

            <ul className="space-y-1">
              {loading
                ? [1,2,3,4].map(i => <Sk key={i} cls="h-12 w-full rounded-lg" />)
                : steps.map(item => (
                  <li key={item.key}
                      onClick={() => !item.done && item.to && nav(item.to)}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm
                        ${item.done ? "opacity-40" : item.to ? "cursor-pointer hover:bg-gray-50" : ""}`}>
                    {item.done
                      ? <CheckCircle2 size={17} className="text-green-500 shrink-0" />
                      : <Circle size={17} className="text-gray-200 shrink-0" />}
                    <span className={`flex-1 text-sm ${item.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {item.label}
                    </span>
                    {!item.done && item.to && <ChevronRight size={14} className="text-gray-300" />}
                  </li>
                ))
              }
            </ul>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-base font-semibold text-gray-800">Quick actions</p>
            <p className="text-sm text-gray-400 mt-0.5 mb-5">Jump to commonly used sections</p>
            <ul className="space-y-1">
              {actions.map(a => (
                <li key={a.label}>
                  <button onClick={() => nav(a.to)}
                    className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left hover:bg-gray-50 transition-colors group">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.ib}`}>
                      <a.Icon size={16} className={a.ic} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">{a.label}</p>
                      <p className="text-xs text-gray-400 truncate">{a.sub}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-200 group-hover:text-gray-400 shrink-0 transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Recent activity ──────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Recent documents */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <p className="text-base font-semibold text-gray-800">Recent documents</p>
              <button onClick={() => nav("/dashboard/documents")}
                className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700">
                View all <ArrowRight size={13} />
              </button>
            </div>
            {loading
              ? [1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 last:border-0">
                  <Sk cls="h-8 w-8 rounded shrink-0" />
                  <div className="flex-1 space-y-2"><Sk cls="h-4 w-2/3"/><Sk cls="h-3 w-1/3"/></div>
                </div>
              ))
              : rd.length === 0
              ? (
                <div className="flex flex-col items-center justify-center py-14">
                  <Database size={24} className="text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No documents uploaded yet</p>
                  <button onClick={() => nav("/dashboard/documents")} className="mt-2 text-sm text-violet-600 hover:underline">Upload now</button>
                </div>
              )
              : rd.map(doc => (
                <div key={doc._id} onClick={() => nav("/dashboard/documents")}
                  className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="h-8 w-8 shrink-0 rounded bg-blue-50 flex items-center justify-center">
                    <File size={14} className="text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-700">{doc.originalFileName}</p>
                    <p className="text-xs text-gray-400">{doc.chunkCount} chunks · {fmtBytes(doc.fileSize)} · {timeAgo(doc.createdAt)}</p>
                  </div>
                  <Chip status={doc.status} />
                </div>
              ))
            }
          </div>

          {/* Recent conversations */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <p className="text-base font-semibold text-gray-800">Recent conversations</p>
              <button onClick={() => nav("/dashboard/chats")}
                className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700">
                View all <ArrowRight size={13} />
              </button>
            </div>
            {loading
              ? [1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 last:border-0">
                  <Sk cls="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2"><Sk cls="h-4 w-2/3"/><Sk cls="h-3 w-1/3"/></div>
                </div>
              ))
              : rc.length === 0
              ? (
                <div className="flex flex-col items-center justify-center py-14">
                  <MessageSquare size={24} className="text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Chats appear once visitors use your widget</p>
                </div>
              )
              : rc.map(chat => (
                <div key={chat.sessionId} onClick={() => nav("/dashboard/chats")}
                  className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {chat.sessionId?.slice(0,2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-gray-700">{chat.lastMessage || "No messages"}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Clock size={11}/>{timeAgo(chat.lastActiveAt)} · {chat.messageCount} messages
                    </p>
                  </div>
                  <Chip status={chat.status} />
                </div>
              ))
            }
          </div>
        </div>

        {/* ── Refresh ── */}
        <div className="mt-8 flex justify-start">
          <button onClick={load}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-gray-500 transition-colors">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

      </div>
    </div>
  );
}