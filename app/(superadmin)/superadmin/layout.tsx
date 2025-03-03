"use client"

import type React from "react"

import { SuperadminLayout } from "@/components/superadmin-layout"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function SuperadminRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <SuperadminLayout>{children}</SuperadminLayout>
    </SidebarProvider>
  )
}

