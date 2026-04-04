import Link from "next/link";

interface Props {
  page: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
  totalItems?: number;
  pageSize?: number;
}

export default function ServerPagination({ page, totalPages, baseUrl, searchParams = {}, totalItems, pageSize }: Props) {
  if (totalPages <= 1) return null;

  function buildUrl(p: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    return `${baseUrl}?${params.toString()}`;
  }

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
      <div className="text-xs text-slate-400">
        {totalItems !== undefined && pageSize && (
          <>Showing {Math.min((page - 1) * pageSize + 1, totalItems)}–{Math.min(page * pageSize, totalItems)} of {totalItems}</>
        )}
      </div>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link href={buildUrl(page - 1)} className="px-2.5 py-1.5 text-xs rounded-lg font-semibold text-slate-500 hover:bg-slate-100 transition-colors">Prev</Link>
        ) : (
          <span className="px-2.5 py-1.5 text-xs rounded-lg font-semibold text-slate-300">Prev</span>
        )}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`d${i}`} className="px-1.5 text-xs text-slate-300">…</span>
          ) : (
            <Link key={p} href={buildUrl(p as number)}
              className={`w-8 h-8 text-xs rounded-lg font-semibold transition-colors inline-flex items-center justify-center ${
                p === page ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}>{p}</Link>
          )
        )}
        {page < totalPages ? (
          <Link href={buildUrl(page + 1)} className="px-2.5 py-1.5 text-xs rounded-lg font-semibold text-slate-500 hover:bg-slate-100 transition-colors">Next</Link>
        ) : (
          <span className="px-2.5 py-1.5 text-xs rounded-lg font-semibold text-slate-300">Next</span>
        )}
      </div>
    </div>
  );
}
