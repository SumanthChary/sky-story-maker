import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Coffee, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SettingsPage = () => {
  const { user, profile, signOut } = useAuth();
  const [donating, setDonating] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const handleDonate = async () => {
    setDonating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('paypal-create-order', {
        body: {
          amount: '3.00',
          currency: 'USD',
          description: 'Support Constellation Creator ☕'
        }
      });

      if (error) throw error;

      const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;
      if (approvalUrl) {
        window.location.href = approvalUrl;
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to process donation');
    } finally {
      setDonating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card className="p-6 bg-background/40 backdrop-blur-sm border-border/50">
        <h2 className="text-xl font-bold mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-muted-foreground">Display Name</div>
            <div className="font-medium">{profile?.display_name || 'Not set'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{user?.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Account Status</div>
            <div className="flex items-center gap-2">
              {profile?.is_premium ? (
                <>
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">Premium Member</span>
                </>
              ) : (
                <span className="font-medium">Free Account</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Constellations Created</div>
            <div className="font-medium">{profile?.constellation_count || 0}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Coffee className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Support the Project</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Love creating constellations? Buy me a coffee to support development of more creative tools!
            </p>
            <Button
              onClick={handleDonate}
              disabled={donating}
              variant="default"
            >
              <Coffee className="mr-2 h-4 w-4" />
              {donating ? 'Processing...' : 'Buy Me a Coffee ($3)'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-background/40 backdrop-blur-sm border-border/50">
        <h2 className="text-xl font-bold mb-4">Actions</h2>
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </Card>
    </div>
  );
};