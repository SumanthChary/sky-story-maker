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
    const { amount, currency = "USD", description } = await req.json();
    
    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const PAYPAL_MODE = Deno.env.get("PAYPAL_MODE") || "sandbox"; // sandbox or live
    
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
      const errorText = await authResponse.text();
      console.error("PayPal auth error:", errorText);
      throw new Error("Failed to authenticate with PayPal");
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: description || "Constellation Story Purchase",
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "Stories in the Sky",
          shipping_preference: "NO_SHIPPING",
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("PayPal order creation error:", errorText);
      throw new Error("Failed to create PayPal order");
    }

    const orderData = await orderResponse.json();
    console.log("PayPal order created:", orderData.id);

    return new Response(
      JSON.stringify({
        orderId: orderData.id,
        links: orderData.links,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in paypal-create-order:", error);
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
