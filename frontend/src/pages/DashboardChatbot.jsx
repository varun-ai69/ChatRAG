import { useEffect, useRef, useState } from "react";
import {
    Bot, RefreshCw, RotateCcw, Check, Loader2,
    Palette, MessageSquare, User, Smile, Send,
    ChevronDown, AlertCircle, Sparkles
} from "lucide-react";
import { api } from "../utils/api";

// ── helpers ───────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}
function luminance({ r, g, b }) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}
function autoText(hex) {
    try { return luminance(hexToRgb(hex)) > 160 ? "#1a1a2e" : "#ffffff"; }
    catch { return "#ffffff"; }
}

// ── Color Swatch Picker ───────────────────────────────────────────────────────
function ColorField({ label, value, onChange }) {
    const id = label.replace(/\s+/g, "-").toLowerCase();
    return (
        <div className="flex items-center justify-between gap-3">
            <label htmlFor={id} className="text-sm text-gray-600 shrink-0">{label}</label>
            <div className="flex items-center gap-2">
                <div
                    className="h-7 w-7 rounded-lg border border-gray-200 cursor-pointer overflow-hidden"
                    style={{ background: value }}
                    onClick={() => document.getElementById(id)?.click()}
                />
                <input
                    id={id}
                    type="color"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="sr-only"
                />
                <span className="text-xs font-mono text-gray-400 w-16">{value}</span>
            </div>
        </div>
    );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
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

// ── Save button with state ────────────────────────────────────────────────────
function SaveBtn({ onClick, saving, saved }) {
    return (
        <button
            onClick={onClick}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
            {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
    );
}

// ── Live Chatbot Preview ──────────────────────────────────────────────────────
function ChatPreview({ config }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { role: "bot", text: config.welcomeMessage || `Hi! I'm ${config.name}. How can I help you?` },
        { role: "user", text: "What are your business hours?" },
        { role: "bot", text: "We're open Monday–Friday, 9am to 6pm. Is there anything else I can help with?" },
    ]);
    const bottomRef = useRef();

    // Update welcome message when config changes
    useEffect(() => {
        setMessages(prev => {
            const updated = [...prev];
            updated[0] = { role: "bot", text: config.welcomeMessage || `Hi! I'm ${config.name}. How can I help you?` };
            return updated;
        });
    }, [config.welcomeMessage, config.name]);

    function sendDemo() {
        if (!input.trim()) return;
        setMessages(prev => [
            ...prev,
            { role: "user", text: input },
            { role: "bot", text: "This is a live preview — connect your knowledge base to see real answers." },
        ]);
        setInput("");
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }

    const hdrBg = config.headerBg || config.primaryColor || "#6C63FF";
    const hdrText = autoText(hdrBg);
    const botBg = config.botBubbleColor || "#f0efff";
    const botText = config.botTextColor || "#1a1a2e";
    const userBg = config.userBubbleColor || config.primaryColor || "#6C63FF";
    const userText = config.userTextColor || "#ffffff";

    return (
        <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-200 shadow-lg"
            style={{ height: 520, width: "100%", maxWidth: 360, fontFamily: "system-ui, sans-serif" }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 shrink-0" style={{ background: hdrBg }}>
                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ background: hdrText === "#ffffff" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}>
                    {config.avatar
                        ? <img src={config.avatar} alt="" className="h-full w-full object-cover" />
                        : <Bot size={16} style={{ color: hdrText }} />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: hdrText }}>
                        {config.name || "Assistant"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                        <p className="text-[10px]" style={{ color: hdrText, opacity: 0.75 }}>Online</p>
                    </div>
                </div>
                <div className="h-7 w-7 flex items-center justify-center rounded-full cursor-pointer"
                    style={{ background: hdrText === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)" }}>
                    <ChevronDown size={14} style={{ color: hdrText }} />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        {msg.role === "bot" && (
                            <div className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center mb-0.5"
                                style={{ background: botBg, border: `1px solid ${botBg}` }}>
                                {config.avatar
                                    ? <img src={config.avatar} alt="" className="h-full w-full object-cover rounded-full" />
                                    : <Bot size={11} style={{ color: botText }} />
                                }
                            </div>
                        )}
                        <div
                            className="max-w-[72%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                            style={msg.role === "bot"
                                ? { background: botBg, color: botText, borderBottomLeftRadius: 4 }
                                : { background: userBg, color: userText, borderBottomRightRadius: 4 }
                            }
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-gray-100 bg-white px-3 py-2.5">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendDemo()}
                        placeholder="Type a message…"
                        className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400"
                    />
                    <button
                        onClick={sendDemo}
                        className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-colors"
                        style={{ background: config.primaryColor || "#6C63FF" }}
                    >
                        <Send size={12} style={{ color: autoText(config.primaryColor || "#6C63FF") }} />
                    </button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-gray-300">Powered by your knowledge base</p>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardChatbot() {
    const [config, setConfig] = useState(null);
    const [draft, setDraft] = useState(null);   // local edits
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [error, setError] = useState(null);
    const [dirty, setDirty] = useState(false);

    async function fetchConfig() {
        setLoading(true); setError(null);
        try {
            const { data } = await api.get("/api/admin/chatbot/preview");
            setConfig(data.preview);
            setDraft(data.preview);
        } catch { setError("Could not load chatbot config."); }
        finally { setLoading(false); }
    }

    useEffect(() => { fetchConfig(); }, []);

    function update(key, val) {
        setDraft(prev => ({ ...prev, [key]: val }));
        setDirty(true);
        setSaved(false);
    }

    // Auto-sync text colors when bubble colors change
    function updateBotBubble(val) {
        setDraft(prev => ({ ...prev, botBubbleColor: val, botTextColor: autoText(val) }));
        setDirty(true); setSaved(false);
    }
    function updateUserBubble(val) {
        setDraft(prev => ({ ...prev, userBubbleColor: val, userTextColor: autoText(val) }));
        setDirty(true); setSaved(false);
    }
    function updateHeader(val) {
        setDraft(prev => ({ ...prev, headerBg: val, primaryColor: val }));
        setDirty(true); setSaved(false);
    }

    async function handleSave() {
        if (!dirty) return;
        setSaving(true);
        try {
            await api.put("/api/admin/chatbot", {
                botName: draft.name,
                welcomeMessage: draft.welcomeMessage,
                primaryColor: draft.primaryColor,
                botBubbleColor: draft.botBubbleColor,
                botTextColor: draft.botTextColor,
                headerBg: draft.headerBg,
                userBubbleColor: draft.userBubbleColor,
                userTextColor: draft.userTextColor,
                avatar: draft.avatar,
            });
            setConfig({ ...draft });
            setDirty(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch { setError("Failed to save changes."); }
        finally { setSaving(false); }
    }

    async function handleReset() {
        setResetting(true);
        try {
            await api.post("/api/admin/chatbot/reset");
            await fetchConfig();
            setDirty(false); setSaved(false);
        } catch { setError("Failed to reset."); }
        finally { setResetting(false); }
    }

    if (loading) {
        return (
            <div className="h-full w-full overflow-y-auto bg-white">
                <div className="w-full px-8 py-8 xl:px-12 xl:py-10">
                    <div className="mb-8 border-b border-gray-100 pb-8">
                        <div className="h-9 w-48 animate-pulse rounded-lg bg-gray-100 mb-2" />
                        <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-36 w-full animate-pulse rounded-xl bg-gray-100" />)}
                        </div>
                        <div className="h-[520px] w-full animate-pulse rounded-2xl bg-gray-100" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-white">
            <div className="w-full px-8 py-8 xl:px-12 xl:py-10">

                {/* ── Header ── */}
                <div className="mb-8 flex items-start justify-between border-b border-gray-100 pb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 xl:text-4xl">Chatbot</h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Customize how your chatbot looks and feels on your website.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleReset}
                            disabled={resetting}
                            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {resetting
                                ? <Loader2 size={13} className="animate-spin" />
                                : <RotateCcw size={13} />
                            }
                            Reset
                        </button>
                        <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        <AlertCircle size={15} className="shrink-0" /> {error}
                        <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
                    </div>
                )}

                {/* ── Split layout ── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px]">

                    {/* ── LEFT: Controls ── */}
                    <div className="space-y-4 min-w-0">

                        {/* Identity */}
                        <Section title="Identity" icon={Bot}>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Bot name</label>
                                <input
                                    value={draft.name || ""}
                                    onChange={e => update("name", e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-colors"
                                    placeholder="e.g. Aria, Support Bot…"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Avatar URL</label>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 shrink-0 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {draft.avatar
                                            ? <img src={draft.avatar} alt="" className="h-full w-full object-cover" onError={e => e.target.style.display = "none"} />
                                            : <Bot size={18} className="text-gray-300" />
                                        }
                                    </div>
                                    <input
                                        value={draft.avatar || ""}
                                        onChange={e => update("avatar", e.target.value)}
                                        className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-colors"
                                        placeholder="https://…"
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* Welcome message */}
                        <Section title="Welcome message" icon={MessageSquare}>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                                    First message visitors see
                                </label>
                                <textarea
                                    value={draft.welcomeMessage || ""}
                                    onChange={e => update("welcomeMessage", e.target.value)}
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-colors"
                                    placeholder="Hi! How can I help you today?"
                                />
                                <p className="mt-1.5 text-xs text-gray-400">
                                    {(draft.welcomeMessage || "").length}/200 characters
                                </p>
                            </div>
                        </Section>

                        {/* Colors */}
                        <Section title="Colors" icon={Palette}>
                            <div className="space-y-3.5">
                                <ColorField
                                    label="Header & accent"
                                    value={draft.headerBg || draft.primaryColor || "#6C63FF"}
                                    onChange={updateHeader}
                                />
                                <div className="h-px bg-gray-100" />
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-300">Bot bubble</p>
                                <ColorField
                                    label="Background"
                                    value={draft.botBubbleColor || "#f0efff"}
                                    onChange={updateBotBubble}
                                />
                                <ColorField
                                    label="Text"
                                    value={draft.botTextColor || "#1a1a2e"}
                                    onChange={v => update("botTextColor", v)}
                                />
                                <div className="h-px bg-gray-100" />
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-300">User bubble</p>
                                <ColorField
                                    label="Background"
                                    value={draft.userBubbleColor || "#6C63FF"}
                                    onChange={updateUserBubble}
                                />
                                <ColorField
                                    label="Text"
                                    value={draft.userTextColor || "#ffffff"}
                                    onChange={v => update("userTextColor", v)}
                                />
                            </div>

                            {/* Color presets */}
                            <div>
                                <p className="mb-2.5 text-xs font-semibold text-gray-400">Quick presets</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: "Violet", h: "#6C63FF", b: "#f0efff", u: "#6C63FF" },
                                        { label: "Slate", h: "#1e293b", b: "#f1f5f9", u: "#1e293b" },
                                        { label: "Rose", h: "#e11d48", b: "#fff1f2", u: "#e11d48" },
                                        { label: "Teal", h: "#0d9488", b: "#f0fdfa", u: "#0d9488" },
                                        { label: "Amber", h: "#d97706", b: "#fffbeb", u: "#d97706" },
                                        { label: "Blue", h: "#2563eb", b: "#eff6ff", u: "#2563eb" },
                                    ].map(p => (
                                        <button
                                            key={p.label}
                                            onClick={() => {
                                                setDraft(prev => ({
                                                    ...prev,
                                                    headerBg: p.h,
                                                    primaryColor: p.h,
                                                    botBubbleColor: p.b,
                                                    botTextColor: autoText(p.b),
                                                    userBubbleColor: p.u,
                                                    userTextColor: autoText(p.u),
                                                }));
                                                setDirty(true); setSaved(false);
                                            }}
                                            className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="h-3.5 w-3.5 rounded-full border border-gray-200 shrink-0" style={{ background: p.h }} />
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Section>

                    </div>

                    {/* ── RIGHT: Live preview ── */}
                    <div className="lg:sticky lg:top-8 self-start">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                            </div>
                            <p className="text-xs font-semibold text-gray-500">Live preview</p>
                            <p className="text-xs text-gray-300">· updates instantly</p>
                        </div>

                        <div className="flex justify-center lg:justify-start">
                            <ChatPreview config={draft || config} />
                        </div>

                        {dirty && (
                            <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                                <p className="text-xs font-medium text-amber-700">You have unsaved changes</p>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                                    Save
                                </button>
                            </div>
                        )}

                        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                            <div className="flex items-start gap-2.5">
                                <Sparkles size={13} className="text-gray-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Changes are reflected instantly in the preview. Hit <span className="font-semibold text-gray-600">Save changes</span> to push them live to your embedded widget.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}