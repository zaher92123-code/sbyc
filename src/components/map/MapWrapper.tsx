"use client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import YardMapSVG from "./YardMapSVG";

export default function MapWrapper() {
  const { lang } = useLanguage();
  return <YardMapSVG key={lang} />;
}
