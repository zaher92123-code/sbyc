import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import BoatOwnersClient from "@/components/boats/BoatOwnersClient";

export default async function BoatOwnersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: boat }, { data: allOwners }] = await Promise.all([
    supabase
      .from("boats")
      .select("id, name, boat_owners(is_primary, since_date, owner:owners(*))")
      .eq("id", id)
      .single(),
    supabase.from("owners").select("id, full_name, phone, email").order("full_name"),
  ]);

  if (!boat) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/boats/${id}`} className="btn-ghost text-xs">← Back to {boat.name}</Link>
        <h1 className="page-title">Manage Owners — {boat.name}</h1>
      </div>
      <BoatOwnersClient boat={boat} allOwners={allOwners || []} />
    </div>
  );
}
