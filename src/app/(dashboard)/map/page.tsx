import MapWrapper from "@/components/map/MapWrapper";
import { MARINA_CONFIG } from "@/config/marina";
import { getT } from "@/lib/i18n/server";

export default async function MapPage() {
  const t = await getT();
  return (
    <div className="h-[calc(100vh-108px)] flex flex-col gap-4">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold font-display text-slate-900">
          {MARINA_CONFIG.name} — {t("marinaMapTitle")}
        </h1>
        <p className="text-sm text-slate-500">{t("location")}</p>
      </div>
      <div className="flex-1 min-h-0">
        <MapWrapper />
      </div>
    </div>
  );
}
