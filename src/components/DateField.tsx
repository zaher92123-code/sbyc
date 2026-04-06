"use client";
import Flatpickr from "react-flatpickr";
import { Arabic } from "flatpickr/dist/l10n/ar.js";
import "flatpickr/dist/flatpickr.min.css";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ChangeEvent } from "react";

type Props = {
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
};

export default function DateField({ value, defaultValue, onChange, min, max, name, placeholder, className, required }: Props) {
  const { lang } = useLanguage();
  return (
    <Flatpickr
      value={value || defaultValue || undefined}
      onChange={(dates) => {
        const d = dates[0];
        const iso = d
          ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
          : "";
        if (onChange) {
          onChange({ target: { value: iso, name: name || "" } } as ChangeEvent<HTMLInputElement>);
        }
      }}
      options={{
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true,
        minDate: min || undefined,
        maxDate: max || undefined,
        locale: lang === "ar" ? Arabic : undefined,
      }}
      placeholder={placeholder || "dd/mm/yyyy"}
      className={className || "form-input font-mono"}
      name={name}
      required={required}
    />
  );
}
