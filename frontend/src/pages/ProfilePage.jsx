import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "../utils/api";
import { invalidateProfileCache, useProfile } from "../hooks/useProfile";

function initialsFromName(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() || "?";
}

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#2F3941] outline-none transition-shadow focus:border-[#1f73b7] focus:ring-1 focus:ring-[#1f73b7]";

export default function ProfilePage() {
  const { data, loading, refetch } = useProfile();
  const [activeTab, setActiveTab] = useState("account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [accountToast, setAccountToast] = useState({ ok: false, text: "" });

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: "", text: "" });

  const closePasswordModal = useCallback(() => {
    setPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwdMessage({ type: "", text: "" });
  }, []);

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name ?? "");
      setEmail(data.user.email ?? "");
    }
  }, [data]);

  useEffect(() => {
    if (!accountToast.text) return;
    const t = setTimeout(() => setAccountToast({ ok: false, text: "" }), 4000);
    return () => clearTimeout(t);
  }, [accountToast]);

  useEffect(() => {
    if (!passwordModalOpen) return;
    function onKey(e) {
      if (e.key === "Escape") closePasswordModal();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [passwordModalOpen, closePasswordModal]);

  function handleCancelAccount() {
    if (data?.user) {
      setName(data.user.name ?? "");
      setEmail(data.user.email ?? "");
    }
    setAccountToast({ ok: false, text: "" });
  }

  async function handleSaveAccount(e) {
    e.preventDefault();
    setSaving(true);
    setAccountToast({ ok: false, text: "" });
    try {
      await api.put("/api/admin/profile", { name: name.trim(), email: email.trim() });
      invalidateProfileCache();
      await refetch();
      setAccountToast({ ok: true, text: "Profile saved successfully." });
    } catch (err) {
      setAccountToast({
        ok: false,
        text: err.response?.data?.message || err.message || "Could not save profile.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwdMessage({ type: "", text: "" });

    if (newPassword.length < 8) {
      setPwdMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword.toLowerCase() === String(email).trim().toLowerCase()) {
      setPwdMessage({ type: "error", text: "Password must be different from your email address." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPwdSaving(true);
    try {
      const { data: res } = await api.put("/api/admin/profile/password", {
        currentPassword,
        newPassword,
      });
      setPwdMessage({ type: "success", text: res?.message || "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        closePasswordModal();
      }, 800);
    } catch (err) {
      setPwdMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Could not update password.",
      });
    } finally {
      setPwdSaving(false);
    }
  }

  const user = data?.user;
  const roleLabel = (() => {
    const r = (user?.role ?? "admin").toString().toLowerCase();
    if (r === "owner") return "Account owner";
    if (r === "admin") return "Administrator";
    return user?.role
      ? String(user.role)
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Administrator";
  })();

  if (loading && !data) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 animate-pulse space-y-6">
          <div className="h-10 w-64 rounded bg-slate-200" />
          <div className="h-10 w-full max-w-md rounded bg-slate-100" />
          <div className="h-48 max-w-2xl rounded-lg border border-slate-100 bg-slate-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Scrollable profile content */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-[#2F3941]">
              {initialsFromName(user?.name)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold capitalize text-[#2F3941]">
                {user?.name ?? "—"}
              </h1>
              <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-8 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              activeTab === "account"
                ? "text-[#1f73b7]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Account
            {activeTab === "account" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#1f73b7]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              activeTab === "roles"
                ? "text-[#1f73b7]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Roles and access
            {activeTab === "roles" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#1f73b7]" />
            )}
          </button>
        </div>

        {activeTab === "account" && (
          <form id="profile-account-form" onSubmit={handleSaveAccount} className="max-w-2xl space-y-8">
            <div>
              <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-[#2F3941]">
                Name
              </label>
              <input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="mb-2 block text-sm font-medium text-[#2F3941]">
                Email
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Security emails only go to the primary email address.
              </p>
              <div className="relative">
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} pr-24`}
                  autoComplete="email"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Primary
                </span>
              </div>
              <button
                type="button"
                className="mt-2 text-sm font-medium text-[#1f73b7] hover:underline"
                disabled
                title="Coming soon"
              >
                Add an email
              </button>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <label className="mb-3 block text-sm font-medium text-[#2F3941]">Password</label>
              <button
                type="button"
                onClick={() => {
                  setPwdMessage({ type: "", text: "" });
                  setPasswordModalOpen(true);
                }}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#2F3941] shadow-sm transition hover:bg-slate-50"
              >
                Change password
              </button>
            </div>

            {accountToast.text && (
              <p
                className={`text-sm ${accountToast.ok ? "text-emerald-600" : "text-red-600"}`}
                role="status"
              >
                {accountToast.text}
              </p>
            )}
          </form>
        )}

        {activeTab === "roles" && (
          <div className="max-w-2xl rounded-lg border border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
            <p className="text-sm text-slate-600">
              Roles and permissions for this workspace are managed by your organization. Contact an
              administrator if you need different access.
            </p>
          </div>
        )}
      </div>

      {/* Sticky action bar — stays at bottom of main column while sidebar stays fixed */}
      {activeTab === "account" && (
        <div className="shrink-0 border-t border-slate-200 bg-white py-4">
          <div className="flex max-w-2xl justify-end gap-4">
            <button
              type="button"
              onClick={handleCancelAccount}
              className="text-sm font-medium text-[#1f73b7] hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-account-form"
              disabled={saving}
              className="rounded-md bg-[#1f73b7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#185a9c] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Change password modal */}
      {passwordModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closePasswordModal();
          }}
        >
          <div className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
              <h2 id="password-modal-title" className="text-lg font-semibold text-[#2F3941]">
                Change password
              </h2>
              <button
                type="button"
                onClick={closePasswordModal}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-slate-600 transition hover:bg-sky-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="px-6 py-5">
              <div className="space-y-5">
                <div>
                  <label htmlFor="modal-current-pw" className="mb-2 block text-sm font-medium text-[#2F3941]">
                    Current password
                  </label>
                  <input
                    id="modal-current-pw"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label htmlFor="modal-new-pw" className="mb-2 block text-sm font-medium text-[#2F3941]">
                    New password
                  </label>
                  <input
                    id="modal-new-pw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                  />
                  <ul className="mt-2 space-y-1 text-xs text-slate-500">
                    <li>Must be at least 8 characters</li>
                    <li>Must be different from your email address</li>
                  </ul>
                </div>
                <div>
                  <label htmlFor="modal-confirm-pw" className="mb-2 block text-sm font-medium text-[#2F3941]">
                    Confirm new password
                  </label>
                  <input
                    id="modal-confirm-pw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {pwdMessage.text && (
                <p
                  className={`mt-4 text-sm ${pwdMessage.type === "success" ? "text-emerald-600" : "text-red-600"}`}
                >
                  {pwdMessage.text}
                </p>
              )}

              <div className="mt-8 flex justify-end gap-4 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="text-sm font-medium text-[#1f73b7] hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwdSaving}
                  className="rounded-md bg-[#1f73b7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#185a9c] disabled:opacity-50"
                >
                  {pwdSaving ? "Saving…" : "Change password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
