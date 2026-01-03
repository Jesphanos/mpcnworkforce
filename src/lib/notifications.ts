import { supabase } from "@/integrations/supabase/client";

interface SendNotificationParams {
  type: "task" | "report";
  action: "approved" | "rejected" | "overridden";
  userId: string;
  itemTitle: string;
  platform: string;
  workDate: string;
  reason?: string;
  reviewerName?: string;
  isOverride?: boolean;
}

export async function sendTaskNotification(params: SendNotificationParams) {
  try {
    const { data, error } = await supabase.functions.invoke("send-task-notification", {
      body: params,
    });

    if (error) {
      console.error("Failed to send notification:", error);
      return { success: false, error };
    }

    console.log("Notification sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error };
  }
}
