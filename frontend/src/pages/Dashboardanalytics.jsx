import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileText, MessageSquare, TrendingDown, BarChart2,
  AlertCircle, RefreshCw, ChevronRight, X,
  Clock, Layers, CheckCircle2, Flag, Database,
  Users, Zap, Target
} from "lucide-react";
import { api } from "../utils/api";

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtBytes(b) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}
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
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fileExt(name = "") { return name.split(".").pop().toUpperCase().slice(0, 4); }
function extColor(name = "") {
  const ext = name.split(".").pop().toLowerCase();
  const map = {
    pdf: "bg-red-50 text-red-600", docx: "bg-blue-50 text-blue-600",
    doc: "bg-blue-50 text-blue-600", txt: "bg-gray-100 text-gray-500",
    xlsx: "bg-green-50 text-green-600", csv: "bg-emerald-50 text-emerald-600"
  };
  return map[ext] || "bg-violet-50 text-violet-600";
}

function Sk({ cls = "" }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${cls}`} />;
}

// ── Inline Spark Bar ───────────────────────────────────────────────────────────
function SparkBars({ data, color = "bg-violet-400" }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-px h-8">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end">
          <div
            className={`${color} rounded-sm opacity-80`}
            style={{ height: `${Math.max(2, (d.value / max) * 32)}px` }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function Drawer({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]">
      <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
          <p className="text-base font-semibold text-gray-900">{title}</p>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={17} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Section Card (clickable) ──────────────────────────────────────────────────
function SectionCard({ icon: Icon, iconBg, iconColor, title, subtitle, stat, statLabel, sparkData, sparkColor, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-xl border border-gray-200 bg-white p-5 text-left hover:border-violet-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </div>
        <ChevronRight size={15} className="text-gray-200 group-hover:text-violet-400 transition-colors mt-1" />
      </div>
      {loading ? (
        <>
          <Sk cls="h-7 w-20 mb-1" />
          <Sk cls="h-3.5 w-28 mb-4" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{stat}</p>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">{statLabel}</p>
        </>
      )}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        {!loading && sparkData && (
          <div className="shrink-0 w-20">
            <SparkBars data={sparkData} color={sparkColor} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">
        See details <ChevronRight size={11} />
      </div>
    </button>
  );
}

// ── Days filter ───────────────────────────────────────────────────────────────
function DaysFilter({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-gray-200 p-1">
      {[7, 14, 30].map(d => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors
            ${value === d ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
        >
          {d}d
        </button>
      ))}
    </div>
  );
}

// ── Mini Chart (canvas) ───────────────────────────────────────────────────────
function MiniLineChart({ data, color = "#7c3aed", height = 120 }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current || !data?.length) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const vals = data.map(d => d.value);
    const max = Math.max(...vals, 1);
    const min = Math.min(...vals, 0);
    const range = max - min || 1;
    const pad = { t: 10, r: 12, b: 24, l: 36 };
    const cw = W - pad.l - pad.r;
    const ch = H - pad.t - pad.b;

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "#f3f4f6";
    ctx.lineWidth = 1;
    [0, 0.5, 1].forEach(t => {
      const y = pad.t + ch * (1 - t);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    });

    // Line + fill
    const pts = data.map((d, i) => ({
      x: pad.l + (i / (data.length - 1 || 1)) * cw,
      y: pad.t + ch * (1 - (d.value - min) / range),
    }));

    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
    grad.addColorStop(0, color + "22");
    grad.addColorStop(1, color + "00");

    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, pad.t + ch);
    ctx.lineTo(pts[0].x, pad.t + ch);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // X labels (every ~5th)
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    data.forEach((d, i) => {
      if (i % Math.ceil(data.length / 5) === 0 || i === data.length - 1) {
        const label = d.label?.slice(5) || "";
        ctx.fillText(label, pts[i].x, H - 4);
      }
    });

    // Y labels
    ctx.textAlign = "right";
    [0, Math.round((max + min) / 2), max].forEach((v, i) => {
      const y = pad.t + ch * (1 - (v - min) / range);
      ctx.fillText(v, pad.l - 4, y + 3);
    });
  }, [data, color, height]);

  return (
    <div style={{ width: "100%", height }}>
      <canvas ref={ref} style={{ width: "100%", height }} />
    </div>
  );
}

// ── Peak Hours Bar Chart ──────────────────────────────────────────────────────
function PeakHoursChart({ data }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current || !data?.length) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = 140;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const vals = data.map(d => d.count);
    const max = Math.max(...vals, 1);
    const pad = { t: 10, r: 8, b: 28, l: 8 };
    const cw = W - pad.l - pad.r;
    const ch = H - pad.t - pad.b;
    const bw = cw / 24;

    ctx.clearRect(0, 0, W, H);

    data.forEach(d => {
      const x = pad.l + d.hour * bw;
      const bh = Math.max(2, (d.count / max) * ch);
      const y = pad.t + ch - bh;
      const isNight = d.hour < 6 || d.hour >= 22;
      ctx.fillStyle = isNight ? "#e5e7eb" : "#7c3aed22";
      ctx.beginPath();
      ctx.roundRect(x + 2, y, bw - 4, bh, 3);
      ctx.fill();

      ctx.fillStyle = isNight ? "#9ca3af" : "#7c3aed";
      ctx.beginPath();
      ctx.roundRect(x + 2, y, bw - 4, Math.min(bh, 4), [3, 3, 0, 0]);
      ctx.fill();
    });

    ctx.fillStyle = "#9ca3af";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "center";
    [0, 6, 12, 18, 23].forEach(h => {
      const x = pad.l + h * bw + bw / 2;
      ctx.fillText(h === 0 ? "12am" : h === 12 ? "12pm" : h < 12 ? `${h}am` : `${h - 12}pm`, x, H - 4);
    });
  }, [data]);

  return (
    <div style={{ width: "100%", height: 140 }}>
      <canvas ref={ref} style={{ width: "100%", height: 140 }} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardAnalytics() {
  const [days, setDays]           = useState(30);
  const [overview, setOverview]   = useState(null);
  const [msgPerDay, setMsgPerDay] = useState([]);
  const [sessPerDay, setSessPerDay] = useState([]);
  const [quality, setQuality]     = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [docStats, setDocStats]   = useState([]);
  const [fallbackQ, setFallbackQ] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [drawer, setDrawer]       = useState(null); // "messages"|"sessions"|"quality"|"documents"|"fallback"|"peak"
  const [error, setError]         = useState(null);

  const load = useCallback(async (d = days) => {
    setLoading(true); setError(null);
    try {
      const [ov, mpd, spd, rq, ph, ds, fq] = await Promise.all([
        api.get("/api/admin/analytics/overview").then(r => r.data),
        api.get(`/api/admin/analytics/messages-per-day?days=${d}`).then(r => r.data.data),
        api.get(`/api/admin/analytics/sessions-per-day?days=${d}`).then(r => r.data.data),
        api.get(`/api/admin/analytics/response-quality?days=${d}`).then(r => r.data.data),
        api.get("/api/admin/analytics/peak-hours").then(r => r.data.data),
        api.get("/api/admin/analytics/document-stats").then(r => r.data.data),
        api.get("/api/admin/analytics/top-fallback-queries").then(r => r.data.data),
      ]);
      setOverview(ov);
      setMsgPerDay(mpd || []);
      setSessPerDay(spd || []);
      setQuality(rq || []);
      setPeakHours(ph || []);
      setDocStats(ds || []);
      setFallbackQ(fq || []);
    } catch { setError("Could not load analytics data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(days); }, [days]);

  // ── Derived spark data ─────────────────────────────────────────────────────
  const msgSpark = msgPerDay
    .reduce((acc, d) => {
      const ex = acc.find(a => a.label === d._id.date);
      if (ex) ex.value += d.count;
      else acc.push({ label: d._id.date, value: d.count });
      return acc;
    }, [])
    .slice(-14);

  const sessSpark = sessPerDay.slice(-14).map(d => ({ label: d._id, value: d.sessions }));
  const qualSpark = quality.slice(-14).map(d => ({ label: d._id, value: parseFloat(d.fallbackRate?.toFixed(1) || 0) }));

  // ── Peak hours: fill all 24 ────────────────────────────────────────────────
  const peakFull = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: peakHours.find(d => d._id === i)?.count || 0,
  }));

  // ── Message chart data ─────────────────────────────────────────────────────
  const msgChartData = msgPerDay
    .reduce((acc, d) => {
      const ex = acc.find(a => a.label === d._id.date);
      if (ex) ex.value += d.count;
      else acc.push({ label: d._id.date, value: d.count });
      return acc;
    }, [])
    .sort((a, b) => a.label.localeCompare(b.label));

  const sessChartData = sessPerDay
    .map(d => ({ label: d._id, value: d.sessions }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const qualChartData = quality
    .map(d => ({ label: d._id, value: parseFloat((d.fallbackRate || 0).toFixed(1)) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const peakHour = peakFull.reduce((a, b) => b.count > a.count ? b : a, { hour: 0, count: 0 });

  // ── Drawer content renderers ───────────────────────────────────────────────
  function DrawerMessages() {
    const userMsgs = msgPerDay.filter(d => d._id.role === "user").reduce((s, d) => s + d.count, 0);
    const botMsgs  = msgPerDay.filter(d => d._id.role === "assistant").reduce((s, d) => s + d.count, 0);
    return (
      <>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "User messages",      value: userMsgs, color: "text-gray-800" },
            { label: "Bot messages",       value: botMsgs,  color: "text-violet-600" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Messages over time</p>
        <MiniLineChart data={msgChartData} color="#7c3aed" height={160} />
      </>
    );
  }

  function DrawerSessions() {
    const total = sessPerDay.reduce((s, d) => s + d.sessions, 0);
    const avg   = sessPerDay.length ? (total / sessPerDay.length).toFixed(1) : 0;
    return (
      <>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Total sessions",  value: total, color: "text-gray-800" },
            { label: "Avg per day",     value: avg,   color: "text-emerald-600" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Sessions over time</p>
        <MiniLineChart data={sessChartData} color="#10b981" height={160} />
      </>
    );
  }

  function DrawerQuality() {
    const avgFallback = quality.length
      ? (quality.reduce((s, d) => s + (d.fallbackRate || 0), 0) / quality.length).toFixed(1)
      : 0;
    return (
      <>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Total fallbacks",    value: overview?.fallbackCount ?? "—", color: "text-red-600" },
            { label: "Avg fallback rate",  value: `${avgFallback}%`,              color: "text-orange-500" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Fallback rate over time</p>
        <MiniLineChart data={qualChartData} color="#f97316" height={160} />
        {fallbackQ.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-6 mb-3">Top unanswered queries</p>
            <ul className="space-y-2">
              {fallbackQ.map((q, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 px-3 py-2.5">
                  <span className="mt-0.5 shrink-0 text-xs font-bold text-gray-300 tabular-nums w-4">{i + 1}</span>
                  <p className="flex-1 text-sm text-gray-700 min-w-0">{q._id}</p>
                  <span className="shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">{q.count}×</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </>
    );
  }

  function DrawerDocuments() {
    const maxChunks = Math.max(...docStats.map(d => d.chunkCount || 0), 1);
    return (
      <>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Total documents", value: overview?.totalDocuments ?? "—", color: "text-gray-800" },
            { label: "Total chunks",    value: (overview?.totalChunks || 0).toLocaleString(), color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Documents by chunk count</p>
        <ul className="space-y-2">
          {docStats.map((doc, i) => (
            <li key={doc._id} className="rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-[9px] font-bold ${extColor(doc.originalFileName)}`}>
                  {fileExt(doc.originalFileName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{doc.title || doc.originalFileName}</p>
                  <p className="text-xs text-gray-400">{fmtBytes(doc.fileSize)} · {timeAgo(doc.createdAt)}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-gray-700 tabular-nums">{doc.chunkCount}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div
                  className="h-1.5 rounded-full bg-blue-400"
                  style={{ width: `${((doc.chunkCount || 0) / maxChunks) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }

  function DrawerPeak() {
    const fmt = h => h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
    return (
      <>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Peak hour",       value: fmt(peakHour.hour),     color: "text-gray-800" },
            { label: "Messages at peak",value: peakHour.count,         color: "text-violet-600" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Traffic by hour of day</p>
        <PeakHoursChart data={peakFull} />
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-violet-400 inline-block" /> Day traffic</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-gray-200 inline-block" /> Night (10pm–6am)</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-6 mb-3">Hourly breakdown</p>
        <div className="grid grid-cols-4 gap-2">
          {peakFull.filter(d => d.count > 0).sort((a, b) => b.count - a.count).slice(0, 8).map(d => (
            <div key={d.hour} className="rounded-lg bg-gray-50 border border-gray-100 p-2 text-center">
              <p className="text-base font-bold text-gray-800 tabular-nums">{d.count}</p>
              <p className="text-[10px] text-gray-400">{fmt(d.hour)}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  const drawerMap = {
    messages:  { title: "Message analytics",        Component: DrawerMessages },
    sessions:  { title: "Session analytics",         Component: DrawerSessions },
    quality:   { title: "Response quality",          Component: DrawerQuality },
    documents: { title: "Knowledge base analytics",  Component: DrawerDocuments },
    peak:      { title: "Peak traffic hours",         Component: DrawerPeak },
  };

  const ActiveDrawer = drawer ? drawerMap[drawer]?.Component : null;

  return (
    <div className="h-full w-full overflow-y-auto bg-white">
      <div className="w-full px-8 py-8 xl:px-12 xl:py-10">

        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 xl:text-4xl">Analytics</h1>
            <p className="mt-2 text-sm text-gray-400">
              Performance metrics for your knowledge base and chatbot.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DaysFilter value={days} onChange={d => { setDays(d); load(d); }} />
            <button
              onClick={() => load(days)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={15} className="shrink-0" /> {error}
            <button onClick={() => load(days)} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        {/* ── Overview stat strip ── */}
        <div className="mb-8 grid grid-cols-2 gap-px rounded-xl border border-gray-300 bg-gray-300 overflow-hidden lg:grid-cols-4">
          {[
            { label: "Total sessions",  value: overview?.totalSessions,   dot: "bg-gray-400" },
            { label: "Total messages",  value: overview?.totalMessages,   dot: "bg-violet-500" },
            { label: "Fallback rate",   value: overview?.fallbackRate,    dot: "bg-orange-400" },
            { label: "Active docs",     value: overview?.activeDocuments, dot: "bg-green-500" },
          ].map((st) => (
            <div key={st.label} className="bg-white px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`h-2 w-2 rounded-full shrink-0 ${st.dot}`} />
                <span className="text-xs font-semibold text-gray-400">{st.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums xl:text-3xl">
                {loading ? <span className="text-gray-200">—</span> : (st.value ?? "—")}
              </p>
            </div>
          ))}
        </div>

        {/* ── Section Cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {/* Messages */}
          <SectionCard
            icon={MessageSquare}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
            title="Message volume"
            subtitle={`Last ${days} days activity`}
            stat={loading ? "—" : (overview?.totalMessages || 0).toLocaleString()}
            statLabel="total messages"
            sparkData={msgSpark}
            sparkColor="bg-violet-400"
            onClick={() => setDrawer("messages")}
            loading={loading}
          />

          {/* Sessions */}
          <SectionCard
            icon={Users}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
            title="Chat sessions"
            subtitle={`Last ${days} days`}
            stat={loading ? "—" : (overview?.totalSessions || 0).toLocaleString()}
            statLabel="total sessions"
            sparkData={sessSpark}
            sparkColor="bg-emerald-400"
            onClick={() => setDrawer("sessions")}
            loading={loading}
          />

          {/* Response quality */}
          <SectionCard
            icon={Target}
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
            title="Response quality"
            subtitle="Fallback rate trend"
            stat={loading ? "—" : (overview?.fallbackRate || "0%")}
            statLabel="avg fallback rate"
            sparkData={qualSpark}
            sparkColor="bg-orange-400"
            onClick={() => setDrawer("quality")}
            loading={loading}
          />

          {/* Knowledge base */}
          <SectionCard
            icon={Database}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            title="Knowledge base"
            subtitle="Docs & chunk distribution"
            stat={loading ? "—" : (overview?.totalChunks || 0).toLocaleString()}
            statLabel="indexed chunks"
            sparkData={null}
            onClick={() => setDrawer("documents")}
            loading={loading}
          />

          {/* Peak hours */}
          <SectionCard
            icon={Clock}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
            title="Peak traffic"
            subtitle="Busiest hours"
            stat={loading ? "—" : (() => { const h = peakHour.hour; return h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`; })()}
            statLabel="peak hour"
            sparkData={peakFull.slice(6, 22).map(d => ({ value: d.count }))}
            sparkColor="bg-indigo-400"
            onClick={() => setDrawer("peak")}
            loading={loading}
          />

          {/* Resolution rate */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
            </div>
            {loading ? (
              <>
                <Sk cls="h-7 w-20 mb-1" />
                <Sk cls="h-3.5 w-28 mb-4" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {overview?.totalSessions
                    ? Math.round(((overview.resolvedChats || 0) / overview.totalSessions) * 100) + "%"
                    : "—"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 mb-4">resolution rate</p>
              </>
            )}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Chat outcomes</p>
                <p className="text-xs text-gray-400 mt-0.5">Resolved vs flagged</p>
              </div>
            </div>
            {!loading && (
              <div className="mt-4 space-y-2">
                {[
                  { label: "Resolved", value: overview?.resolvedChats || 0, color: "bg-green-400", text: "text-green-700" },
                  { label: "Flagged",  value: overview?.flaggedChats   || 0, color: "bg-red-400",   text: "text-red-700" },
                ].map(s => {
                  const pct = overview?.totalSessions
                    ? Math.round((s.value / overview.totalSessions) * 100)
                    : 0;
                  return (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                        <span className="text-xs tabular-nums text-gray-500">{s.value} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ── Drawer ── */}
      {drawer && ActiveDrawer && (
        <Drawer title={drawerMap[drawer].title} onClose={() => setDrawer(null)}>
          <ActiveDrawer />
        </Drawer>
      )}
    </div>
  );
}