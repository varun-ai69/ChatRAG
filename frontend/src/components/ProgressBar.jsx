export default function ProgressBar({ percent }) {
  return (
    <div className="h-[6px] w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-[#22c55e] transition-[width] duration-500 ease-out"
        style={{ width: `${percent}%` }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
