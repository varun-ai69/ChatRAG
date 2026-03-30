import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Clock, MessageSquare, Globe, Monitor,
  Download, CheckCircle2, Flag, AlertCircle,
  Bot, User, RefreshCw, Loader2
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
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function shortId(id = "") { return id.slice(0, 8).toUpperCase(); }

function Sk({ cls = "" }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${cls}`} />;
}

function StatusChip({ status }) {
  const m = {
    active:   "bg-green-50 text-green-700 border border-green-200",
    resolved: "bg-blue-50 text-blue-700 border border-blue-200",
    flagged:  "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${m[status] || "bg-gray-100 text-gray-400 border border-gray-200"}`}>
      {status}
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ChatDetail() {
  const { sessionId } = useParams();
  const nav = useNavigate();

  const [chat, setChat]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  async function fetchChat() {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get(`/api/admin/chats/${sessionId}`);
      setChat(data.chat);
    } catch {
      setError("Could not load this conversation.");
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchChat(); }, [sessionId]);

  async function updateStatus(status) {
    setStatusUpdating(true);
    try {
      await api.put(`/api/admin/chats/${sessionId}/status`, { status });
      setChat(prev => ({ ...prev, status }));
    } catch {}
    finally { setStatusUpdating(false); }
  }

  async function exportCSV() {
    try {
      const res = await api.get(`/api/admin/chats/${sessionId}/export`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = `chat-${sessionId}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  const messages = chat?.messages || [];
  const userMsgs = messages.filter(m => m.role === "user").length;
  const botMsgs  = messages.filter(m => m.role === "assistant").length;
  const fallbacks= messages.filter(m => m.isFallback).length;

  return (
    <div className="h-full w-full overflow-hidden bg-white flex flex-col">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => nav("/dashboard/chats")}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Session {shortId(sessionId)}
            </p>
            {chat && (
              <p className="text-xs text-gray-400 mt-0.5">
                {fmtDate(chat.createdAt)}
              </p>
            )}
          </div>
          {chat && <StatusChip status={chat.status} />}
        </div>

        {/* actions */}
        <div className="flex items-center gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={fetchChat}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Body: chat + sidebar ── */}
      {error ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle size={16} /> {error}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">

          {/* ── Chat messages (left) ── */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
            {loading
              ? [1,2,3,4,5].map(i => (
                <div key={i} className={`flex items-end gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                  <Sk cls="h-7 w-7 rounded-full shrink-0" />
                  <Sk cls={`h-14 rounded-2xl ${i % 2 === 0 ? "w-56" : "w-72"}`} />
                </div>
              ))
              : messages.length === 0
              ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare size={28} className="text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No messages in this session</p>
                </div>
              )
              : messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div key={i} className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : ""}`}>

                    {/* avatar */}
                    <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white
                      ${isUser ? "bg-gray-800" : "bg-violet-500"}`}>
                      {isUser ? <User size={13} /> : <Bot size={13} />}
                    </div>

                    {/* bubble */}
                    <div className={`max-w-[65%] group relative`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
                        ${isUser
                          ? "bg-gray-900 text-white rounded-br-sm"
                          : msg.isFallback
                          ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-sm"
                          : "bg-gray-50 text-gray-800 border border-gray-200 rounded-bl-sm"
                        }`}>
                        {msg.text}
                        {msg.isFallback && (
                          <span className="ml-2 inline-flex items-center text-[10px] font-bold uppercase text-red-500">
                            fallback
                          </span>
                        )}
                      </div>
                      <p className={`mt-1 text-[10px] text-gray-400 ${isUser ? "text-right" : ""}`}>
                        {timeAgo(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            }
          </div>

          {/* ── Sidebar (right) ── */}
          <div className="w-72 shrink-0 border-l border-gray-200 overflow-y-auto">

            {/* Session info */}
            <div className="border-b border-gray-100 px-5 py-5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">Session info</p>
              {loading
                ? <div className="space-y-3"><Sk cls="h-4 w-full"/><Sk cls="h-4 w-3/4"/><Sk cls="h-4 w-2/3"/></div>
                : (
                  <dl className="space-y-3">
                    {[
                      { label: "Session ID", value: shortId(sessionId) },
                      { label: "Created",    value: fmtDate(chat?.createdAt) },
                      { label: "Last active",value: timeAgo(chat?.lastActiveAt) },
                      { label: "Page URL",   value: chat?.meta?.pageUrl || "—" },
                      { label: "IP",         value: chat?.meta?.ip || "—" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
                        <dd className="mt-0.5 text-xs text-gray-700 break-all">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )
              }
            </div>

            {/* Message stats */}
            <div className="border-b border-gray-100 px-5 py-5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">Message stats</p>
              {loading
                ? <div className="space-y-2"><Sk cls="h-4 w-full"/><Sk cls="h-4 w-3/4"/></div>
                : (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "User",     value: userMsgs,  color: "text-gray-800" },
                      { label: "Bot",      value: botMsgs,   color: "text-violet-600" },
                      { label: "Fallback", value: fallbacks, color: "text-red-500" },
                    ].map(st => (
                      <div key={st.label} className="rounded-lg bg-gray-50 px-2 py-3 text-center">
                        <p className={`text-lg font-bold tabular-nums ${st.color}`}>{st.value}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{st.label}</p>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>

            {/* Status update */}
            <div className="px-5 py-5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Update status</p>
              <div className="space-y-2">
                {[
                  { value: "active",   label: "Active",   Icon: MessageSquare, color: "text-green-600",  bg: "hover:bg-green-50  border-green-200" },
                  { value: "resolved", label: "Resolved", Icon: CheckCircle2,  color: "text-blue-600",   bg: "hover:bg-blue-50   border-blue-200" },
                  { value: "flagged",  label: "Flagged",  Icon: Flag,          color: "text-red-600",    bg: "hover:bg-red-50    border-red-200" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateStatus(opt.value)}
                    disabled={statusUpdating || chat?.status === opt.value}
                    className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors
                      ${chat?.status === opt.value
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-default"
                        : `border-gray-200 ${opt.bg} ${opt.color}`
                      }`}
                  >
                    {statusUpdating && chat?.status !== opt.value
                      ? <Loader2 size={14} className="animate-spin" />
                      : <opt.Icon size={14} />
                    }
                    {opt.label}
                    {chat?.status === opt.value && (
                      <span className="ml-auto text-[10px] font-bold uppercase text-gray-400">Current</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}