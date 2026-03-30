import { NavLink } from "react-router-dom";
import { BarChart2, FileText, Home, MessageSquare, UserCircle } from "lucide-react";

const TABS = [
  { to: "/dashboard", end: true, label: "Home", icon: Home },
  { to: "/dashboard/documents", label: "Docs", icon: FileText },
  { to: "/dashboard/chats", label: "Chats", icon: MessageSquare },
  { to: "/dashboard/analytics", label: "Stats", icon: BarChart2 },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

export default function MobileBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-[#F7F8F9] px-1 pb-[env(safe-area-inset-bottom)] pt-1 lg:hidden"
      aria-label="Mobile navigation"
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            [
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md py-2 text-[10px] font-medium transition-colors",
              isActive ? "text-[#0f766e]" : "text-slate-500",
            ].join(" ")
          }
        >
          <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
