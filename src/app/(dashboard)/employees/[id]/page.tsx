import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatOMR } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import SalarySection from "@/components/employees/SalarySection";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const supabase = await createClient();

  const { data: employee } = await supabase.from("employees").select("*").eq("id", id).single();
  if (!employee) notFound();

  const net = Number(employee.base_salary_omr) + Number(employee.allowances_omr) - Number(employee.deductions_omr);

  const statusVariant: Record<string, "success" | "warning" | "danger"> = {
    active: "success", on_leave: "warning", terminated: "danger",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/employees" className="btn-ghost text-xs">{t("back")}</Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-slate-900">{employee.name_en}</h1>
              <Badge variant={statusVariant[employee.employment_status] || "default"} className="text-[10px]">
                {employee.employment_status === "active" ? t("active") :
                 employee.employment_status === "on_leave" ? t("onLeave") : t("terminated")}
              </Badge>
            </div>
            {employee.name_ar && <p className="text-sm text-slate-500">{employee.name_ar}</p>}
            <p className="text-sm text-slate-400">{employee.position_en}{employee.department ? ` · ${employee.department}` : ""}</p>
          </div>
        </div>
        <Link href={`/employees/${id}/edit`} className="btn-secondary text-sm">{t("edit")}</Link>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("personalInfo")}</h2>
          {[
            { label: t("civilId"),       value: employee.civil_id },
            { label: t("phone"),         value: employee.phone },
            { label: t("email"),         value: employee.email },
            { label: t("hireDate"),      value: employee.hire_date ? formatDate(employee.hire_date) : null },
            { label: t("department"),    value: employee.department },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400 font-semibold">{label}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || "—"}</p>
            </div>
          ))}
          {(employee.emergency_contact_name || employee.emergency_contact_phone) && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{t("emergencyContact")}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{employee.emergency_contact_name || "—"}</p>
              <p className="text-xs text-slate-500 font-mono">{employee.emergency_contact_phone || "—"}</p>
            </div>
          )}
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("salaryInfo")}</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("baseSalary")}</span>
              <span className="num font-semibold">{formatOMR(employee.base_salary_omr)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("allowances")}</span>
              <span className="num font-semibold text-emerald-600">+{formatOMR(employee.allowances_omr)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("deductions")}</span>
              <span className="num font-semibold text-red-600">-{formatOMR(employee.deductions_omr)}</span>
            </div>
            <div className="h-px bg-slate-200 my-2" />
            <div className="flex justify-between">
              <span className="font-bold text-slate-700">{t("netSalary")}</span>
              <span className="num text-lg font-black text-teal-700">{formatOMR(net)}</span>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("bankInfo")}</h2>
          <div>
            <p className="text-xs text-slate-400 font-semibold">{t("bankName")}</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{employee.bank_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">{t("bankAccount")}</p>
            <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">{employee.bank_account_number || "—"}</p>
          </div>
          {employee.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{t("notes")}</p>
              <p className="text-sm text-slate-600 mt-1">{employee.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Salary History with Add Form */}
      <SalarySection
        employeeId={id}
        baseSalary={Number(employee.base_salary_omr)}
        allowances={Number(employee.allowances_omr)}
        deductions={Number(employee.deductions_omr)}
      />
    </div>
  );
}
