import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../utils/api";
import { saveAuth } from "../utils/auth";

const inputClass =
  "w-full rounded-xl border-[1.5px] border-slate-200 bg-white px-4 py-3.5 text-base text-[#0f0f1a] outline-none transition-colors placeholder:text-slate-400 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  function validate() {
    const next = { email: "", password: "" };
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email.";
    if (!password) next.password = "Password is required.";
    setFieldErrors(next);
    return !next.email && !next.password;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", {
        email: email.trim(),
        password,
      });
      saveAuth({
        token: data.token,
        apiKey: data.apiKey,
        user: data.user,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-[420px]">
          <h1 className="text-2xl font-bold text-[#0f0f1a]">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage your RAG chatbot.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: "" }));
                  if (error) setError("");
                }}
                placeholder="you@company.com"
                className={`${inputClass} ${fieldErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                autoComplete="email"
              />
              {fieldErrors.email && <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: "" }));
                    if (error) setError("");
                  }}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12 ${fieldErrors.password || error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-[#6C63FF]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {(fieldErrors.password || (!fieldErrors.email && error)) && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.password || error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#6C63FF] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5548e8] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-[#6C63FF] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
