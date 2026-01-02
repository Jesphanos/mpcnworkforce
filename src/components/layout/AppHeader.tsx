import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function AppHeader() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-foreground">
            Welcome back, {profile?.full_name?.split(" ")[0] || "User"}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <NotificationBell />
        
        <Avatar 
          className="h-9 w-9 sm:hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          onClick={() => navigate("/profile")}
        >
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {getInitials(profile?.full_name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}