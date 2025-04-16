"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Package,
  Users,
  FileText,
  LogOut,
  Menu,
  User,
  Settings,
  UserPlus,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { userData, logout, isAdmin, isSubAdmin } = useAuth();
  const { toast } = useToast();

  // Generate navigation items based on user role
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
  ];

  // Add admin/sub-admin only items
  if (isAdmin || isSubAdmin) {
    navItems.push(
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
      }
    );
  } else {
    // Regular user items
    navItems.push({
      title: "My Purchases",
      href: "/dashboard/my-purchases",
      icon: ShoppingBag,
    });
  }

  // Add admin-only items
  if (isAdmin) {
    navItems.push({
      title: "Manage Users",
      href: "/dashboard/users",
      icon: UserPlus,
    });
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center font-semibold">
          <Package className="mr-2 h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">
            {isAdmin
              ? "Admin Dashboard"
              : isSubAdmin
              ? "Sub-Admin Dashboard"
              : "User Dashboard"}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex justify-start items-center gap-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        userData?.photoURL ||
                        "/placeholder.svg?height=32&width=32"
                      }
                      alt="User"
                    />
                    <AvatarFallback>
                      {userData?.firstName?.charAt(0) || ""}
                      {userData?.lastName?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium">
                      {userData?.firstName} {userData?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {userData?.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function NavItem({
  item,
  isActive,
}: {
  item: { title: string; href: string; icon: React.ElementType };
  isActive: boolean;
}) {
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <Link
        href={item.href}
        onClick={() => isMobile && setOpenMobile(false)}
        className="w-full"
      >
        <SidebarMenuButton isActive={isActive} tooltip={item.title}>
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}

export function MobileSidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="outline"
      size="icon"
      className="md:hidden fixed top-4 left-4 z-40"
      onClick={toggleSidebar}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  );
}
