export default function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg border border-slate-200 bg-white p-5 ${className}`}
    >
      <div className="flex gap-3">
        <div className="mt-1 h-[18px] w-[18px] rounded bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-8 w-20 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
