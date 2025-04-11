"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Package, Users, FileText, LogOut, Menu, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    // In a real app, you would call a logout API
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"

    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })

    router.push("/login")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center font-semibold">
          <Package className="mr-2 h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">Admin Dashboard</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} isActive={pathname === item.href} />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function NavItem({
  item,
  isActive,
}: {
  item: { title: string; href: string; icon: React.ElementType }
  isActive: boolean
}) {
  const { setOpenMobile, isMobile } = useSidebar()

  return (
    <SidebarMenuItem>
      <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)} className="w-full">
        <SidebarMenuButton isActive={isActive} tooltip={item.title}>
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  )
}

export function MobileSidebarTrigger() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button variant="outline" size="icon" className="md:hidden fixed top-4 left-4 z-40" onClick={toggleSidebar}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  )
}
