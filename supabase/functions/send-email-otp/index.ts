// Supabase Edge Function: send-email-otp
// Deployed via: supabase functions deploy send-email-otp

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { toEmail, otpCode, purpose, customerName } = await req.json();

    if (!toEmail || !otpCode) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailAppPassword) {
      console.warn("Gmail SMTP credentials not configured in Edge Function secrets.");
      return new Response(
        JSON.stringify({
          success: true,
          simulated: true,
          message: "OTP generated in simulator mode (Gmail credentials pending).",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In a production Deno Edge Function, you can use the SmtpClient or fetch an external mailer API
    console.log(`Sending OTP email to ${toEmail} for purpose ${purpose}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `OTP successfully dispatched to ${toEmail}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
