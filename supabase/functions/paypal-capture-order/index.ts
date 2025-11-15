import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    
    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const PAYPAL_MODE = Deno.env.get("PAYPAL_MODE") || "sandbox";
    
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("PayPal credentials not configured");
    }

    const PAYPAL_API_URL = PAYPAL_MODE === "live" 
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    // Get PayPal access token
    const authResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      throw new Error("Failed to authenticate with PayPal");
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Capture the order
    const captureResponse = await fetch(
      `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!captureResponse.ok) {
      const errorText = await captureResponse.text();
      console.error("PayPal capture error:", errorText);
      throw new Error("Failed to capture PayPal order");
    }

    const captureData = await captureResponse.json();
    console.log("PayPal order captured:", captureData.id);

    return new Response(
      JSON.stringify({
        success: true,
        captureId: captureData.id,
        status: captureData.status,
        details: captureData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in paypal-capture-order:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
