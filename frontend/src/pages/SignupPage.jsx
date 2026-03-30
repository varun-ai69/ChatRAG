import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import ProgressBar from "../components/ProgressBar";
import StepForm from "../components/StepForm";
import { api } from "../utils/api";
import { saveAuth } from "../utils/auth";

const INITIAL = {
  name: "",
  email: "",
  companyName: "",
  botName: "",
  welcomeMessage: "",
  password: "",
};

const STEPS = [
  {
    pct: 20,
    question: "What's your name?",
    helper: "This is how we'll greet you in the product.",
    field: "name",
    type: "text",
    placeholder: "Jane Doe",
  },
  {
    pct: 40,
    question: "What's your work email?",
    helper: "We'll use this for login and important updates.",
    field: "email",
    type: "email",
    placeholder: "you@company.com",
  },
  {
    pct: 55,
    question: "What company do you work for?",
    helper: "Your workspace and bot will live under this organization.",
    field: "companyName",
    type: "text",
    placeholder: "Acme Inc.",
  },
  {
    pct: 70,
    question: "What will your chatbot be called?",
    helper: "Visitors will see this name in the chat widget.",
    field: "botName",
    type: "text",
    placeholder: "Support Assistant",
  },
  {
    pct: 85,
    question: "Set a welcome message for visitors",
    helper: "Optional — a short greeting when someone opens the chat.",
    field: "welcomeMessage",
    type: "textarea",
    placeholder: "Hi! I'm here to help answer questions from our docs.",
  },
  {
    pct: 100,
    question: "Create a password",
    helper: "At least 8 characters. You can show or hide it below.",
    field: "password",
    type: "password",
    placeholder: "••••••••",
  },
];

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
}

const inputClass =
  "w-full rounded-xl border-[1.5px] border-slate-200 bg-white px-4 py-3.5 text-base text-[#0f0f1a] outline-none transition-colors placeholder:text-slate-400 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20";

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL);
  const [fieldError, setFieldError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const current = STEPS[step - 1];
  const field = current.field;

  function validateCurrent() {
    const v = String(formData[field] ?? "").trim();

    if (field !== "welcomeMessage" && !v) {
      setFieldError("This field is required.");
      return false;
    }

    if (field === "email" && !isValidEmail(v)) {
      setFieldError("Enter a valid email address.");
      return false;
    }
    if (field === "password" && v.length < 8) {
      setFieldError("Password must be at least 8 characters.");
      return false;
    }
    setFieldError("");
    return true;
  }

  function handleNext() {
    setSubmitError("");
    if (!validateCurrent()) return;
    if (step < 6) {
      setStep((s) => s + 1);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validateCurrent()) return;

    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register-company", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        companyName: formData.companyName.trim(),
        botName: formData.botName.trim(),
        welcomeMessage: formData.welcomeMessage.trim(),
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
        "Something went wrong. Please try again.";
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setFieldError("");
    setSubmitError("");
    if (step > 1) setStep((s) => s - 1);
  }

  function updateField(value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldError) setFieldError("");
    if (submitError) setSubmitError("");
  }

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-[420px]">
          <p className="text-center text-sm text-slate-500">
            Step {step} of {STEPS.length}
          </p>
          <div className="mt-2">
            <ProgressBar percent={current.pct} />
          </div>

          <form
            onSubmit={step === 6 ? handleSubmit : (e) => e.preventDefault()}
            className="mt-8"
            noValidate
          >
            <StepForm stepKey={step}>
              <h2 className="text-2xl font-bold text-[#0f0f1a]">{current.question}</h2>
              <p className="mt-2 text-sm text-slate-500">{current.helper}</p>

              <div className="mt-6">
                {current.type === "textarea" ? (
                  <textarea
                    id={field}
                    name={field}
                    rows={4}
                    value={formData[field]}
                    onChange={(e) => updateField(e.target.value)}
                    placeholder={current.placeholder}
                    className={`${inputClass} resize-y min-h-[120px] ${
                      fieldError ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                    }`}
                    autoComplete="off"
                  />
                ) : current.type === "password" ? (
                  <div className="relative">
                    <input
                      id={field}
                      name={field}
                      type={showPassword ? "text" : "password"}
                      value={formData[field]}
                      onChange={(e) => updateField(e.target.value)}
                      placeholder={current.placeholder}
                      className={`${inputClass} pr-12 ${
                        fieldError || submitError
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-[#6C63FF]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                ) : (
                  <input
                    id={field}
                    name={field}
                    type={current.type}
                    value={formData[field]}
                    onChange={(e) => updateField(e.target.value)}
                    placeholder={current.placeholder}
                    className={`${inputClass} ${
                      fieldError ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                    }`}
                    autoComplete={
                      field === "email" ? "email" : field === "name" ? "name" : "organization"
                    }
                  />
                )}

                {fieldError && <p className="mt-2 text-sm text-red-600">{fieldError}</p>}
                {step === 6 && submitError && (
                  <p className="mt-2 text-sm text-red-600">{submitError}</p>
                )}
              </div>
            </StepForm>

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1 || loading}
                className="rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-[#6C63FF] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5548e8]"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#6C63FF] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5548e8] disabled:opacity-60"
                >
                  {loading ? "Creating…" : "Create your account →"}
                </button>
              )}
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#6C63FF] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
