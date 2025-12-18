import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  targetUserId: string;
  targetUserName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Authenticate the requester
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: requester }, error: authError } = await userClient.auth.getUser();
    if (authError || !requester) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if requester is admin
    const { data: roleData } = await userClient.rpc("get_user_role", { _user_id: requester.id });
    if (roleData !== "user_admin" && roleData !== "general_overseer") {
      return new Response(JSON.stringify({ error: "Unauthorized - admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { targetUserId, targetUserName }: RequestBody = await req.json();

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "Target user ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get current general_overseer email
    const { data: overseerEmail, error: overseerError } = await adminClient.rpc("get_general_overseer_email");
    
    if (overseerError || !overseerEmail) {
      console.error("Error getting general overseer email:", overseerError);
      return new Response(JSON.stringify({ error: "No General Overseer found in the system" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get target user email
    const { data: targetUser, error: targetUserError } = await adminClient.auth.admin.getUserById(targetUserId);
    if (targetUserError || !targetUser?.user?.email) {
      console.error("Error getting target user:", targetUserError);
      return new Response(JSON.stringify({ error: "Target user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for existing pending request
    const { data: existingRequest } = await adminClient
      .from("pending_role_approvals")
      .select("id")
      .eq("target_user_id", targetUserId)
      .eq("status", "pending")
      .maybeSingle();

    if (existingRequest) {
      return new Response(JSON.stringify({ error: "A pending approval request already exists for this user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the pending approval request
    const { data: approval, error: insertError } = await adminClient
      .from("pending_role_approvals")
      .insert({
        requester_user_id: requester.id,
        target_user_id: targetUserId,
        requested_role: "general_overseer",
        requester_email: requester.email!,
        target_email: targetUser.user.email,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating approval request:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create approval request" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the base URL from the origin or use a fallback
    const origin = req.headers.get("origin") || supabaseUrl.replace(".supabase.co", ".lovable.app");
    const approvalUrl = `${supabaseUrl}/functions/v1/process-role-approval?token=${approval.approval_token}&action=approve`;
    const rejectUrl = `${supabaseUrl}/functions/v1/process-role-approval?token=${approval.approval_token}&action=reject`;

    // Send email to current General Overseer
    const emailResponse = await resend.emails.send({
      from: "Role Approval <onboarding@resend.dev>",
      to: [overseerEmail],
      subject: "General Overseer Role Assignment Approval Required",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
            .footer { background: #f1f5f9; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #64748b; }
            .btn { display: inline-block; padding: 12px 24px; margin: 10px 5px; border-radius: 6px; text-decoration: none; font-weight: 600; }
            .btn-approve { background: #10b981; color: white; }
            .btn-reject { background: #ef4444; color: white; }
            .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #3b82f6; }
            .warning { background: #fef3c7; border-left-color: #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Role Assignment Approval</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Action Required</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>An administrator has requested to assign the <strong>General Overseer</strong> role to a user.</p>
              
              <div class="info-box">
                <strong>Request Details:</strong><br>
                <strong>Target User:</strong> ${targetUserName || "Unknown"}<br>
                <strong>Target Email:</strong> ${targetUser.user.email}<br>
                <strong>Requested By:</strong> ${requester.email}<br>
                <strong>Request Time:</strong> ${new Date().toLocaleString()}
              </div>
              
              <div class="info-box warning">
                <strong>⚠️ Important:</strong> Approving this request will transfer the General Overseer role to this user. 
                Your current General Overseer privileges will be revoked.
              </div>
              
              <p>Please review and take action:</p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${approvalUrl}" class="btn btn-approve">✓ Approve</a>
                <a href="${rejectUrl}" class="btn btn-reject">✗ Reject</a>
              </div>
              
              <p style="font-size: 13px; color: #64748b;">This request will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Approval request sent to current General Overseer" 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in request-role-approval:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
