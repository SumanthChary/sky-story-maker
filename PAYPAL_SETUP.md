# PayPal Integration Setup Guide

## What Was Done

I've integrated PayPal payments into your Stories in the Sky app! Here's what's ready:

### ✅ Backend Functions Created
- `paypal-create-order`: Creates a payment order
- `paypal-capture-order`: Captures the payment after user approval

### ✅ Secrets Configured
You've already added these secrets through the secure form:
- `PAYPAL_CLIENT_ID` - Your PayPal app Client ID
- `PAYPAL_CLIENT_SECRET` - Your PayPal app Secret Key
- `PAYPAL_MODE` - Set to "sandbox" for testing or "live" for production

## Where to Get Your PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your PayPal account
3. Click "Apps & Credentials"
4. Choose "Sandbox" for testing or "Live" for real payments
5. Create an app or select an existing one
6. Copy the **Client ID** and **Secret Key**

**Important:** 
- Use **Sandbox** credentials during development/testing
- Switch to **Live** credentials only when ready for real payments
- Update the `PAYPAL_MODE` secret to "live" when going to production

## How to Use PayPal in Your App

Here's example code to integrate PayPal checkout:

```typescript
import { supabase } from "@/integrations/supabase/client";

// 1. Create PayPal order
const createPayPalOrder = async (amount: number) => {
  const { data, error } = await supabase.functions.invoke("paypal-create-order", {
    body: {
      amount: amount, // e.g., 9.99
      currency: "USD",
      description: "Premium Constellation Story",
    },
  });

  if (error) {
    console.error("Error creating order:", error);
    return null;
  }

  return data.orderId;
};

// 2. After user approves payment, capture it
const capturePayPalOrder = async (orderId: string) => {
  const { data, error } = await supabase.functions.invoke("paypal-capture-order", {
    body: { orderId },
  });

  if (error) {
    console.error("Error capturing order:", error);
    return false;
  }

  return data.success;
};

// 3. Example usage in a component
const handlePayment = async () => {
  // Step 1: Create order
  const orderId = await createPayPalOrder(9.99);
  
  if (!orderId) {
    alert("Failed to create order");
    return;
  }

  // Step 2: Redirect user to PayPal for approval
  // You can get the approval URL from the order creation response
  const approvalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;
  window.location.href = approvalUrl;

  // Step 3: After user returns from PayPal, capture the order
  // (You'll need to handle the redirect back to your app)
  const captured = await capturePayPalOrder(orderId);
  
  if (captured) {
    alert("Payment successful!");
  }
};
```

## Testing PayPal Integration

1. Use PayPal Sandbox accounts for testing (created at developer.paypal.com)
2. Test buyer accounts: Use the test buyer credentials from your sandbox
3. No real money is charged in sandbox mode
4. Check transaction logs in PayPal Developer Dashboard → Sandbox → Accounts

## Going Live

When ready for production:
1. Create a Live app in PayPal Developer Dashboard
2. Update the secrets:
   - Replace `PAYPAL_CLIENT_ID` with live Client ID
   - Replace `PAYPAL_CLIENT_SECRET` with live Secret Key  
   - Change `PAYPAL_MODE` to "live"
3. Test thoroughly before launching!

## Current Status

✅ PayPal backend functions are deployed and ready
✅ Secrets are configured
⏳ You need to add the frontend payment flow to your app

The backend is ready - you just need to add payment buttons and flows in your UI!
