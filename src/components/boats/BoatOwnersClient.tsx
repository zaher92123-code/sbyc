"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Badge, Alert } from "@/components/ui";
import DateField from "@/components/DateField";

interface BoatOwnersClientProps {
  boat: any;
  allOwners: any[];
}

export default function BoatOwnersClient({ boat, allOwners }: BoatOwnersClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [currentOwners, setCurrentOwners] = useState<any[]>(
    boat.boat_owners || []
  );
  const [selectedOwner, setSelectedOwner] = useState("");
  const [isPrimary, setIsPrimary] = useState(currentOwners.length === 0);
  const [sinceDate, setSinceDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkedOwnerIds = new Set(currentOwners.map((bo: any) => bo.owner?.id));
  const availableOwners = allOwners.filter((o) => !linkedOwnerIds.has(o.id));

  async function addOwner() {
    if (!selectedOwner) return;
    setLoading(true);
    setError(null);

    const shouldBePrimary = isPrimary || currentOwners.length === 0;

    const { error } = await supabase.from("boat_owners").insert({
      boat_id: boat.id,
      owner_id: selectedOwner,
      is_primary: shouldBePrimary,
      since_date: sinceDate || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If set as primary, demote others
    if (shouldBePrimary) {
      await supabase
        .from("boat_owners")
        .update({ is_primary: false })
        .eq("boat_id", boat.id)
        .neq("owner_id", selectedOwner);
    }

    router.refresh();
    setSelectedOwner("");
    setIsPrimary(false);
    setSinceDate("");
    setLoading(false);
  }

  async function removeOwner(ownerId: string) {
    setLoading(true);
    const { error } = await supabase
      .from("boat_owners")
      .delete()
      .eq("boat_id", boat.id)
      .eq("owner_id", ownerId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setCurrentOwners((prev) => prev.filter((bo) => bo.owner?.id !== ownerId));
    setLoading(false);
  }

  async function setPrimary(ownerId: string) {
    setLoading(true);
    // Demote all
    await supabase
      .from("boat_owners")
      .update({ is_primary: false })
      .eq("boat_id", boat.id);

    // Set new primary
    await supabase
      .from("boat_owners")
      .update({ is_primary: true })
      .eq("boat_id", boat.id)
      .eq("owner_id", ownerId);

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* Current owners */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 font-display">Current Owners</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {currentOwners.length === 0 ? (
            <p className="px-5 py-8 text-center text-slate-400">No owners linked</p>
          ) : (
            currentOwners.map((bo: any) => (
              <div key={bo.owner?.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-800">
                    {bo.owner?.full_name?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{bo.owner?.full_name}</span>
                      {bo.is_primary && <Badge variant="gold" className="text-[10px]">Primary</Badge>}
                    </div>
                    <p className="text-xs text-slate-400">
                      {bo.owner?.phone} {bo.since_date ? `· Since ${formatDate(bo.since_date)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!bo.is_primary && (
                    <button
                      onClick={() => setPrimary(bo.owner?.id)}
                      disabled={loading}
                      className="btn-ghost text-xs py-1 text-teal-600"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => removeOwner(bo.owner?.id)}
                    disabled={loading}
                    className="btn-ghost text-xs py-1 text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add owner */}
      {availableOwners.length > 0 && (
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">Add Owner</h2>

          <div>
            <label className="form-label">Select Owner</label>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="form-select"
            >
              <option value="">Choose owner…</option>
              {availableOwners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.full_name} {o.phone ? `— ${o.phone}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Owner Since</label>
              <DateField
                value={sinceDate}
                onChange={(e) => setSinceDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-slate-700">Set as Primary Owner</span>
              </label>
            </div>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <button
            onClick={addOwner}
            disabled={!selectedOwner || loading}
            className="btn-primary text-sm"
          >
            {loading ? "Adding…" : "+ Link Owner"}
          </button>
        </div>
      )}
    </div>
  );
}
