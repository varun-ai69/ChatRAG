/**
 * Metric card — Zendesk-style with optional soft teal glow.
 */
export default function StatCard({ icon: Icon, label, value, valueSuffix = "", subtitle, glow }) {
  return (
    <div
      className={`rounded-lg border bg-white p-6 transition-all duration-300 ${
        glow
          ? "border-teal-200/60 shadow-[0_0_0_1px_rgba(13,148,136,0.12),0_4px_20px_-4px_rgba(13,148,136,0.18)] hover:border-teal-300/80 hover:shadow-[0_0_0_1px_rgba(13,148,136,0.2),0_8px_28px_-6px_rgba(13,148,136,0.28)]"
          : "border-slate-200 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
              glow ? "bg-teal-50 text-teal-700" : "bg-slate-50 text-slate-500"
            }`}
          >
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className={`text-base font-medium ${glow ? "text-teal-800" : "text-[#1f73b7]"}`}>{label}</p>
          <p className="mt-1.5 text-3xl font-semibold tracking-tight text-[#2F3941]">
            {value}
            {valueSuffix}
          </p>
          {subtitle ? <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
}
