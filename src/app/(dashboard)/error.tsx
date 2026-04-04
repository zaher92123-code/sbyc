"use client";
import { IconWarning } from "@/components/ui/Icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center max-w-md px-6">
        <div className="mb-4 flex justify-center"><IconWarning size={60} className="text-amber-500 opacity-70" /></div>
        <h2 className="text-xl font-bold text-slate-900 font-display mb-2">Something went wrong</h2>
        <p className="text-slate-500 text-sm mb-6">{error.message || "An unexpected error occurred."}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-primary"
          >
            Try Again
          </button>
          <a href="/dashboard" className="btn-secondary">
            Go to Dashboard
          </a>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-slate-400 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
