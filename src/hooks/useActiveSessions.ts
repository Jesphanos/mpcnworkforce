import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  createdAt: Date;
}

function parseUserAgent(userAgent: string | null): { device: string; browser: string } {
  if (!userAgent) {
    return { device: "Unknown", browser: "Unknown Browser" };
  }

  // Detect device
  let device = "Desktop";
  if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
    device = /iPad/i.test(userAgent) ? "Tablet" : "Mobile";
  }

  // Detect browser
  let browser = "Unknown Browser";
  if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) {
    browser = "Chrome";
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = "Safari";
  } else if (/Firefox/i.test(userAgent)) {
    browser = "Firefox";
  } else if (/Edge|Edg/i.test(userAgent)) {
    browser = "Edge";
  } else if (/Opera|OPR/i.test(userAgent)) {
    browser = "Opera";
  }

  // Detect OS
  let os = "";
  if (/Windows/i.test(userAgent)) os = "Windows";
  else if (/Mac/i.test(userAgent)) os = "macOS";
  else if (/Linux/i.test(userAgent)) os = "Linux";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/iOS|iPhone|iPad/i.test(userAgent)) os = "iOS";

  return {
    device,
    browser: os ? `${browser} on ${os}` : browser,
  };
}

export function useActiveSessions() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCurrentSession() {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user agent from the browser
          const userAgent = navigator.userAgent;
          const { device, browser } = parseUserAgent(userAgent);
          
          // Try to get approximate location from timezone
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const location = timezone.replace(/_/g, " ").split("/").pop() || "Unknown Location";
          
          const currentSession: ActiveSession = {
            id: session.access_token.slice(-8), // Use last 8 chars as unique ID
            device,
            browser,
            location,
            lastActive: "Now",
            isCurrent: true,
            createdAt: new Date(session.user.last_sign_in_at || Date.now()),
          };
          
          setSessions([currentSession]);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrentSession();
  }, []);

  return { sessions, isLoading };
}
