'use client';

import { AdminSidebar } from "@/components/admin-sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen w-screen">
      <AdminSidebar />
    <div className="flex h-screen w-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 p-6 bg-muted/50 overflow-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
    </div>
  );
}
