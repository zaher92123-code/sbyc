import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDatetime } from "@/lib/utils";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  boat_created:     { label: "Boat Created",    color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  boat_updated:     { label: "Boat Updated",    color: "bg-blue-100 text-blue-800 border-blue-200" },
  boat_deleted:     { label: "Boat Deleted",    color: "bg-red-100 text-red-800 border-red-200" },
  owner_created:    { label: "Owner Created",   color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  owner_updated:    { label: "Owner Updated",   color: "bg-blue-100 text-blue-800 border-blue-200" },
  owner_deleted:    { label: "Owner Deleted",   color: "bg-red-100 text-red-800 border-red-200" },
  session_created:  { label: "Session Created", color: "bg-teal-100 text-teal-800 border-teal-200" },
  session_extended: { label: "Session Extended",color: "bg-amber-100 text-amber-800 border-amber-200" },
  session_closed:   { label: "Session Closed",  color: "bg-slate-100 text-slate-700 border-slate-200" },
  session_updated:  { label: "Session Updated", color: "bg-blue-100 text-blue-800 border-blue-200" },
  payment_recorded: { label: "Payment",         color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  balance_adjusted: { label: "Adjustment",      color: "bg-purple-100 text-purple-800 border-purple-200" },
};

export default async function AuditLogsPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, user:users(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="text-sm text-slate-500">System action history — last 100 records</p>
        </div>
        <Link href="/settings" className="btn-secondary text-sm">← Settings</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Description</th>
                <th>Record</th>
              </tr>
            </thead>
            <tbody>
              {logs && logs.length > 0 ? (
                logs.map((log: any) => {
                  const meta = ACTION_LABELS[log.action];
                  return (
                    <tr key={log.id}>
                      <td className="text-xs text-slate-500 whitespace-nowrap font-mono">
                        {formatDatetime(log.created_at)}
                      </td>
                      <td>
                        <p className="text-sm font-semibold text-slate-800">
                          {log.user?.full_name || "System"}
                        </p>
                        <p className="text-xs text-slate-400">{log.user?.email}</p>
                      </td>
                      <td>
                        <span className={`badge text-xs ${meta?.color || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {meta?.label || log.action}
                        </span>
                      </td>
                      <td className="text-sm text-slate-600 max-w-xs">{log.description || "—"}</td>
                      <td className="font-mono text-xs text-slate-400">
                        {log.record_id ? log.record_id.slice(0, 8) + "…" : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No audit records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
