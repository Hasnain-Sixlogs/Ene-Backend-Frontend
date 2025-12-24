import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-56"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-end gap-4 px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-3 cursor-pointer group">
            <Avatar className="w-10 h-10 ring-2 ring-accent/20">
              <AvatarImage src={user?.profile || ""} />
              <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{user?.name}</span>
              {/* <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" /> */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
