export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 bg-slate-200 rounded-lg" />
        <div className="h-10 w-32 bg-slate-200 rounded-lg" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="h-5 w-64 bg-slate-200 rounded" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-5 py-4 grid grid-cols-6 gap-4">
              <div className="col-span-2">
                <div className="h-4 w-36 bg-slate-200 rounded mb-1.5" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
              <div className="h-4 w-20 bg-slate-100 rounded self-center" />
              <div className="h-6 w-16 bg-slate-100 rounded-full self-center" />
              <div className="h-4 w-24 bg-slate-100 rounded self-center" />
              <div className="h-4 w-16 bg-slate-200 rounded self-center ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
