import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  Church,
  Calendar,
  MessageSquare,
  Video,
  MessagesSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";
import { signOut } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: Heart, label: "Prayer Request", path: "/prayer-request" },
  { icon: BookOpen, label: "Bible Management", path: "/bible-management" },
  { icon: Church, label: "Church Management", path: "/church-management" },
  { icon: Calendar, label: "Event", path: "/events" },
  { icon: MessageSquare, label: "Follow Up Request", path: "/follow-up" },
  { icon: Video, label: "User Video", path: "/user-video" },
  { icon: MessagesSquare, label: "User Chat", path: "/user-chat" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    }
  };

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = location.pathname === item.path;
    const content = (
      <Link
        to={item.path}
        className={cn(
          "sidebar-item",
          isActive && "sidebar-item-active",
          collapsed && "justify-center px-2"
        )}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-sidebar-border",
        collapsed ? "justify-center px-2 py-6" : "justify-center px-4 py-6"
      )}>
        {collapsed ? (
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-sm">EN</span>
          </div>
        ) : (
          <img src={logo} alt="Every Nation Education" className="h-10 w-auto" />
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground shadow-md hover:bg-sidebar-ring transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="p-3 space-y-1 flex-1">
        {menuItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-sidebar-border">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="w-full h-11 bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Logout
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 h-11 bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
