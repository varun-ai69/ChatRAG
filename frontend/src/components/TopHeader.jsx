import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, HelpCircle, LayoutGrid, LogOut, Settings, UserCircle } from "lucide-react";
import { clearAuth } from "../utils/auth";
import { useProfile } from "../hooks/useProfile";

function initialsFromName(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() || "?";
}

export default function TopHeader() {
  const navigate = useNavigate();
  const { data, loading } = useProfile();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const user = data?.user;
  const companyName = data?.company?.name ?? "";

  useEffect(() => {
    function handlePointerDown(e) {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function signOut() {
    setOpen(false);
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <header className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
      <div className="min-w-0">
        {loading && !companyName ? (
          <div className="space-y-2">
            <div className="h-7 w-56 max-w-[60vw] animate-pulse rounded-md bg-slate-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        ) : (
          <>
            <p className="truncate text-xl font-semibold tracking-tight text-[#2F3941]">
              {companyName || "Workspace"}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">Admin</p>
          </>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Apps"
        >
          <LayoutGrid className="h-6 w-6" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Help"
        >
          <HelpCircle className="h-6 w-6" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6" strokeWidth={1.75} />
        </button>
        <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-[#2F3941] transition hover:bg-slate-200"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            {initialsFromName(user?.name)}
          </button>

          {open && (
            <div
              className="absolute right-0 top-full z-50 mt-2 w-60 rounded-lg border border-slate-200 bg-white text-base shadow-lg"
              role="menu"
            >
              <div className="rounded-t-lg bg-slate-50 px-4 py-3">
                <p className="truncate font-semibold text-[#2F3941]">{user?.name ?? "User"}</p>
                <p className="mt-0.5 truncate text-sm text-slate-500">{user?.email ?? ""}</p>
              </div>
              <div className="border-t border-slate-200 py-1">
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-[#2F3941] hover:bg-slate-50"
                  onClick={() => {
                    setOpen(false);
                    navigate("/dashboard/profile");
                  }}
                >
                  <UserCircle className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={1.75} />
                  View Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-[#2F3941] hover:bg-slate-50"
                  onClick={() => {
                    setOpen(false);
                    navigate("/dashboard/settings");
                  }}
                >
                  <Settings className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={1.75} />
                  Settings
                </button>
                <div className="my-1 border-t border-slate-200" />
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-red-600 hover:bg-red-50"
                  onClick={signOut}
                >
                  <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
