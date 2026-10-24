import { requireAdminSession } from "@/lib/services/adminService";
import { AdminHeader } from "@/components/admin/AdminHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel & CMS — kreepycode",
  description: "Curriculum management, pacing configurations, and student override controls.",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email } = await requireAdminSession();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <AdminHeader userEmail={email} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
