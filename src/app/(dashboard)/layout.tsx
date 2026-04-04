import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";

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

  // Fetch user profile with role
  const { data: profile } = await supabase
    .from("users")
    .select("*, role:roles(*)")
    .eq("id", user.id)
    .single();

  return (
    <LanguageProvider>
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar user={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={profile} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1600px] mx-auto">
            <ToastProvider><ErrorBoundary>{children}</ErrorBoundary></ToastProvider>
          </div>
        </main>
      </div>
    </div>
    </LanguageProvider>
  );
}
