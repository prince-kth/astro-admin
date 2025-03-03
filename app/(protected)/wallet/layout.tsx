import { AdminSidebar } from "@/components/admin-sidebar";

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* <AdminSidebar /> */}
      <div className=" overflow-auto">{children}</div>
    </div>
  );
} 