export default function ComingSoonPage({ title = "Coming soon" }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center">
      <h2 className="text-xl font-bold text-[#0f0f1a]">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        This section is under construction. Check back soon.
      </p>
      </div>
    </div>
  );
}
