import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatOMR } from "@/lib/utils";
import { EmptyState, Badge } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { IconEmployee } from "@/components/ui/Icons";

export default async function EmployeesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const t = await getT();
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("employees").select("*").order("name_en");
  if (params.q) query = query.or(`name_en.ilike.%${params.q}%,name_ar.ilike.%${params.q}%,civil_id.ilike.%${params.q}%`);
  if (params.status && params.status !== "all") query = query.eq("employment_status", params.status);
  const { data: employees } = await query;

  const activeCount = employees?.filter((e) => e.employment_status === "active").length ?? 0;
  const totalSalary = employees?.filter((e) => e.employment_status === "active")
    .reduce((sum, e) => sum + Number(e.base_salary_omr) + Number(e.allowances_omr) - Number(e.deductions_omr), 0) ?? 0;

  const statusVariant: Record<string, "success" | "warning" | "danger"> = {
    active: "success",
    on_leave: "warning",
    terminated: "danger",
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("employees")}</h1>
          <p className="text-sm text-slate-500">
            {activeCount} {t("activeEmployees")} · {t("totalMonthlySalary")}: {formatOMR(totalSalary)}
          </p>
        </div>
        <Link href="/employees/new" className="btn-primary">{t("addEmployee")}</Link>
      </div>

      <div className="card px-5 py-4 flex gap-3">
        <form method="get" className="flex-1 flex gap-3">
          <input name="q" defaultValue={params.q} placeholder={t("searchEmployeePlaceholder")} className="form-input flex-1" />
          <select name="status" defaultValue={params.status || "all"} className="form-input w-40">
            <option value="all">{t("allStatuses")}</option>
            <option value="active">{t("active")}</option>
            <option value="on_leave">{t("onLeave")}</option>
            <option value="terminated">{t("terminated")}</option>
          </select>
          <button type="submit" className="btn-primary">{t("search")}</button>
          <Link href="/employees" className="btn-secondary">{t("clear")}</Link>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>{t("employeeName")}</th>
                <th>{t("position")}</th>
                <th>{t("phone")}</th>
                <th>{t("status")}</th>
                <th>{t("netSalary")}</th>
                <th>{t("hireDate")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees && employees.length > 0 ? (
                employees.map((emp: any) => {
                  const net = Number(emp.base_salary_omr) + Number(emp.allowances_omr) - Number(emp.deductions_omr);
                  return (
                    <tr key={emp.id}>
                      <td>
                        <Link href={`/employees/${emp.id}`} className="font-semibold text-slate-900 hover:text-teal-700">
                          {emp.name_en}
                        </Link>
                        {emp.name_ar && <p className="text-xs text-slate-400">{emp.name_ar}</p>}
                      </td>
                      <td className="text-sm text-slate-600">{emp.position_en || "—"}</td>
                      <td className="text-sm text-slate-600 font-mono">{emp.phone || "—"}</td>
                      <td>
                        <Badge variant={statusVariant[emp.employment_status] || "default"} className="text-[10px]">
                          {emp.employment_status === "active" ? t("active") :
                           emp.employment_status === "on_leave" ? t("onLeave") : t("terminated")}
                        </Badge>
                      </td>
                      <td className="num font-semibold text-slate-800">{formatOMR(net)}</td>
                      <td className="text-sm text-slate-600">{emp.hire_date ? formatDate(emp.hire_date) : "—"}</td>
                      <td>
                        <Link href={`/employees/${emp.id}`} className="btn-ghost text-xs py-1">{t("view")} →</Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={<IconEmployee size={40} className="opacity-40" />} title={t("noEmployeesFound")} />
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
