# 💰 Monetization Guide - Stories in the Sky

This guide explains how to set up and manage the donation and advertising features in your constellation app.

## 🎁 Donation System (PayPal)

### What's Implemented

A complete PayPal donation system with:
- **Donation Button**: Fixed in top-right corner with heart icon
- **Beautiful Modal**: Glassmorphism design with preset amounts ($5, $10, $25, $50) and custom input
- **Smooth Flow**: Opens PayPal popup, processes payment, shows success message
- **Mobile Responsive**: Adapts perfectly to all screen sizes

### Setup Instructions

#### Step 1: Get PayPal API Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your PayPal account
3. Navigate to **My Apps & Credentials**
4. Under **REST API apps**, click **Create App**
5. Name your app (e.g., "Stories in the Sky Donations")
6. Copy your **Client ID** and **Secret Key**

#### Step 2: Configure Secrets in Lovable

The PayPal secrets should already be added to your Lovable Cloud backend:
- `PAYPAL_CLIENT_ID` - Your PayPal app's Client ID
- `PAYPAL_CLIENT_SECRET` - Your PayPal app's Secret Key
- `PAYPAL_MODE` - Set to `sandbox` for testing or `live` for production

**These are already configured** from your previous setup. If you need to update them:
1. Click the "Cloud" tab in Lovable
2. Navigate to "Secrets"
3. Update the values as needed

#### Step 3: Testing with Sandbox

1. Make sure `PAYPAL_MODE` is set to `sandbox`
2. Create a [PayPal Sandbox Account](https://developer.paypal.com/dashboard/accounts)
3. Use sandbox test credentials when making donations
4. Test the full flow: click donate → choose amount → complete PayPal payment

#### Step 4: Go Live

1. Update `PAYPAL_MODE` secret to `live`
2. Update `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` with **Live** credentials from your PayPal app
3. Test with a small real donation first
4. Monitor your PayPal account to see incoming donations

### How Users Donate

1. User clicks the **"Support ❤️"** button in top-right corner
2. Beautiful modal opens with preset donation amounts
3. User selects amount or enters custom amount
4. Clicks **"❤️ Donate Now"** button
5. PayPal popup opens for secure payment
6. After payment, success message appears with special effects
7. Modal can be closed, donation is complete!

---

## 📢 Advertising System (Google AdSense)

### What's Implemented

A non-intrusive ad container with:
- **Smart Positioning**: Bottom-left corner, small footprint (300x100px)
- **Glassmorphism Design**: Blends beautifully with cosmic theme
- **Auto Hide/Show**: Fades out during constellation generation and story display
- **Mobile Responsive**: Adapts to different screen sizes

### Setup Instructions

#### Step 1: Get Google AdSense Account

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up or log in with your Google account
3. Add your website domain for review
4. Wait for approval (usually 1-2 days)

#### Step 2: Get Your Publisher ID

1. In AdSense dashboard, go to **Account Settings**
2. Copy your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)

#### Step 3: Create Ad Unit

1. Go to **Ads** → **Overview** → **By ad unit**
2. Click **Create ad unit**
3. Choose **Display ads**
4. Name it (e.g., "Constellation Canvas Banner")
5. Select **Responsive** ad size
6. Click **Create**
7. Copy your **Ad Unit ID**

#### Step 4: Integrate AdSense Code

1. Open `src/components/AdContainer.tsx`
2. Replace the placeholder section with your actual AdSense code:

```tsx
<ins
  className="adsbygoogle"
  style={{ display: "block" }}
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"  // Your Publisher ID
  data-ad-slot="XXXXXXXXXX"                   // Your Ad Unit ID
  data-ad-format="auto"
  data-full-width-responsive="true"
></ins>
```

3. Add the AdSense script to `index.html` in the `<head>` section:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

4. Initialize the ad in the component (already handled in the code)

### Ad Behavior

- **Visible**: When user is placing stars on canvas
- **Hidden**: During constellation generation and story display
- **Smooth Transitions**: Fades in/out elegantly
- **Never Intrusive**: Small, corner placement, matches design

---

## 🎨 Design Preservation

### What Was NOT Changed

✅ Canvas click functionality  
✅ Star placement logic  
✅ Constellation pattern detection  
✅ AI story generation  
✅ All existing animations  
✅ Background effects  
✅ Existing UI controls  
✅ Color scheme and styling  

### What Was Added

✅ Donation button (absolute positioned, top-right)  
✅ Donation modal (overlay, doesn't affect layout)  
✅ Ad container (absolute positioned, bottom-left)  
✅ All using existing design system (glassmorphism, cosmic colors)  

---

## 📊 Expected Revenue

### Donations
- Average donation: $10-25
- Conversion rate: 0.5-2% of users
- For 1,000 users: $50-500/month

### Ads
- CPM (cost per 1,000 impressions): $1-5
- For 10,000 page views: $10-50/month
- Depends heavily on niche and traffic

### Tips to Increase Revenue

**For Donations:**
- Add thank you message in constellation story for donors
- Offer special features for supporters
- Share donation impact (e.g., "Helped generate 1,000 stories!")

**For Ads:**
- Increase traffic through SEO and social media
- Optimize ad placement (already done)
- Consider multiple ad units (but don't overdo it!)

---

## 🐛 Troubleshooting

### Donations Not Working

1. **Check PayPal Mode**: Make sure it matches your credentials (sandbox vs live)
2. **Verify Secrets**: All three PayPal secrets must be set correctly
3. **Check Browser Console**: Look for error messages
4. **Test Popup Blockers**: Disable them for testing
5. **Try Different Browser**: Some browsers have stricter popup policies

### Ads Not Showing

1. **AdSense Approval**: Make sure your site is approved
2. **Code Integration**: Verify ad code is correctly placed
3. **Script Loading**: Check if AdSense script is in `<head>`
4. **Ad Blockers**: Ads won't show with ad blockers enabled
5. **Give It Time**: New ad units can take 24-48 hours to start serving

---

## 🎯 Next Steps

1. **Test Donations**: Use sandbox mode to test the full flow
2. **Apply for AdSense**: Start the approval process
3. **Monitor Analytics**: Track donation conversion and ad performance
4. **Gather Feedback**: Ask users about donation amounts and ad placement
5. **Iterate**: Adjust based on what works best for your audience

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify all secrets are correctly set
3. Test in sandbox/test mode first
4. Check PayPal/AdSense documentation
5. Reach out to Lovable support if needed

---

**Made with ❤️ for Stories in the Sky**
