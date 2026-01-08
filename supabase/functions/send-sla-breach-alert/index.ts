import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SlaBreachRequest {
  requestId: string;
  title: string;
  priority: string;
  slaDueAt: string;
  category: string;
  raisedByName?: string;
  isBreach: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-sla-breach-alert function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { requestId, title, priority, slaDueAt, category, raisedByName, isBreach }: SlaBreachRequest = await req.json();

    console.log(`Processing SLA ${isBreach ? "breach" : "warning"} for request: ${requestId}`);

    // Get all admin users (report_admin, user_admin, general_overseer)
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["report_admin", "user_admin", "general_overseer"]);

    if (rolesError) {
      console.error("Failed to get admin roles:", rolesError);
      throw new Error("Failed to get admin users");
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found to notify");
      return new Response(
        JSON.stringify({ success: true, message: "No admins to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get unique admin user ids
    const adminUserIds = [...new Set(adminRoles.map(r => r.user_id))];

    // Get admin emails
    const adminEmails: string[] = [];
    for (const userId of adminUserIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({ success: true, message: "No admin emails found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const dueDate = new Date(slaDueAt);
    const formattedDue = dueDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const priorityColors: Record<string, string> = {
      urgent: "#ef4444",
      high: "#f97316",
      normal: "#eab308",
      low: "#22c55e",
    };

    const statusColor = isBreach ? "#ef4444" : "#f97316";
    const statusText = isBreach ? "SLA BREACHED" : "SLA Warning";
    const subject = isBreach 
      ? `🚨 SLA Breach: "${title}" requires immediate attention`
      : `⚠️ SLA Warning: "${title}" is approaching deadline`;

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
                      <div style="display: inline-block; padding: 8px 16px; background-color: ${statusColor}20; color: ${statusColor}; border-radius: 6px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${statusText}
                      </div>
                      <h1 style="margin: 20px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">
                        ${title}
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 40px 20px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                              <strong style="color: #18181b;">Category:</strong> ${category}
                            </p>
                            <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                              <strong style="color: #18181b;">Priority:</strong>
                              <span style="display: inline-block; padding: 2px 8px; background-color: ${priorityColors[priority] || "#71717a"}20; color: ${priorityColors[priority] || "#71717a"}; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: capitalize; margin-left: 4px;">
                                ${priority}
                              </span>
                            </p>
                            <p style="margin: 0 0 12px; color: #71717a; font-size: 14px;">
                              <strong style="color: #18181b;">SLA Due:</strong> ${formattedDue}
                            </p>
                            ${raisedByName ? `
                            <p style="margin: 0; color: #71717a; font-size: 14px;">
                              <strong style="color: #18181b;">Raised by:</strong> ${raisedByName}
                            </p>
                            ` : ""}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <p style="margin: 0 0 20px; color: #71717a; font-size: 14px; line-height: 1.6;">
                        ${isBreach 
                          ? "This resolution request has exceeded its SLA deadline. Immediate action is required to address this escalation."
                          : "This resolution request is approaching its SLA deadline. Please review and take action to prevent a breach."
                        }
                      </p>
                      <a href="${supabaseUrl.replace('.supabase.co', '')}/governance?tab=requests" 
                         style="display: inline-block; padding: 12px 24px; background-color: ${statusColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                        View Request
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
                      <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                        Workforce Hub • Governance System
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

    console.log(`Sending SLA alert to ${adminEmails.length} admins`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Workforce Hub <onboarding@resend.dev>",
        to: adminEmails,
        subject,
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Failed to send email:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("SLA alert email sent successfully:", emailResponse);

    // Create in-app notifications for all admins
    const notifications = adminUserIds.map(userId => ({
      user_id: userId,
      title: isBreach ? "SLA Breach Alert" : "SLA Warning",
      message: `Resolution request "${title}" ${isBreach ? "has exceeded its SLA deadline" : "is approaching its deadline"}`,
      type: isBreach ? "error" : "warning",
    }));

    await supabase.from("notifications").insert(notifications);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-sla-breach-alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
