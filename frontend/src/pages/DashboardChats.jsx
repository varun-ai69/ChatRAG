import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare, Search, RefreshCw, ChevronLeft,
  ChevronRight, Clock, AlertCircle, CheckCircle2,
  Flag, ArrowRight, Database
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

function StatusChip({ status }) {
  const m = {
    active:   "bg-green-50 text-green-700 border border-green-200",
    resolved: "bg-blue-50 text-blue-700 border border-blue-200",
    flagged:  "bg-red-50 text-red-700 border border-red-200",
  };
  const icons = {
    active:   <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />,
    resolved: <CheckCircle2 size={10} className="mr-1" />,
    flagged:  <Flag size={10} className="mr-1" />,
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${m[status] || "bg-gray-100 text-gray-400 border border-gray-200"}`}>
      {icons[status]} {status}
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardChats() {
  const nav = useNavigate();
  const [chats, setChats]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");
  const [stats, setStats]         = useState(null);
  const LIMIT = 10;

  async function fetchStats() {
    try {
      const { data } = await api.get("/api/admin/home");
      setStats(data.stats);
    } catch {}
  }

  const fetchChats = useCallback(async (p = 1, s = "", st = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (s) params.set("search", s);
      if (st) params.set("status", st);
      const { data } = await api.get(`/api/admin/chats?${params}`);
      setChats(data.chats || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchChats(1, "", "");
  }, []);

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchChats(1, search, statusFilter); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  function handleStatus(val) { setStatus(val); setPage(1); fetchChats(1, search, val); }
  function handlePage(p) { setPage(p); fetchChats(p, search, statusFilter); }

  const statCards = [
    { label: "Total Sessions",  value: stats?.totalSessions,  dot: "bg-gray-400" },
    { label: "Total Messages",  value: stats?.totalMessages,  dot: "bg-violet-500" },
    { label: "Resolved",        value: stats?.resolvedChats,  dot: "bg-blue-500" },
    { label: "Flagged",         value: stats?.flaggedChats,   dot: "bg-red-400" },
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-white">
      <div className="w-full px-8 py-8 xl:px-12 xl:py-10">

        {/* ── Header ── */}
        <div className="mb-8 border-b border-gray-100 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 xl:text-4xl">Chat History</h1>
          <p className="mt-2 text-sm text-gray-400">
            Browse all visitor conversations — view, filter, and manage sessions.
          </p>
        </div>

        {/* ── Stats strip ── */}
        <div className="mb-8 grid grid-cols-2 gap-px rounded-xl border border-gray-300 bg-gray-300 overflow-hidden lg:grid-cols-4">
          {statCards.map((st) => (
            <div key={st.label} className="bg-white px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`h-2 w-2 rounded-full shrink-0 ${st.dot}`} />
                <span className="text-xs font-semibold text-gray-400">{st.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums xl:text-3xl">
                {st.value ?? <span className="text-gray-200">—</span>}
              </p>
            </div>
          ))}
        </div>

        {/* ── Search + Filter ── */}
        <div className="mb-5 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by last message..."
              className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => handleStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-colors"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="flagged">Flagged</option>
          </select>
          <button
            onClick={() => fetchChats(page, search, statusFilter)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* ── Sessions table ── */}
        <div className="rounded-xl border border-gray-200 bg-white">

          {/* header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 border-b border-gray-200 px-5 py-3 bg-gray-50">
            {["Last Message", "Messages", "Status", "Last Active", ""].map(h => (
              <p key={h} className="text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</p>
            ))}
          </div>

          {loading
            ? [1,2,3,4,5].map(i => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 items-center px-5 py-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <Sk cls="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5"><Sk cls="h-4 w-3/4" /><Sk cls="h-3 w-1/2" /></div>
                </div>
                <Sk cls="h-4 w-10" /><Sk cls="h-5 w-16" /><Sk cls="h-4 w-16" />
                <Sk cls="h-6 w-6 rounded-lg" />
              </div>
            ))
            : chats.length === 0
            ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                  <MessageSquare size={24} className="text-gray-300" />
                </div>
                <p className="text-base font-semibold text-gray-500">
                  {search || statusFilter ? "No sessions match your filters" : "No conversations yet"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {search || statusFilter ? "Try clearing filters" : "Chats will appear here once visitors use your widget"}
                </p>
              </div>
            )
            : chats.map(chat => (
              <div
                key={chat.sessionId}
                onClick={() => nav(`/dashboard/chats/${chat.sessionId}`)}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 items-center px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                {/* Last message */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {chat.sessionId?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {chat.lastMessage || <span className="text-gray-400 italic">No messages</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      Session {chat.sessionId?.slice(0, 8)}…
                    </p>
                  </div>
                </div>

                {/* Message count */}
                <p className="text-sm text-gray-600 tabular-nums">
                  {chat.messageCount ?? 0}
                </p>

                {/* Status */}
                <div><StatusChip status={chat.status} /></div>

                {/* Time */}
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock size={12} className="shrink-0" />
                  {timeAgo(chat.lastActiveAt)}
                </div>

                {/* Arrow */}
                <div className="flex justify-end">
                  <ArrowRight size={15} className="text-gray-200 group-hover:text-gray-400 transition-colors" />
                </div>
              </div>
            ))
          }
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePage(page - 1)} disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-xs text-gray-400 px-1">…</span>
                    )}
                    <button onClick={() => handlePage(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors
                        ${p === page ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {p}
                    </button>
                  </span>
                ))
              }
              <button onClick={() => handlePage(page + 1)} disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}