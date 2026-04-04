"use client";
import { IconCalendar } from "@/components/ui/Icons";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

interface Props {
  selectedMonth: string;
  monthOptions: { value: string; label: string }[];
  monthLabel: string;
}

export default function MonthPicker({ selectedMonth, monthOptions, monthLabel }: Props) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  return (
    <div className="card px-5 py-4 flex items-center gap-4">
      <span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5"><IconCalendar size={15} /> {t("selectMonth")}</span>
      <select
        value={selectedMonth}
        onChange={e => router.push(`/reports?report=monthly&month=${e.target.value}`)}
        className="form-select w-56 font-semibold"
      >
        {monthOptions.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="text-xs text-slate-400">{t("showingDataFor")} {monthLabel}</span>
    </div>
  );
}
