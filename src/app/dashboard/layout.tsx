import { createServerSupabaseClient } from "@/libs/supabase-server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} />
      <main className="p-6">{children}</main>
    </div>
  );
}
