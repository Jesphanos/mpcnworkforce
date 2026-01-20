import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mpcn_id } = await req.json();

    if (!mpcn_id) {
      return new Response(
        JSON.stringify({ error: "MPCN ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize the ID
    const normalizedId = mpcn_id.toUpperCase().replace("MPCN-", "");

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Look up the profile by MPCN ID (first 6-8 characters of UUID)
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("id", `${normalizedId}%`)
      .limit(1);

    if (profileError) {
      console.error("Profile lookup error:", profileError);
      throw new Error("Failed to lookup MPCN ID");
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ error: "No account found with this MPCN ID" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = profiles[0].id;

    // Get the user's email from auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser?.user?.email) {
      console.error("Auth user lookup error:", authError);
      return new Response(
        JSON.stringify({ error: "Unable to resolve account email" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email = authUser.user.email;

    // Mask the email for security (e.g., "j***@company.com")
    const [localPart, domain] = email.split("@");
    const maskedLocal = localPart.length > 2 
      ? `${localPart[0]}${"*".repeat(Math.min(localPart.length - 1, 5))}` 
      : localPart;
    const maskedEmail = `${maskedLocal}@${domain}`;

    console.log(`MPCN ID ${mpcn_id} resolved to user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        email: email,
        masked_email: maskedEmail,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: unknown) {
    console.error("Error resolving MPCN ID:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
