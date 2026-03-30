import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import {
  BarChart2,
  Bot,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  Home,
  MessageSquare,
  Settings,
  UserCircle,
} from "lucide-react";

const STORAGE_KEY = "sidebar_collapsed";

/** Expanded width — extra room so labels don’t feel tight and toggle doesn’t crowd content */
const WIDTH_EXPANDED = 280;
const WIDTH_COLLAPSED = 72;

const NAV_MAIN = [
  { to: "/dashboard", end: true, label: "Home", icon: Home },
  { to: "/dashboard/documents", label: "Documents", icon: FileText },
  { to: "/dashboard/chats", label: "Chat History", icon: MessageSquare },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/dashboard/chatbot", label: "Chatbot Editor", icon: Bot },
  { to: "/dashboard/api", label: "API & Script", icon: Code2 },
];

const NAV_BOTTOM = [
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

function navLinkClass({ isActive }, collapsed) {
  return [
    "mb-1 flex min-h-[48px] items-center gap-3 rounded-md border-l-[3px] px-3 text-base font-medium leading-snug transition-colors",
    collapsed ? "justify-center px-2" : "",
    isActive
      ? "border-[#0f766e] bg-[#E1F2F4] text-[#2F3941]"
      : "border-transparent text-[#2F3941]/80 hover:bg-slate-200/60",
  ].join(" ");
}

function NavItems({ collapsed, onCollapsedItemEnter, onCollapsedItemLeave }) {
  const linkHandlers = collapsed
    ? {
        onMouseEnter: (e, label) => onCollapsedItemEnter(label, e.currentTarget),
        onFocus: (e, label) => onCollapsedItemEnter(label, e.currentTarget),
        onMouseLeave: onCollapsedItemLeave,
        onBlur: onCollapsedItemLeave,
      }
    : {};

  return (
    <>
      <div className="flex-1 space-y-0 pt-2">
        {!collapsed && (
          <p className="mb-3 px-3 text-[13px] font-semibold uppercase tracking-wide text-slate-400">
            Workspace
          </p>
        )}
        {NAV_MAIN.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={(props) => navLinkClass(props, collapsed)}
            onMouseEnter={collapsed ? (e) => linkHandlers.onMouseEnter(e, label) : undefined}
            onMouseLeave={collapsed ? linkHandlers.onMouseLeave : undefined}
            onFocus={collapsed ? (e) => linkHandlers.onFocus(e, label) : undefined}
            onBlur={collapsed ? linkHandlers.onBlur : undefined}
          >
            <Icon className="h-6 w-6 shrink-0 text-current opacity-90" strokeWidth={1.75} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </div>
      <div className="space-y-0 border-t border-slate-200/80 pb-4 pt-3">
        {!collapsed && (
          <p className="mb-3 px-3 text-[13px] font-semibold uppercase tracking-wide text-slate-400">
            Account
          </p>
        )}
        {NAV_BOTTOM.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={(props) => navLinkClass(props, collapsed)}
            onMouseEnter={collapsed ? (e) => linkHandlers.onMouseEnter(e, label) : undefined}
            onMouseLeave={collapsed ? linkHandlers.onMouseLeave : undefined}
            onFocus={collapsed ? (e) => linkHandlers.onFocus(e, label) : undefined}
            onBlur={collapsed ? linkHandlers.onBlur : undefined}
          >
            <Icon className="h-6 w-6 shrink-0 text-current opacity-90" strokeWidth={1.75} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </div>
    </>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [collapsedTip, setCollapsedTip] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "true" : "false");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  function handleCollapsedItemEnter(label, el) {
    const r = el.getBoundingClientRect();
    setCollapsedTip({
      label,
      top: r.top + r.height / 2,
      left: r.right + 12,
    });
  }

  function handleCollapsedItemLeave() {
    setCollapsedTip(null);
  }

  useEffect(() => {
    if (!collapsed) setCollapsedTip(null);
  }, [collapsed]);

  const expandedW = `${WIDTH_EXPANDED}px`;
  const collapsedW = `${WIDTH_COLLAPSED}px`;

  return (
    <aside
      style={{ width: collapsed ? collapsedW : expandedW }}
      className={`relative hidden h-full min-h-0 shrink-0 flex-col border-r border-slate-200 bg-[#F7F8F9] transition-[width] duration-200 ease-in-out lg:flex`}
    >
      <div
        className={`relative flex h-[4.5rem] shrink-0 items-center border-b border-slate-200/90 bg-[#F7F8F9] ${
          collapsed ? "justify-center px-2" : "gap-3 pl-4 pr-10"
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-[#2F3941] shadow-sm">
          C
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1 truncate text-xl font-semibold tracking-tight text-[#2F3941]">
            ChatRAG
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="absolute right-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.12),0_1px_2px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 hover:shadow-md"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" strokeWidth={2} /> : <ChevronLeft className="h-4 w-4" strokeWidth={2} />}
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-2">
        <NavItems
          collapsed={collapsed}
          onCollapsedItemEnter={handleCollapsedItemEnter}
          onCollapsedItemLeave={handleCollapsedItemLeave}
        />
      </nav>

      {collapsed &&
        collapsedTip &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[9999] -translate-y-1/2"
            style={{ top: collapsedTip.top, left: collapsedTip.left }}
          >
            <div className="relative">
              <span
                className="absolute right-full top-1/2 mr-px -translate-y-1/2 border-y-[7px] border-r-[8px] border-y-transparent border-r-[#03363d]"
                aria-hidden
              />
              <div className="rounded-md bg-[#03363d] px-3.5 py-2 text-base font-medium leading-snug text-white shadow-lg">
                {collapsedTip.label}
              </div>
            </div>
          </div>,
          document.body
        )}
    </aside>
  );
}
