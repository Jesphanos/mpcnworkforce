import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action");

    if (!token || !action) {
      return new Response(generateHtmlResponse("error", "Missing token or action parameter"), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    if (action !== "approve" && action !== "reject") {
      return new Response(generateHtmlResponse("error", "Invalid action. Must be 'approve' or 'reject'"), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get the pending approval request
    const { data: approval, error: fetchError } = await adminClient
      .from("pending_role_approvals")
      .select("*")
      .eq("approval_token", token)
      .maybeSingle();

    if (fetchError || !approval) {
      console.error("Error fetching approval:", fetchError);
      return new Response(generateHtmlResponse("error", "Invalid or expired approval token"), {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Check if already processed
    if (approval.status !== "pending") {
      return new Response(generateHtmlResponse("info", `This request has already been ${approval.status}`), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Check if expired
    if (new Date(approval.expires_at) < new Date()) {
      await adminClient
        .from("pending_role_approvals")
        .update({ status: "expired", processed_at: new Date().toISOString() })
        .eq("id", approval.id);

      return new Response(generateHtmlResponse("error", "This approval request has expired"), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    if (action === "reject") {
      // Update the approval status to rejected
      await adminClient
        .from("pending_role_approvals")
        .update({ status: "rejected", processed_at: new Date().toISOString() })
        .eq("id", approval.id);

      return new Response(generateHtmlResponse("rejected", "The role assignment request has been rejected"), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Action is "approve" - proceed with role transfer
    // Get current general_overseer user_id
    const { data: currentOverseerRole, error: overseerError } = await adminClient
      .from("user_roles")
      .select("user_id, id")
      .eq("role", "general_overseer")
      .maybeSingle();

    if (overseerError) {
      console.error("Error getting current overseer:", overseerError);
      return new Response(generateHtmlResponse("error", "Failed to process approval"), {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Start the role transfer in a transaction-like manner
    // 1. Demote current general_overseer to user_admin
    if (currentOverseerRole) {
      const { error: demoteError } = await adminClient
        .from("user_roles")
        .update({ role: "user_admin" })
        .eq("id", currentOverseerRole.id);

      if (demoteError) {
        console.error("Error demoting current overseer:", demoteError);
        return new Response(generateHtmlResponse("error", "Failed to transfer role"), {
          status: 500,
          headers: { "Content-Type": "text/html" },
        });
      }
    }

    // 2. Update or insert the new general_overseer role
    const { data: existingRole } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", approval.target_user_id)
      .maybeSingle();

    if (existingRole) {
      const { error: promoteError } = await adminClient
        .from("user_roles")
        .update({ role: "general_overseer" })
        .eq("id", existingRole.id);

      if (promoteError) {
        console.error("Error promoting new overseer:", promoteError);
        // Try to revert the demotion
        if (currentOverseerRole) {
          await adminClient
            .from("user_roles")
            .update({ role: "general_overseer" })
            .eq("id", currentOverseerRole.id);
        }
        return new Response(generateHtmlResponse("error", "Failed to assign new role"), {
          status: 500,
          headers: { "Content-Type": "text/html" },
        });
      }
    } else {
      const { error: insertError } = await adminClient
        .from("user_roles")
        .insert({ user_id: approval.target_user_id, role: "general_overseer" });

      if (insertError) {
        console.error("Error inserting new overseer role:", insertError);
        // Try to revert the demotion
        if (currentOverseerRole) {
          await adminClient
            .from("user_roles")
            .update({ role: "general_overseer" })
            .eq("id", currentOverseerRole.id);
        }
        return new Response(generateHtmlResponse("error", "Failed to assign new role"), {
          status: 500,
          headers: { "Content-Type": "text/html" },
        });
      }
    }

    // 3. Update the approval status
    await adminClient
      .from("pending_role_approvals")
      .update({ status: "approved", processed_at: new Date().toISOString() })
      .eq("id", approval.id);

    console.log(`Role transfer completed: ${approval.target_email} is now General Overseer`);

    return new Response(generateHtmlResponse("approved", `The General Overseer role has been transferred to ${approval.target_email}`), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });

  } catch (error: any) {
    console.error("Error in process-role-approval:", error);
    return new Response(generateHtmlResponse("error", error.message), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
});

function generateHtmlResponse(type: "approved" | "rejected" | "error" | "info", message: string): string {
  const colors = {
    approved: { bg: "#10b981", icon: "✓" },
    rejected: { bg: "#f59e0b", icon: "✗" },
    error: { bg: "#ef4444", icon: "⚠" },
    info: { bg: "#3b82f6", icon: "ℹ" },
  };

  const config = colors[type];
  const title = type.charAt(0).toUpperCase() + type.slice(1);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Role Approval - ${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 20px;
        }
        .card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          max-width: 440px;
          width: 100%;
          overflow: hidden;
        }
        .header {
          background: ${config.bg};
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
          text-align: center;
        }
        .message {
          color: #475569;
          font-size: 16px;
          line-height: 1.6;
        }
        .footer {
          padding: 20px 30px;
          background: #f8fafc;
          text-align: center;
          font-size: 13px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="icon">${config.icon}</div>
          <div class="title">${title}</div>
        </div>
        <div class="content">
          <p class="message">${message}</p>
        </div>
        <div class="footer">
          You can close this window.
        </div>
      </div>
    </body>
    </html>
  `;
}
