import { useEffect, useState } from "react";
import {
  Building2, Key, Copy, Check, Loader2,
  RefreshCw, AlertCircle, Eye, EyeOff, ShieldAlert
} from "lucide-react";
import { api } from "../utils/api";

function Sk({ cls = "" }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${cls}`} />;
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-3.5 bg-gray-50">
        <Icon size={14} className="text-gray-400" />
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export default function DashboardSettings() {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Company name
  const [companyName, setCompanyName] = useState("");
  const [savingName, setSavingName]   = useState(false);
  const [savedName, setSavedName]     = useState(false);
  const [nameError, setNameError]     = useState(null);

  // API key
  const [apiKey, setApiKey]           = useState("");
  const [plan, setPlan]               = useState("FREE");
  const [showKey, setShowKey]         = useState(false);
  const [copied, setCopied]           = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  async function fetchSettings() {
    setLoading(true); setError(null);
    try {
      const [settingsRes, keyRes] = await Promise.all([
        api.get("/api/admin/settings"),
        api.get("/api/admin/settings/api-key"),
      ]);
      setData(settingsRes.data);
      setCompanyName(settingsRes.data.company?.name || "");
      setApiKey(keyRes.data.apiKey || "");
      setPlan(keyRes.data.plan || "FREE");
    } catch { setError("Could not load settings."); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchSettings(); }, []);

  async function handleSaveName() {
    if (!companyName.trim()) return;
    setSavingName(true); setNameError(null);
    try {
      await api.put("/api/admin/settings/company", { name: companyName.trim() });
      setSavedName(true);
      setTimeout(() => setSavedName(false), 2500);
    } catch { setNameError("Failed to update company name."); }
    finally { setSavingName(false); }
  }

  async function handleRegenerate() {
    setRegenerating(true); setShowRegenConfirm(false);
    try {
      const { data } = await api.post("/api/admin/settings/regenerate-key");
      setApiKey(data.apiKey);
      setShowKey(true);
    } catch { setError("Failed to regenerate API key."); }
    finally { setRegenerating(false); }
  }

  function handleCopy() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const maskedKey = apiKey
    ? apiKey.slice(0, 10) + "•".repeat(Math.max(0, apiKey.length - 14)) + apiKey.slice(-4)
    : "";

  const planColors = {
    FREE:       "bg-gray-100 text-gray-500",
    PRO:        "bg-violet-50 text-violet-600",
    ENTERPRISE: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-white">
      <div className="w-full px-8 py-8 xl:px-12 xl:py-10 max-w-3xl">

        {/* ── Header ── */}
        <div className="mb-8 border-b border-gray-100 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 xl:text-4xl">Settings</h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage your company details and API credentials.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={15} className="shrink-0" /> {error}
            <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
          </div>
        )}

        <div className="space-y-4">

          {/* ── Company ── */}
          <Section title="Company" icon={Building2}>
            {loading ? (
              <div className="space-y-3">
                <Sk cls="h-4 w-24" />
                <Sk cls="h-10 w-full" />
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    Company name
                  </label>
                  <input
                    value={companyName}
                    onChange={e => { setCompanyName(e.target.value); setSavedName(false); }}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-colors"
                    placeholder="Your company name"
                  />
                  {nameError && (
                    <p className="mt-1.5 text-xs text-red-500">{nameError}</p>
                  )}
                </div>

                {/* User info — read only */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { label: "Name",  value: data?.user?.name  || "—" },
                    { label: "Email", value: data?.user?.email || "—" },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="mb-1 text-xs font-semibold text-gray-400">{f.label}</p>
                      <p className="rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  {nameError && <p className="text-xs text-red-500">{nameError}</p>}
                  <div className="ml-auto">
                    <button
                      onClick={handleSaveName}
                      disabled={savingName || !companyName.trim()}
                      className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {savingName
                        ? <Loader2 size={14} className="animate-spin" />
                        : savedName
                        ? <Check size={14} />
                        : null
                      }
                      {savingName ? "Saving…" : savedName ? "Saved" : "Save changes"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </Section>

          {/* ── API Key ── */}
          <Section title="API & Plan" icon={Key}>
            {loading ? (
              <div className="space-y-3">
                <Sk cls="h-4 w-16" />
                <Sk cls="h-11 w-full" />
                <Sk cls="h-9 w-32" />
              </div>
            ) : (
              <>
                {/* Plan badge */}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">Current plan</p>
                  <span className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${planColors[plan] || planColors.FREE}`}>
                    {plan}
                  </span>
                </div>

                {/* API Key display */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    API key
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                    <p className="flex-1 font-mono text-sm text-gray-700 truncate">
                      {showKey ? apiKey : maskedKey}
                    </p>
                    <button
                      onClick={() => setShowKey(v => !v)}
                      className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Use this key in your website's widget script as <span className="font-mono">data-api-key</span>.
                  </p>
                </div>

                {/* Regenerate */}
                {!showRegenConfirm ? (
                  <button
                    onClick={() => setShowRegenConfirm(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw size={13} />
                    Regenerate key
                  </button>
                ) : (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <ShieldAlert size={15} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">
                        Regenerating will invalidate your current key. Your embedded widget will stop working until you update the script.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {regenerating
                          ? <Loader2 size={12} className="animate-spin" />
                          : <RefreshCw size={12} />
                        }
                        {regenerating ? "Regenerating…" : "Yes, regenerate"}
                      </button>
                      <button
                        onClick={() => setShowRegenConfirm(false)}
                        className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Section>

        </div>
      </div>
    </div>
  );
}