import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
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

const handler = async (req: Request): Promise<Response> => {
  console.log("send-task-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, action, userId, itemTitle, platform, workDate, reason, reviewerName, isOverride }: NotificationRequest = await req.json();

    console.log(`Processing ${type} ${action} notification for user ${userId}`);

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user?.email) {
      console.error("Failed to get user email:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to get user email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userEmail = userData.user.email;
    const itemType = type === "task" ? "Task" : "Work Report";
    
    let subject = "";
    let statusColor = "";
    let statusText = "";
    
    if (action === "approved") {
      subject = `✅ Your ${itemType} has been approved`;
      statusColor = "#22c55e";
      statusText = isOverride ? "Approved (Admin Override)" : "Approved";
    } else if (action === "rejected") {
      subject = `❌ Your ${itemType} requires attention`;
      statusColor = "#ef4444";
      statusText = isOverride ? "Rejected (Admin Override)" : "Rejected";
    } else if (action === "overridden") {
      subject = `🔄 Your ${itemType} status has been overridden`;
      statusColor = "#3b82f6";
      statusText = "Overridden by Admin";
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="padding: 40px 40px 20px;">
                      <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 700; color: #18181b;">
                        ${itemType} Update
                      </h1>
                      <div style="display: inline-block; padding: 8px 16px; background-color: ${statusColor}20; color: ${statusColor}; border-radius: 6px; font-weight: 600; font-size: 14px;">
                        ${statusText}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 40px 20px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                              <strong style="color: #18181b;">${type === "task" ? "Task:" : "Platform:"}</strong> ${itemTitle || platform}
                            </p>
                            <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                              <strong style="color: #18181b;">Work Date:</strong> ${workDate}
                            </p>
                            ${reviewerName ? `
                            <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                              <strong style="color: #18181b;">Reviewed by:</strong> ${reviewerName}
                            </p>
                            ` : ""}
                            ${reason ? `
                            <p style="margin: 0; color: #71717a; font-size: 14px;">
                              <strong style="color: #18181b;">Reason:</strong> ${reason}
                            </p>
                            ` : ""}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                        ${action === "rejected" 
                          ? "Please review the feedback and make any necessary updates to your submission."
                          : "Thank you for your contribution!"
                        }
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
                      <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                        Workforce Hub • Management System
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    console.log(`Sending email to ${userEmail}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Workforce Hub <onboarding@resend.dev>",
        to: [userEmail],
        subject,
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Failed to send email:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-task-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
