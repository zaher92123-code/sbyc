import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BoatEditForm from "@/components/boats/BoatEditForm";

export default async function BoatEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: boat }, { data: owners }] = await Promise.all([
    supabase
      .from("boats")
      .select("*, boat_owners(is_primary, owner_id, owner:owners(id, full_name))")
      .eq("id", id)
      .single(),
    supabase.from("owners").select("id, full_name, phone").order("full_name"),
  ]);

  if (!boat) notFound();

  return <BoatEditForm boat={boat} owners={owners || []} />;
}
