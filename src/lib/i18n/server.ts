import { cookies } from "next/headers";
import { T, type TranslationKey, type Lang } from "./translations";

export async function getT(): Promise<(key: TranslationKey) => string> {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("al-seeb-lang")?.value as Lang) || "en";
  return (key: TranslationKey) => T[key]?.[lang] ?? T[key]?.en ?? key;
}
