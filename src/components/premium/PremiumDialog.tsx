import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PremiumDialog = ({ open, onOpenChange }: PremiumDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in to purchase premium');
      return;
    }

    setLoading(true);

    try {
      // Create PayPal order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'paypal-create-order',
        {
          body: {
            amount: '4.99',
            currency: 'USD',
            description: 'Constellation Creator Premium - One-time Payment'
          }
        }
      );

      if (orderError) throw orderError;

      // Redirect to PayPal
      const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve')?.href;
      if (approvalUrl) {
        window.location.href = approvalUrl;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to initiate purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'HD Downloads (4K resolution, no watermark)',
    '3 AI Story Variations per constellation',
    'Unlimited Constellation Library',
    'Custom Backgrounds (Galaxy, Nebula, Aurora)',
    'Print-Ready Exports (300 DPI)',
    'Priority Support',
    'All Future Premium Features'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur-xl border-border/50 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold text-center">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            One-time payment. Lifetime access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">$4.99</div>
            <p className="text-muted-foreground">Pay once, use forever</p>
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-primary/10 rounded-full">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Upgrade Now
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by PayPal. Cancel anytime for a full refund within 30 days.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};