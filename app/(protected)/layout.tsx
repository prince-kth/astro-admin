'use client'

import { AdminLayout } from "@/components/admin-layout"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AdminLayout>
        {children}
        
      </AdminLayout>
      
    </SidebarProvider>
  )
}
