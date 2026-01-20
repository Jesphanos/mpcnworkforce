import { ReactNode } from "react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

interface RealtimeNotificationsProviderProps {
  children: ReactNode;
}

export function RealtimeNotificationsProvider({ children }: RealtimeNotificationsProviderProps) {
  // Initialize real-time notifications listener
  useRealtimeNotifications();
  
  return <>{children}</>;
}
