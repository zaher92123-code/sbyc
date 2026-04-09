"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui";
import Link from "next/link";
import BoatPhotoUpload from "@/components/boats/BoatPhotoUpload";
import DateField from "@/components/DateField";

interface BoatEditFormProps {
  boat: any;
  owners: any[];
}

export default function BoatEditForm({ boat, owners }: BoatEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const primaryOwner = boat.boat_owners?.find((bo: any) => bo.is_primary);

  const [form, setForm] = useState({
    name: boat.name || "",
    registration_number: boat.registration_number || "",
    type: boat.type || "",
    color: boat.color || "",
    length_meters: boat.length_meters?.toString() || "",
    width_meters: boat.width_meters?.toString() || "",
    insurance_company: boat.insurance_company || "",
    insurance_expiry: boat.insurance_expiry || "",
    insurance_policy_number: boat.insurance_policy_number || "",
    notes: boat.notes || "",
    status: boat.status || "available",
    owner_id: primaryOwner?.owner_id || "",
  });

  const f =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/boats/${boat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        registration_number: form.registration_number,
        type: form.type || undefined,
        color: form.color || undefined,
        length_meters: form.length_meters
          ? parseFloat(form.length_meters)
          : undefined,
        width_meters: form.width_meters
          ? parseFloat(form.width_meters)
          : null,
        insurance_company: form.insurance_company || null,
        insurance_expiry: form.insurance_expiry || null,
        insurance_policy_number: form.insurance_policy_number || null,
        notes: form.notes || undefined,
        status: form.status,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error?.message || result.error || "Failed to update boat");
      setLoading(false);
      return;
    }

    // Update primary owner if changed
    if (form.owner_id && form.owner_id !== primaryOwner?.owner_id) {
      // Remove existing primary
      await fetch(`/api/boats/${boat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_id: form.owner_id }),
      });
    }

    router.push(`/boats/${boat.id}`);
    router.refresh();
  }

  async function handleDelete() {
    setDeleteLoading(true);
    const res = await fetch(`/api/boats/${boat.id}`, { method: "DELETE" });
    if (!res.ok) {
      const result = await res.json();
      setError(result.error || "Cannot delete this boat");
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      return;
    }
    router.push("/boats");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/boats/${boat.id}`} className="btn-ghost text-xs">
          ← Back
        </Link>
        <h1 className="page-title">Edit Vessel: {boat.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">
            Vessel Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <BoatPhotoUpload boatId={boat.id} currentPhotoUrl={boat.photo_url} />
            </div>

            <div className="col-span-2">
              <label className="form-label">Vessel Name *</label>
              <input
                value={form.name}
                onChange={f("name")}
                className="form-input"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="form-label">Registration Number *</label>
              <input
                value={form.registration_number}
                onChange={f("registration_number")}
                className="form-input font-mono"
                required
              />
            </div>

            <div>
              <label className="form-label">Vessel Type</label>
              <select
                value={form.type}
                onChange={f("type")}
                className="form-select"
              >
                <option value="">Select type…</option>
                {[
                  "Dhow",
                  "Motorboat",
                  "Sailing Yacht",
                  "Luxury Yacht",
                  "Speed Boat",
                  "Fishing Boat",
                  "Ferry",
                  "Other",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Color</label>
              <input
                value={form.color}
                onChange={f("color")}
                className="form-input"
                placeholder="e.g. White/Blue"
              />
            </div>

            <div>
              <label className="form-label">Length (meters)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="100"
                value={form.length_meters}
                onChange={f("length_meters")}
                className="form-input font-mono"
              />
            </div>

            <div>
              <label className="form-label">Width (meters)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="30"
                value={form.width_meters}
                onChange={f("width_meters")}
                className="form-input font-mono"
              />
            </div>

            <div>
              <label className="form-label">Status</label>
              <select
                value={form.status}
                onChange={f("status")}
                className="form-select"
              >
                <option value="available">Available</option>
                <option value="parked">Parked</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="form-label">Insurance Company</label>
              <input
                value={form.insurance_company}
                onChange={f("insurance_company")}
                className="form-input"
                placeholder="e.g. Oman Insurance"
              />
            </div>

            <div>
              <label className="form-label">Insurance Expiry</label>
              <DateField
                value={form.insurance_expiry}
                onChange={f("insurance_expiry")}
                className="form-input font-mono"
              />
            </div>

            <div className="col-span-2">
              <label className="form-label">Insurance Policy Number</label>
              <input
                value={form.insurance_policy_number}
                onChange={f("insurance_policy_number")}
                className="form-input font-mono"
                placeholder="e.g. POL-2024-001234"
              />
            </div>

            <div className="col-span-2">
              <label className="form-label">Notes</label>
              <textarea
                value={form.notes}
                onChange={f("notes")}
                rows={3}
                className="form-textarea"
              />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <h2 className="font-bold text-slate-800 font-display">
            Primary Owner
          </h2>
          <select
            value={form.owner_id}
            onChange={f("owner_id")}
            className="form-select"
          >
            <option value="">No primary owner</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.full_name} {o.phone ? `— ${o.phone}` : ""}
              </option>
            ))}
          </select>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 justify-center py-3"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
          <Link href={`/boats/${boat.id}`} className="btn-secondary px-6">
            Cancel
          </Link>
        </div>
      </form>

      {/* Danger zone */}
      <div className="card p-5 border-red-200">
        <h3 className="font-bold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-sm text-slate-500 mb-3">
          Deleting a boat is permanent and cannot be undone. Boats with active
          parking sessions cannot be deleted.
        </p>
        {showDeleteConfirm ? (
          <div className="flex gap-3 items-center">
            <p className="text-sm font-semibold text-red-700 flex-1">
              Are you sure? This cannot be undone.
            </p>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="btn-danger text-sm"
            >
              {deleteLoading ? "Deleting…" : "Yes, Delete"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger text-sm"
          >
            Delete Vessel
          </button>
        )}
      </div>
    </div>
  );
}
