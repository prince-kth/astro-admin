'use client';

import { Home, Users, Key, Settings, ChevronRight, Rocket, LogOut, Star, Menu, Wallet, History } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarTrigger
} from "./ui/sidebar"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/lib/theme-store"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, toggleSidebar } = useSidebar()
  const { accentColor } = useThemeStore()

  const isActiveLink = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    document.cookie = "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/login')
  }

  const getActiveStyles = (isActive: boolean) => {
    if (!isActive) return "";
    
    const styles = {
      blue: "bg-gradient-to-r from-blue-50/80 to-transparent text-blue-600 border-r-2 border-blue-600 hover:from-blue-50/90 hover:text-blue-600",
      green: "bg-gradient-to-r from-green-50/80 to-transparent text-green-600 border-r-2 border-green-600 hover:from-green-50/90 hover:text-green-600",
      purple: "bg-gradient-to-r from-purple-50/80 to-transparent text-purple-600 border-r-2 border-purple-600 hover:from-purple-50/90 hover:text-purple-600",
      rose: "bg-gradient-to-r from-rose-50/80 to-transparent text-rose-600 border-r-2 border-rose-600 hover:from-rose-50/90 hover:text-rose-600",
      amber: "bg-gradient-to-r from-amber-50/80 to-transparent text-amber-600 border-r-2 border-amber-600 hover:from-amber-50/90 hover:text-amber-600",
      teal: "bg-gradient-to-r from-teal-50/80 to-transparent text-teal-600 border-r-2 border-teal-600 hover:from-teal-50/90 hover:text-teal-600",
    };
    
    return styles[accentColor];
  };

  const getLogoColor = () => {
    const colors = {
      blue: 'bg-blue-500/10',
      green: 'bg-green-500/10',
      purple: 'bg-purple-500/10',
      rose: 'bg-rose-500/10',
      amber: 'bg-amber-500/10',
      teal: 'bg-teal-500/10',
    };
    return colors[accentColor];
  };

  const getLogoTextColor = () => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      rose: 'text-rose-600',
      amber: 'text-amber-600',
      teal: 'text-teal-600',
    };
    return colors[accentColor];
  };

  const getProCardStyles = () => {
    const styles = {
      blue: {
        bg: "bg-gradient-to-br from-blue-50 via-blue-50/70 to-white",
        accent: "bg-gradient-to-br from-blue-100/50 to-transparent",
        icon: "bg-blue-600/10 text-blue-600",
        button: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
      },
      green: {
        bg: "bg-gradient-to-br from-green-50 via-green-50/70 to-white",
        accent: "bg-gradient-to-br from-green-100/50 to-transparent",
        icon: "bg-green-600/10 text-green-600",
        button: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
      },
      purple: {
        bg: "bg-gradient-to-br from-purple-50 via-purple-50/70 to-white",
        accent: "bg-gradient-to-br from-purple-100/50 to-transparent",
        icon: "bg-purple-600/10 text-purple-600",
        button: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
      },
      rose: {
        bg: "bg-gradient-to-br from-rose-50 via-rose-50/70 to-white",
        accent: "bg-gradient-to-br from-rose-100/50 to-transparent",
        icon: "bg-rose-600/10 text-rose-600",
        button: "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800"
      },
      amber: {
        bg: "bg-gradient-to-br from-amber-50 via-amber-50/70 to-white",
        accent: "bg-gradient-to-br from-amber-100/50 to-transparent",
        icon: "bg-amber-600/10 text-amber-600",
        button: "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
      },
      teal: {
        bg: "bg-gradient-to-br from-teal-50 via-teal-50/70 to-white",
        accent: "bg-gradient-to-br from-teal-100/50 to-transparent",
        icon: "bg-teal-600/10 text-teal-600",
        button: "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
      }
    };
    return styles[accentColor];
  };

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-slate-50"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
      )}
      <Sidebar variant="floating" className="border-r bg-gradient-to-b from-white via-slate-50/40 to-white flex flex-col min-h-screen">

        <SidebarHeader className="h-16 px-6 border-b bg-white/50 backdrop-blur-sm flex items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={cn("absolute inset-0 rounded-lg transform rotate-45", getLogoColor())}></div>
              <div className="relative p-2">
                <Rocket className={cn("h-6 w-6 transform -rotate-45", getLogoTextColor())} aria-hidden="true" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900">Astrofy</span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">Admin Portal</span>
            </div>
          </div>
        </SidebarHeader>
      {/* <SidebarTrigger className="-ml-1" /> */}

        <SidebarContent className="flex flex-col h-full pt-4 overflow-y-auto">
          <div className="px-3 mb-2">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider px-3">Navigation</div>
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 transition-all duration-200",
                  getActiveStyles(isActiveLink('/dashboard'))
                )}
              >
                <Link href="/dashboard" className="flex items-center gap-3 w-full">
                  <Home className="h-[18px] w-[18px] stroke-[1.5]" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 transition-all duration-200",
                  getActiveStyles(isActiveLink('/kundli'))
                )}
              >
                <Link href="/kundli" className="flex items-center gap-3 w-full">
                  <Star className="h-[18px] w-[18px] stroke-[1.5]" />
                  <span className="font-medium">Report Generation</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

        
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 transition-all duration-200",
                  getActiveStyles(isActiveLink('/report-history'))
                )}
              >
                <Link href="/report-history" className="flex items-center gap-3 w-full">
                  <History className="h-[18px] w-[18px] stroke-[1.5]" />
                  <span className="font-medium">Report History</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 transition-all duration-200",
                  getActiveStyles(isActiveLink('/users'))
                )}
              >
                <Link href="/users" className="flex items-center gap-3 w-full">
                  <Users className="h-[18px] w-[18px] stroke-[1.5]" />
                  <span className="font-medium">Users</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 transition-all duration-200",
                  getActiveStyles(isActiveLink('/wallet'))
                )}
              >
                <Link href="/wallet" className="flex items-center gap-3 w-full">
                  <Wallet className="h-[18px] w-[18px] stroke-[1.5]" />
                  <span className="font-medium">Wallet Management</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <div className="my-4 px-3">
              <div className="h-px bg-slate-200"></div>
            </div>

            <div className="px-3 mb-2">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider px-3">System</div>
            </div>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 transition-all duration-200",
                  getActiveStyles(isActiveLink('/settings'))
                )}
              >
                <Link href="/settings" className="flex items-center gap-3 w-full">
                  <Settings className="h-[18px] w-[18px] stroke-[1.5]" />
                  <span className="font-medium">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="mt-auto px-6 pb-6">
            <div className={cn(
              "relative overflow-hidden rounded-xl p-4",
              getProCardStyles().bg
            )}>
              <div className={cn(
                "absolute top-0 right-0 w-20 h-20 rounded-bl-[6rem]",
                getProCardStyles().accent
              )}></div>
              {/* <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center",
                    getProCardStyles().icon
                  )}>
                    <Rocket className={cn(
                      "h-5 w-5",
                      getProCardStyles().icon.split(' ')[1]
                    )} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Pro Version</h4>
                    <p className="text-xs text-slate-600">Unlock all features</p>
                  </div>
                </div>
                <button className={cn(
                  "w-full px-3 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow",
                  getProCardStyles().button
                )}>
                  Upgrade Now
                </button>
              </div> */}
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    </>
  )
}
