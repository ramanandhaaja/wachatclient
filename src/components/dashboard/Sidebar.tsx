"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Mail, 
  AlertTriangle, 
  Shield, 
  BarChart2, 
  BookOpen, 
  Calendar, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  LogOut,
  Menu,
  CreditCard,
  Bell,
  User,
  Briefcase,
  GraduationCap,
  Cog
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SidebarItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: { title: string; href: string }[];
  isExpandable?: boolean;
};

export function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "Conversation": true,
  });
  const [collapsed, setCollapsed] = useState(false);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    
    // Dispatch a custom event to notify the layout
    const event = new CustomEvent('sidebar-toggle', { 
      detail: { collapsed: newCollapsedState } 
    });
    window.dispatchEvent(event);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Task",
      href: "/dashboard",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      title: "Calendar",
      href: "/dashboard/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Conversation",
      href: "/dashboard/conversation",
      icon: <Mail className="h-5 w-5" />,
      isExpandable: true,
      submenu: [
        { title: "Chat", href: "/dashboard/conversation/chat" },
        { title: "Feedback", href: "/dashboard/conversation/feedback" },
        { title: "Unassigned", href: "/dashboard/conversation/unassigned" },
        { title: "All", href: "/dashboard/conversation/all" },
        { title: "Blocked", href: "/dashboard/conversation/blocked" },
        { title: "Trash", href: "/dashboard/conversation/trash" },
      ]
    },
  ];

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-[#0f172a] text-white fixed left-0 top-0 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
      style={{ width: collapsed ? '80px' : '256px' }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-800">
        <div className="flex items-center justify-center w-6 h-6 bg-indigo-500 rounded-md">
          <Mail className="h-4 w-4 text-white" />
        </div>
        {!collapsed && <span className="text-xl font-bold">Manta</span>}
        <div className="ml-auto">
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-full bg-gray-800 hover:bg-gray-700"
          >
            {collapsed ? <ChevronRight className="h-4 w-4 text-gray-400" /> : <ChevronLeft className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search here..."
              className="w-full bg-gray-800 rounded-md py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-2">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.title}>
              {item.isExpandable ? (
                <div className="flex flex-col">
                  {collapsed ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => toggleMenu(item.title)}
                            className={cn(
                              "flex items-center justify-center p-2 rounded-md w-full text-sm",
                              pathname.startsWith(item.href) ? "text-white bg-gray-800" : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                            )}
                          >
                            <div className="flex items-center justify-center w-5 h-5">
                              {item.icon}
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={cn(
                        "flex items-center w-full px-4 py-3 text-sm",
                        pathname.startsWith(item.href) ? "text-white" : "text-gray-400 hover:text-white"
                      )}
                    >
                      <div className="flex items-center justify-center w-5 h-5 mr-3">
                        {item.icon}
                      </div>
                      <span>{item.title}</span>
                      <div className="ml-auto">
                        {expandedMenus[item.title] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                  )}
                  
                  {!collapsed && item.submenu && expandedMenus[item.title] && (
                    <div>
                      <ul>
                        {item.submenu.map((subItem) => (
                          <li key={subItem.title}>
                            <Link
                              href={subItem.href}
                              className={cn(
                                "block py-3 px-12 text-sm",
                                pathname === subItem.href ? "text-white" : "text-gray-400 hover:text-white"
                              )}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          collapsed 
                            ? "flex items-center justify-center p-2 rounded-md w-full text-sm" 
                            : "flex items-center px-4 py-3 text-sm",
                          pathname === item.href ? "text-white" : "text-gray-400 hover:text-white"
                        )}
                      >
                        <div className={cn("flex items-center justify-center w-5 h-5", !collapsed && "mr-3")}>
                          {item.icon}
                        </div>
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        <p>{item.title}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile with Dropdown */}
      <div className="mt-auto p-4 border-t border-gray-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center w-full",
              collapsed ? "justify-center" : "gap-3"
            )}>
              <Avatar className="h-8 w-8 border-2 border-gray-700">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">shadcn</p>
                  <p className="text-xs text-gray-400">m@example.com</p>
                </div>
              )}
              <Settings className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align={collapsed ? "center" : "end"} 
            side="top"
            className="w-56 bg-[#1e293b] text-white border-gray-800"
          >
            <div className="flex items-center gap-2 p-2">
              <div className="rounded-full bg-primary/10 p-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">shadcn</p>
                <p className="text-xs text-gray-400">m@example.com</p>
              </div>
              
            </div>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 text-gray-300 hover:text-white">
              <CreditCard className="h-4 w-4" />
              <span>Upgrade to Pro</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 text-gray-300 hover:text-white">
              <User className="h-4 w-4" />
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 text-gray-300 hover:text-white">
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 text-gray-300 hover:text-white">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 text-gray-300 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
