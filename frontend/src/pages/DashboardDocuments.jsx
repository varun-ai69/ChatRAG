import { useEffect, useRef, useState, useCallback } from "react";
import {
  Upload, Search, Filter, FileText, File, Trash2,
  RefreshCw, Edit3, Check, X, ChevronLeft, ChevronRight,
  AlertCircle, Database, MoreVertical, ArrowUpFromLine,
  FileUp, Loader2
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
function fileExt(name = "") {
  return name.split(".").pop().toUpperCase().slice(0, 4);
}
function extColor(name = "") {
  const ext = name.split(".").pop().toLowerCase();
  const map = { pdf: "bg-red-50 text-red-600", docx: "bg-blue-50 text-blue-600",
    doc: "bg-blue-50 text-blue-600", txt: "bg-gray-100 text-gray-500",
    xlsx: "bg-green-50 text-green-600", xls: "bg-green-50 text-green-600",
    csv: "bg-emerald-50 text-emerald-600" };
  return map[ext] || "bg-violet-50 text-violet-600";
}

function Sk({ cls = "" }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${cls}`} />;
}

function StatusChip({ status }) {
  const m = {
    ACTIVE:     "bg-green-50 text-green-700 border border-green-200",
    PROCESSING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    FAILED:     "bg-red-50 text-red-700 border border-red-200",
    DELETED:    "bg-gray-100 text-gray-400 border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${m[status] || "bg-gray-100 text-gray-400 border border-gray-200"}`}>
      {status}
    </span>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const ACCEPTED = ".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv";

  function addFiles(newFiles) {
    const arr = Array.from(newFiles);
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...arr.filter(f => !names.has(f.name))];
    });
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleUpload() {
    if (!files.length) return;
    setUploading(true);
    const form = new FormData();
    files.forEach(f => form.append("files", f));
    try {
      const { data } = await api.post("/api/upload/ingestion", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(data.results || []);
      setFiles([]);
      onSuccess();
    } catch (err) {
      setResults([{ file: "Upload", status: "FAILED", error: err?.response?.data?.error || "Upload failed" }]);
    } finally {
      setUploading(false);
    }
  }

  const done = results.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-gray-200 bg-white shadow-2xl">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-base font-semibold text-gray-900">Upload documents</p>
            <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX, TXT, XLSX, CSV supported</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {!done ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 cursor-pointer transition-colors
                  ${drag ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-violet-300 hover:bg-gray-50"}`}
              >
                <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
                  <FileUp size={22} className="text-violet-500" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Drop files here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, XLSX, CSV · Max 50MB each</p>
                <input ref={inputRef} type="file" multiple accept={ACCEPTED} className="hidden"
                  onChange={e => addFiles(e.target.files)} />
              </div>

              {/* File list */}
              {files.length > 0 && (
                <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {files.map((f, i) => (
                    <li key={f.name} className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5">
                      <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-bold ${extColor(f.name)}`}>
                        {fileExt(f.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-700">{f.name}</p>
                        <p className="text-xs text-gray-400">{fmtBytes(f.size)}</p>
                      </div>
                      <button onClick={() => removeFile(i)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Actions */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!files.length || uploading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? <><Loader2 size={15} className="animate-spin" />Processing...</> : <><Upload size={15} />Upload {files.length > 0 && `(${files.length})`}</>}
                </button>
              </div>
            </>
          ) : (
            /* Results */
            <>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((r, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-3">
                    <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center
                      ${r.status === "SUCCESS" ? "bg-green-50" : r.status === "SKIPPED_DUPLICATE" ? "bg-yellow-50" : "bg-red-50"}`}>
                      {r.status === "SUCCESS"
                        ? <Check size={13} className="text-green-600" />
                        : r.status === "SKIPPED_DUPLICATE"
                        ? <AlertCircle size={13} className="text-yellow-600" />
                        : <X size={13} className="text-red-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-700">{r.file}</p>
                      <p className="text-xs text-gray-400">
                        {r.status === "SUCCESS" ? `${r.totalChunks} chunks indexed`
                          : r.status === "SKIPPED_DUPLICATE" ? "Already uploaded"
                          : "Failed to process"}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded
                      ${r.status === "SUCCESS" ? "bg-green-50 text-green-700"
                        : r.status === "SKIPPED_DUPLICATE" ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"}`}>
                      {r.status === "SUCCESS" ? "Done" : r.status === "SKIPPED_DUPLICATE" ? "Skipped" : "Failed"}
                    </span>
                  </li>
                ))}
              </ul>
              <button onClick={onClose} className="mt-5 w-full py-2.5 rounded-lg bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Rename inline ─────────────────────────────────────────────────────────────
function RenameInput({ initial, onSave, onCancel }) {
  const [val, setVal] = useState(initial);
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  function save() { if (val.trim() && val.trim() !== initial) onSave(val.trim()); else onCancel(); }
  return (
    <div className="flex items-center gap-2">
      <input ref={ref} value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") onCancel(); }}
        className="flex-1 rounded-lg border border-violet-300 px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-violet-200"
      />
      <button onClick={save} className="p-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800"><Check size={13}/></button>
      <button onClick={onCancel} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"><X size={13}/></button>
    </div>
  );
}

// ── Row actions menu ──────────────────────────────────────────────────────────
function ActionsMenu({ doc, onRename, onReindex, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    function click(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
        <MoreVertical size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
          <button onClick={() => { setOpen(false); onRename(); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
            <Edit3 size={14} className="text-gray-400" /> Rename
          </button>
          {doc.status === "FAILED" && (
            <button onClick={() => { setOpen(false); onReindex(); }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <RefreshCw size={14} className="text-gray-400" /> Re-index
            </button>
          )}
          <div className="my-1 border-t border-gray-100" />
          <button onClick={() => { setOpen(false); onDelete(); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ doc, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="w-full max-w-sm mx-4 rounded-2xl border border-gray-200 bg-white shadow-2xl p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 mb-4">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <p className="text-base font-semibold text-gray-900">Delete document?</p>
        <p className="mt-1.5 text-sm text-gray-500">
          <span className="font-medium text-gray-700">{doc.title || doc.originalFileName}</span> will be permanently removed from your knowledge base and vector database.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardDocuments() {
  const [docs, setDocs]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [stats, setStats]         = useState(null);
  const LIMIT = 10;

  async function fetchStats() {
    try {
      const { data } = await api.get("/api/admin/home");
      setStats(data.stats);
    } catch {}
  }

  const fetchDocs = useCallback(async (p = page, s = search, st = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (s) params.set("search", s);
      if (st) params.set("status", st);
      const { data } = await api.get(`/api/admin/documents?${params}`);
      setDocs(data.documents || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchStats(); fetchDocs(1, search, statusFilter); }, []);

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchDocs(1, search, statusFilter); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  function handleStatusChange(val) {
    setStatus(val); setPage(1); fetchDocs(1, search, val);
  }

  function handlePage(p) {
    setPage(p); fetchDocs(p, search, statusFilter);
  }

  async function handleRename(id, title) {
    setActionLoading(l => ({ ...l, [id]: true }));
    try {
      await api.put(`/api/admin/documents/${id}/rename`, { title });
      setDocs(prev => prev.map(d => d._id === id ? { ...d, title } : d));
    } catch {}
    finally { setActionLoading(l => ({ ...l, [id]: false })); setRenamingId(null); }
  }

  async function handleDelete(id) {
    setActionLoading(l => ({ ...l, [id]: true }));
    try {
      await api.delete(`/api/admin/documents/${id}`);
      setDeleteTarget(null);
      fetchDocs(page, search, statusFilter);
      fetchStats();
    } catch {}
    finally { setActionLoading(l => ({ ...l, [id]: false })); }
  }

  async function handleReindex(id) {
    setActionLoading(l => ({ ...l, [id]: true }));
    try {
      await api.post(`/api/admin/documents/${id}/reindex`);
      fetchDocs(page, search, statusFilter);
    } catch {}
    finally { setActionLoading(l => ({ ...l, [id]: false })); }
  }

  const statCards = [
    { label: "Total",      value: stats?.totalDocuments,  dot: "bg-gray-400" },
    { label: "Active",     value: stats?.activeDocuments, dot: "bg-green-500" },
    { label: "Chunks",     value: stats?.totalChunks,     dot: "bg-violet-500" },
    { label: "Failed",     value: stats?.failedDocuments ?? 0, dot: "bg-red-400" },
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-white">
      <div className="w-full px-8 py-8 xl:px-12 xl:py-10">

        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 xl:text-4xl">Documents</h1>
            <p className="mt-2 text-sm text-gray-400">
              Manage your knowledge base — upload, rename, or remove documents.
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shrink-0"
          >
            <Upload size={15} /> Upload
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div className="mb-8 grid grid-cols-2 gap-px rounded-xl border border-gray-300 bg-gray-300 overflow-hidden lg:grid-cols-4">
          {statCards.map((st, i) => (
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
              placeholder="Search documents..."
              className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => handleStatusChange(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-colors"
          >
            <option value="">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
          <button onClick={() => fetchDocs(page, search, statusFilter)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-gray-200 bg-white">

          {/* table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_48px] gap-4 border-b border-gray-200 px-5 py-3 bg-gray-50">
            {["Name", "Status", "Chunks", "Size", "Uploaded", ""].map(h => (
              <p key={h} className="text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</p>
            ))}
          </div>

          {/* rows */}
          {loading
            ? [1,2,3,4,5].map(i => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_48px] gap-4 items-center px-5 py-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3"><Sk cls="h-8 w-8 rounded-lg shrink-0"/><Sk cls="h-4 w-40"/></div>
                <Sk cls="h-5 w-16"/><Sk cls="h-4 w-10"/><Sk cls="h-4 w-14"/><Sk cls="h-4 w-16"/>
                <Sk cls="h-7 w-7 rounded-lg"/>
              </div>
            ))
            : docs.length === 0
            ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                  <Database size={24} className="text-gray-300" />
                </div>
                <p className="text-base font-semibold text-gray-500">
                  {search || statusFilter ? "No documents match your filters" : "No documents yet"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {search || statusFilter ? "Try clearing filters" : "Upload your first document to get started"}
                </p>
                {!search && !statusFilter && (
                  <button onClick={() => setShowUpload(true)}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
                    <Upload size={14} /> Upload document
                  </button>
                )}
              </div>
            )
            : docs.map(doc => (
              <div key={doc._id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_48px] gap-4 items-center px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">

                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-[9px] font-bold ${extColor(doc.originalFileName)}`}>
                    {fileExt(doc.originalFileName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    {renamingId === doc._id
                      ? <RenameInput
                          initial={doc.title || doc.originalFileName}
                          onSave={t => handleRename(doc._id, t)}
                          onCancel={() => setRenamingId(null)}
                        />
                      : <>
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {doc.title || doc.originalFileName}
                          </p>
                          {doc.title && doc.title !== doc.originalFileName && (
                            <p className="truncate text-xs text-gray-400">{doc.originalFileName}</p>
                          )}
                        </>
                    }
                  </div>
                </div>

                {/* Status */}
                <div><StatusChip status={doc.status} /></div>

                {/* Chunks */}
                <p className="text-sm text-gray-600 tabular-nums">{doc.chunkCount ?? "—"}</p>

                {/* Size */}
                <p className="text-sm text-gray-400">{fmtBytes(doc.fileSize)}</p>

                {/* Date */}
                <p className="text-sm text-gray-400">{timeAgo(doc.createdAt)}</p>

                {/* Actions */}
                <div className="flex items-center justify-end">
                  {actionLoading[doc._id]
                    ? <Loader2 size={15} className="animate-spin text-gray-400" />
                    : <ActionsMenu
                        doc={doc}
                        onRename={() => setRenamingId(doc._id)}
                        onReindex={() => handleReindex(doc._id)}
                        onDelete={() => setDeleteTarget(doc)}
                      />
                  }
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
              <button
                onClick={() => handlePage(page - 1)}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span key={`e${p}`} className="text-xs text-gray-400">…</span>
                    )}
                    <button key={p} onClick={() => handlePage(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors
                        ${p === page ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {p}
                    </button>
                  </>
                ))
              }
              <button
                onClick={() => handlePage(page + 1)}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => { fetchDocs(1, search, statusFilter); fetchStats(); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          doc={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}