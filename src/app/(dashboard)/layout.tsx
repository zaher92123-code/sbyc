import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";
import MobileLayout from "@/components/layout/MobileLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*, role:roles(*)")
    .eq("id", user.id)
    .single();

  return (
    <LanguageProvider>
      <MobileLayout user={profile}>
        <ToastProvider><ErrorBoundary>{children}</ErrorBoundary></ToastProvider>
      </MobileLayout>
    </LanguageProvider>
  );
}
