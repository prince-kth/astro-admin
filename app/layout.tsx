import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
              <AdminSidebar />
              <main className="flex-1 overflow-y-auto bg-background min-h-screen">
                <div className="h-full">
                  {children}
                </div>
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
