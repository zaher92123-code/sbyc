export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="stat-card">
            <div className="w-10 h-10 rounded-xl bg-slate-200 mb-3" />
            <div className="h-7 w-24 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="h-5 w-48 bg-slate-200 rounded" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="px-5 py-4 flex gap-4">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
