"use client"

import type React from "react"

import { SuperadminSidebar } from "@/components/superadmin-sidebar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface SuperadminLayoutProps {
  children: React.ReactNode
}

export function SuperadminLayout({ children }: SuperadminLayoutProps) {
  return (
    <div className="flex h-screen w-screen">
      <SuperadminSidebar />
      <div className="flex h-screen w-screen">
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 p-6 bg-muted/50 overflow-auto">{children}</main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}

