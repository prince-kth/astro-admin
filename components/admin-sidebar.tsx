'use client';

import { Home, Users, Key, Settings, ChevronRight, Rocket, HelpCircle, Moon, Sun, Star } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function AdminSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const isActiveLink = (path: string) => {
    return pathname === path
  }

  return (
    <Sidebar className="border-border bg-sidebar-background flex flex-col">
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Astrofy
          </h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4 flex-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} hover:bg-blue-50 transition-all duration-200 group ${
                isActiveLink('/dashboard')
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : ''
              }`}
              isActive={isActiveLink('/dashboard')}
            >
              <Link href="/dashboard" className="flex items-center gap-3 w-full">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} hover:bg-blue-50 transition-all duration-200 group ${
                isActiveLink('/kundli')
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : ''
              }`}
              isActive={isActiveLink('/kundli')}
            >
              <Link href="/kundli" className="flex items-center gap-3 w-full">
                <Star className="h-5 w-5" />
                <span>Kundli Generation</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} hover:bg-blue-50 transition-all duration-200 group ${
                isActiveLink('/admins')
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : ''
              }`}
              isActive={isActiveLink('/admins')}
            >
              <Link href="/admins" className="flex items-center gap-3 w-full">
                <Users className="h-5 w-5" />
                <span>Admins</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} hover:bg-blue-50 transition-all duration-200 group ${
                isActiveLink('/api-management')
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : ''
              }`}
              isActive={isActiveLink('/api-management')}
            >
              <Link href="/api-management" className="flex items-center gap-3 w-full">
                <Key className="h-5 w-5" />
                <span>API Management</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} hover:bg-blue-50 transition-all duration-200 group ${
                isActiveLink('/settings')
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : ''
              }`}
              isActive={isActiveLink('/settings')}
            >
              <Link href="/settings" className="flex items-center gap-3 w-full">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-auto pt-4">
          <Separator className="mb-4" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                variant="outline"
              >
                <Link href="/help" className="flex items-center gap-3 w-full">
                  <HelpCircle className="h-5 w-5" />
                  <span>Help & Support</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                variant="outline"
                className="w-full flex items-center gap-3"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-5 w-5" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5" />
                    <span>Dark Mode</span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem> */}
          </SidebarMenu>
        </div>

       
      </SidebarContent>
    </Sidebar>
  )
}
