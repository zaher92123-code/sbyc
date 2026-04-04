import Link from "next/link";

import { IconAnchor } from "@/components/ui/Icons";
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-6">
        <div className="mb-6 flex justify-center"><IconAnchor size={80} className="text-teal-400 opacity-60" /></div>
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-3">Page Not Found</h2>
        <p className="text-slate-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
