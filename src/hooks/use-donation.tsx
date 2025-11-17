import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDonation = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDonationSuccess, setIsDonationSuccess] = useState(false);
  const { toast } = useToast();

  const processDonation = async (amount: number): Promise<void> => {
    setIsProcessing(true);
    setIsDonationSuccess(false);

    try {
      // Step 1: Create PayPal order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "paypal-create-order",
        {
          body: {
            amount: amount.toFixed(2),
            currency: "USD",
            description: "Donation - Stories in the Sky",
          },
        }
      );

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw new Error("Failed to create donation order");
      }

      if (!orderData?.id) {
        throw new Error("No order ID received");
      }

      // Step 2: Find approval URL
      const approvalUrl = orderData.links?.find(
        (link: any) => link.rel === "approve"
      )?.href;

      if (!approvalUrl) {
        throw new Error("No approval URL found");
      }

      // Step 3: Open PayPal in popup
      const popup = window.open(
        approvalUrl,
        "PayPal Donation",
        "width=500,height=600,scrollbars=yes"
      );

      if (!popup) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups to complete the donation",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Step 4: Wait for popup to close (user completes payment)
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          // Capture the order after popup closes
          captureOrder(orderData.id);
        }
      }, 500);

    } catch (error: any) {
      console.error("Donation error:", error);
      toast({
        title: "Donation Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const captureOrder = async (orderId: string) => {
    try {
      const { data: captureData, error: captureError } =
        await supabase.functions.invoke("paypal-capture-order", {
          body: { orderId },
        });

      if (captureError) {
        console.error("Capture error:", captureError);
        throw new Error("Failed to process donation");
      }

      if (captureData?.status === "COMPLETED") {
        setIsDonationSuccess(true);
        toast({
          title: "Thank You! 💫",
          description: "Your donation means the world to us!",
        });
      } else {
        throw new Error("Donation was not completed");
      }
    } catch (error: any) {
      console.error("Capture error:", error);
      toast({
        title: "Processing Error",
        description: error.message || "Unable to confirm donation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDonation = () => {
    setIsDonationSuccess(false);
    setIsProcessing(false);
  };

  return {
    processDonation,
    isProcessing,
    isDonationSuccess,
    resetDonation,
  };
};
