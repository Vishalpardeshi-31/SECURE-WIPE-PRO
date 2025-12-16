import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, FileCheck, BarChart3, Settings, Moon, Sun, UserCog, FileLock } from "lucide-react";
import { User } from '@/entities/all';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "My Dashboard",
    url: createPageUrl("UserDashboard"),
    icon: Shield,
    description: "Personal device wiping"
  },
  {
    title: "Secure Vault",
    url: createPageUrl("SecureVault"),
    icon: FileLock,
    description: "Selective file wiping"
  },
  {
    title: "Certificates",
    url: createPageUrl("Certificates"),
    icon: FileCheck,
    description: "Wipe verification"
  },
  {
    title: "Analytics", 
    url: createPageUrl("Analytics"),
    icon: BarChart3,
    description: "My wipe history"
  }
];

const adminNavigationItems = [
  {
    title: "Admin Center",
    url: createPageUrl("AdminDashboard"),
    icon: UserCog,
    description: "System management"
  },
  {
    title: "All Devices", 
    url: createPageUrl("Dashboard"),
    icon: Settings,
    description: "Global device view"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkUserRole = async () => {
      try {
        const currentUser = await User.me();
        if (currentUser && currentUser.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        console.error("Failed to fetch user role:", e);
        setIsAdmin(false);
      }
    };
    checkUserRole();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <style>{`
        :root {
          --primary-blue: #2563eb;
          --success-green: #10b981;
          --trust-navy: #1e3a8a;
          --soft-gray: #f8fafc;
          --card-white: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #64748b;
        }

        .dark {
          --soft-gray: #0f172a;
          --card-white: #1e293b;
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--soft-gray);
          color: var(--text-primary);
        }

        .trust-gradient {
          background: linear-gradient(135deg, var(--primary-blue) 0%, var(--trust-navy) 100%);
        }

        .glass-effect {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.9);
        }

        .dark .glass-effect {
          background: rgba(30, 41, 59, 0.9);
        }
      `}</style>

      <SidebarProvider>
        <div className="min-h-screen flex w-full transition-colors duration-300">
          <Sidebar className="border-r-0 shadow-xl">
            <SidebarHeader className="border-b border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 trust-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-gray-900 dark:text-white">SecureWipe Pro</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Data Wiping Suite</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-4">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                  Personal Workspace
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`rounded-xl transition-all duration-200 hover:shadow-md ${
                            location.pathname === item.url
                              ? 'trust-gradient text-white shadow-lg'
                              : 'hover:bg-blue-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <div>
                              <span className="font-semibold text-sm">{item.title}</span>
                              <p className="text-xs opacity-75">{item.description}</p>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {isAdmin && (
                <SidebarGroup className="mt-6">
                  <SidebarGroupLabel className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider px-3 py-2">
                    Administrator
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-2">
                      {adminNavigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`rounded-xl transition-all duration-200 hover:shadow-md ${
                              location.pathname === item.url
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <item.icon className="w-5 h-5" />
                              <div>
                                <span className="font-semibold text-sm">{item.title}</span>
                                <p className="text-xs opacity-75">{item.description}</p>
                              </div>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}

              <div className="mt-8 px-3">
                <div className="glass-effect rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Compliance Status</h3>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">NIST SP 800-88 Rev. 1</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </SidebarContent>

            <div className="border-t border-gray-100 dark:border-gray-800 p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-full justify-start gap-3 rounded-xl"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
          </Sidebar>

          <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 md:hidden shadow-sm">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors" />
                <h1 className="text-xl font-bold">SecureWipe Pro</h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}