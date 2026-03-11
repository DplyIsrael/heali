import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-[1440px] px-[50px] py-8">
        {children}
      </main>
    </>
  );
}
