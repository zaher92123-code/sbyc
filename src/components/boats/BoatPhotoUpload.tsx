"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";
import { IconBoat } from "@/components/ui/Icons";

interface Props {
  boatId?: string;
  currentPhotoUrl?: string | null;
  onPhotoChange?: (url: string | null) => void;
}

export default function BoatPhotoUpload({ boatId, currentPhotoUrl, onPhotoChange }: Props) {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Use JPG, PNG, or WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB.");
      return;
    }

    setError("");
    setUploading(true);

    // If we have a boatId, upload immediately
    if (boatId) {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(`/api/boats/${boatId}/photo`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      setUploading(false);

      if (!res.ok) {
        setError(result.error || "Upload failed");
        return;
      }

      setPhotoUrl(result.photo_url);
      onPhotoChange?.(result.photo_url);
    } else {
      // Preview only (for new boat form — upload after creation)
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
        onPhotoChange?.(reader.result as string);
      };
      reader.readAsDataURL(file);
      setUploading(false);
    }

    // Reset input
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleRemove() {
    if (boatId) {
      await fetch(`/api/boats/${boatId}/photo`, { method: "DELETE" });
    }
    setPhotoUrl(null);
    onPhotoChange?.(null);
  }

  return (
    <div className="space-y-2">
      <label className="form-label">{t("boatPhoto")}</label>
      <div className="flex items-start gap-4">
        {/* Photo preview */}
        <div
          className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 flex-shrink-0"
          style={photoUrl ? { borderStyle: "solid", borderColor: "#0e7490" } : {}}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Boat"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center">
              <IconBoat size={32} className="text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 mt-1">{t("noPhoto")}</p>
            </div>
          )}
        </div>

        {/* Upload controls */}
        <div className="space-y-2 pt-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary text-xs"
          >
            {uploading ? t("uploading") : photoUrl ? t("changePhoto") : t("uploadPhoto")}
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-red-600 hover:text-red-700 font-semibold block"
            >
              {t("removePhoto")}
            </button>
          )}
          <p className="text-xs text-slate-400">{t("photoHint")}</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
