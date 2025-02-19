'use client';

import { Home, Users, Key, Settings, ChevronRight, Rocket, LogOut, Star } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActiveLink = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    document.cookie = "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/login')
  }

  return (
    <Sidebar className="border-r bg-gradient-to-b from-white to-slate-50 flex flex-col min-h-screen">
      <SidebarHeader className="h-16 px-6 border-b bg-white/50 backdrop-blur-sm flex items-center">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Rocket className="h-8 w-8 text-blue-600 animate-pulse" aria-hidden="true" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Astrofy</span>
            <span className="text-xs text-slate-500">Admin Portal</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="p-4">
          <div className="mb-4 px-3">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Main Menu</div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-150",
                  isActiveLink('/dashboard') && "bg-blue-50/80 text-blue-600 hover:bg-blue-50/80 hover:text-blue-600 shadow-sm"
                )}
              >
                <Link href="/dashboard" className="flex items-center gap-3 w-full">
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-150",
                  isActiveLink('/kundli') && "bg-blue-50/80 text-blue-600 hover:bg-blue-50/80 hover:text-blue-600 shadow-sm"
                )}
              >
                <Link href="/kundli" className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5" />
                    <span className="font-medium">Kundli Generation</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100">New</Badge>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-150",
                  isActiveLink('/users') && "bg-blue-50/80 text-blue-600 hover:bg-blue-50/80 hover:text-blue-600 shadow-sm"
                )}
              >
                <Link href="/users" className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Users</span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600">250+</Badge>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <div className="my-4 px-3">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">System</div>
            </div>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-150",
                  isActiveLink('/settings') && "bg-blue-50/80 text-blue-600 hover:bg-blue-50/80 hover:text-blue-600 shadow-sm"
                )}
              >
                <Link href="/settings" className="flex items-center gap-3 w-full">
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <div className="mt-auto p-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm border border-blue-100/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Pro Features</h4>
                <p className="text-xs text-slate-500">Unlock advanced analytics</p>
              </div>
            </div>
            <button className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-150 shadow-sm">
              Upgrade Now
            </button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
