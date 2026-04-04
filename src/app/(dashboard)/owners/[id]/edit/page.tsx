import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import OwnerEditForm from "@/components/owners/OwnerEditForm";

export default async function OwnerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: owner } = await supabase
    .from("owners")
    .select("*")
    .eq("id", id)
    .single();

  if (!owner) notFound();

  return <OwnerEditForm owner={owner} />;
}
