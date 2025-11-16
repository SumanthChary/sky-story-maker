import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Database } from '@/integrations/supabase/types';

type SavedConstellation = Database['public']['Tables']['saved_constellations']['Row'];

export const ConstellationLibrary = () => {
  const { user } = useAuth();
  const [constellations, setConstellations] = useState<SavedConstellation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConstellations();
    }
  }, [user]);

  const loadConstellations = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_constellations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConstellations(data || []);
    } catch (error) {
      console.error('Error loading constellations:', error);
      toast.error('Failed to load your constellations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_constellations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setConstellations(prev => prev.filter(c => c.id !== id));
      toast.success('Constellation deleted');
    } catch (error) {
      console.error('Error deleting constellation:', error);
      toast.error('Failed to delete constellation');
    }
  };

  const handleDownload = (constellation: SavedConstellation) => {
    if (!constellation.image_data) {
      toast.error('No image data available');
      return;
    }

    const link = document.createElement('a');
    link.href = constellation.image_data;
    link.download = `${constellation.name}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading your constellations...</div>
      </div>
    );
  }

  if (constellations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-2xl font-bold mb-2">No Constellations Yet</h3>
        <p className="text-muted-foreground">
          Start creating constellations to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {constellations.map((constellation, index) => (
        <motion.div
          key={constellation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-background/40 backdrop-blur-sm border-border/50 overflow-hidden hover:border-primary/50 transition-colors">
            {constellation.image_data && (
              <div className="aspect-video bg-background/20 overflow-hidden">
                <img
                  src={constellation.image_data}
                  alt={constellation.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-lg truncate">{constellation.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {constellation.story}
              </p>
              <div className="text-xs text-muted-foreground">
                {new Date(constellation.created_at).toLocaleDateString()}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(constellation)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(constellation.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};