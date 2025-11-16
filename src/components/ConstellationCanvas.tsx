import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, Download, Library, Settings, User, Bookmark, Palette } from "lucide-react";
import { generateConstellationStory } from "@/lib/claude";
import type { ConstellationStory } from "@/lib/claude";
import {
  analyzeStarPattern,
  calculateConstellationLines,
  type Star,
  type ConstellationLine,
} from "@/lib/patternAnalysis";
import { getBrowserLocale, createTranslator, type Locale } from "@/lib/translations";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { PremiumDialog } from "@/components/premium/PremiumDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnimatedLine {
  from: Star;
  to: Star;
  progress: number;
  id: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
}

interface BackgroundStar {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkle: number;
}

type BackgroundType = 'default' | 'galaxy' | 'nebula' | 'aurora';

const ConstellationCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animatedLines, setAnimatedLines] = useState<AnimatedLine[]>([]);
  const [stories, setStories] = useState<ConstellationStory[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [backgroundStars, setBackgroundStars] = useState<BackgroundStar[]>([]);
  const [locale] = useState<Locale>(getBrowserLocale());
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const [background, setBackground] = useState<BackgroundType>('default');
  const t = createTranslator(locale);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Generate background stars on mount
  useEffect(() => {
    const bgStars: BackgroundStar[] = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2,
      opacity: Math.random() * 0.8,
      twinkle: Math.random() * 3 + 1,
    }));
    setBackgroundStars(bgStars);
  }, []);

  // Background canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Shooting stars effect
  useEffect(() => {
    const interval = setInterval(() => {
      const newShootingStar: ShootingStar = {
        id: Date.now(),
        startX: Math.random() * window.innerWidth,
        startY: Math.random() * (window.innerHeight / 2),
      };
      setShootingStars((prev) => [...prev, newShootingStar]);

      setTimeout(() => {
        setShootingStars((prev) => prev.filter((s) => s.id !== newShootingStar.id));
      }, 1500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isGenerating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Add star
    const newStar: Star = {
      x,
      y,
      timestamp: Date.now(),
    };
    setStars((prev) => [...prev, newStar]);

    // Create particle burst
    const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (i * Math.PI * 2) / 8,
    }));
    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 600);
  };

  const handleRevealConstellation = async () => {
    if (stars.length < 3) {
      toast({
        title: t("notEnoughStars"),
        description: t("minStarsAlert"),
        variant: "destructive",
      });
      return;
    }

    // Check if premium upgrade prompt needed (after 3rd constellation for free users)
    if (user && profile && !profile.is_premium && profile.constellation_count >= 3) {
      setPremiumDialogOpen(true);
    }

    setIsGenerating(true);

    const pattern = analyzeStarPattern(stars);
    const connectionLines = calculateConstellationLines(stars, pattern.shapeType);

    // Clear existing lines
    setAnimatedLines([]);
    setStories([]);
    setCurrentStoryIndex(0);

    // Create animated line sequence
    let delay = 0;
    connectionLines.forEach((line, index) => {
      setTimeout(() => {
        setAnimatedLines((prev) => [...prev, { 
          from: { x: line.x1, y: line.y1, timestamp: Date.now() },
          to: { x: line.x2, y: line.y2, timestamp: Date.now() },
          progress: 0, 
          id: index 
        }]);

        const startTime = Date.now();
        const duration = 200;

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          setAnimatedLines((prev) => prev.map((l) => (l.id === index ? { ...l, progress } : l)));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      }, delay);

      delay += 100;
    });

    // Generate stories
    setTimeout(async () => {
      try {
        const variationsCount = profile?.is_premium ? 3 : 1;
        const generatedStories: ConstellationStory[] = [];

        for (let i = 0; i < variationsCount; i++) {
          const story = await generateConstellationStory(pattern);
          generatedStories.push(story);
        }

        setStories(generatedStories);

        // Update constellation count if user is logged in
        if (user && profile) {
          await supabase
            .from('profiles')
            .update({ constellation_count: profile.constellation_count + 1 })
            .eq('id', user.id);
          
          await refreshProfile();
        }
      } catch (error) {
        console.error("Error generating constellation story:", error);
        toast({
          title: t("errorGenerating"),
          description: t("errorGeneratingDescription"),
          variant: "destructive",
        });
        setStories([{
          name: t("mysteriousPattern"),
          story: t("mysteriousStory"),
        }]);
      } finally {
        setIsGenerating(false);
      }
    }, delay + 300);
  };

  const handleCreateNewSky = () => {
    setStars([]);
    setStories([]);
    setCurrentStoryIndex(0);
    setAnimatedLines([]);
  };

  const handleSaveToLibrary = async () => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    if (!containerRef.current || stories.length === 0) return;

    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: "#000000",
      });

      const imageData = canvas.toDataURL();
      const currentStory = stories[currentStoryIndex];

      const { error } = await supabase
        .from('saved_constellations')
        .insert([{
          user_id: user.id,
          name: currentStory.name,
          story: currentStory.story,
          stars: stars as any,
          background_type: background,
          image_data: imageData,
        }]);

      if (error) throw error;

      sonnerToast.success('Constellation saved to your library!', {
        description: 'View it anytime in your library',
        action: {
          label: 'View Library',
          onClick: () => navigate('/library'),
        },
      });
    } catch (error) {
      console.error('Error saving:', error);
      sonnerToast.error('Failed to save constellation');
    }
  };

  const handleDownload = async () => {
    if (!containerRef.current) return;

    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: "#000000",
      });

      const link = document.createElement("a");
      link.download = `constellation-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();

      // Show donation CTA after save if user has saved 2+ times
      if (user && profile && profile.constellation_count >= 2) {
        sonnerToast.success('Constellation saved!', {
          description: 'Enjoying the app? Support development ☕',
          action: {
            label: 'Buy Coffee',
            onClick: () => navigate('/settings'),
          },
        });
      } else {
        sonnerToast.success('Constellation downloaded!');
      }
    } catch (error) {
      sonnerToast.error('Failed to download');
      console.error(error);
    }
  };

  const getBackgroundStyle = () => {
    switch (background) {
      case 'galaxy':
        return {
          background: "radial-gradient(ellipse at center, #2d1b4e 0%, #1a0b2e 50%, #000000 100%)",
        };
      case 'nebula':
        return {
          background: "radial-gradient(ellipse at center, #4a1942 0%, #2d1b4e 40%, #000000 100%)",
        };
      case 'aurora':
        return {
          background: "radial-gradient(ellipse at center, #1e3a3a 0%, #1a0b2e 50%, #000000 100%)",
        };
      default:
        return {
          background: "radial-gradient(ellipse at center, #1a0b2e 0%, #000000 100%)",
        };
    }
  };

  const isPremium = profile?.is_premium || false;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden touch-none"
      style={getBackgroundStyle()}
    >
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/10 backdrop-blur-sm border-b border-border/20">
        <h1 className="text-xl md:text-2xl font-bold">✨ Constellation Creator</h1>
        
        <div className="flex items-center gap-2">
          {!isPremium && (
            <Button
              variant="default"
              size="sm"
              onClick={() => user ? setPremiumDialogOpen(true) : setAuthDialogOpen(true)}
              className="hidden md:flex"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile?.display_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/library')}>
                  <Library className="mr-2 h-4 w-4" />
                  My Library
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {!isPremium && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setPremiumDialogOpen(true)}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setAuthDialogOpen(true)}>
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Background stars */}
      {backgroundStars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: `twinkle ${star.twinkle}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ x: star.startX, y: star.startY, opacity: 1 }}
          animate={{
            x: star.startX + 200,
            y: star.startY + 200,
            opacity: 0,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] pointer-events-none"
          style={{
            boxShadow: "0 0 10px 2px rgba(255,255,255,0.8), 0 0 20px 4px rgba(147,197,253,0.4)",
          }}
        />
      ))}

      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 cursor-crosshair"
      />

      {/* Animated constellation lines */}
      <svg className="absolute inset-0 pointer-events-none">
        {animatedLines.map((line) => {
          const dx = line.to.x - line.from.x;
          const dy = line.to.y - line.from.y;
          const endX = line.from.x + dx * line.progress;
          const endY = line.from.y + dy * line.progress;

          return (
            <line
              key={line.id}
              x1={line.from.x}
              y1={line.from.y}
              x2={endX}
              y2={endY}
              stroke="rgba(147, 197, 253, 0.6)"
              strokeWidth="2"
              className="drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]"
            />
          );
        })}
      </svg>

      {/* User-placed stars */}
      {stars.map((star, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute w-3 h-3 -ml-1.5 -mt-1.5 pointer-events-none"
          style={{ left: star.x, top: star.y }}
        >
          <div className="w-full h-full rounded-full bg-blue-200 shadow-[0_0_10px_2px_rgba(147,197,253,0.8),0_0_20px_4px_rgba(59,130,246,0.6)]" />
        </motion.div>
      ))}

      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: particle.x + Math.cos(particle.angle) * 40,
            y: particle.y + Math.sin(particle.angle) * 40,
            opacity: 0,
            scale: 0.5,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute w-1 h-1 rounded-full bg-blue-300 pointer-events-none"
        />
      ))}

      {/* Title and Instructions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-20 left-0 right-0 text-center pointer-events-none px-4"
      >
        <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
          {t("instructions")}
        </p>
      </motion.div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row gap-3 z-10">
        {isPremium && stories.length === 0 && (
          <Select value={background} onValueChange={(value) => setBackground(value as BackgroundType)}>
            <SelectTrigger className="w-[180px] bg-background/80 backdrop-blur-sm">
              <Palette className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="galaxy">Galaxy</SelectItem>
              <SelectItem value="nebula">Nebula</SelectItem>
              <SelectItem value="aurora">Aurora</SelectItem>
            </SelectContent>
          </Select>
        )}

        {stars.length >= 3 && stories.length === 0 && (
          <Button
            onClick={handleRevealConstellation}
            disabled={isGenerating}
            size="lg"
            className="bg-primary/90 backdrop-blur-sm hover:bg-primary"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin mr-2">✨</div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2" />
                Reveal Constellation
              </>
            )}
          </Button>
        )}

        {stories.length > 0 && (
          <>
            <Button
              onClick={handleCreateNewSky}
              variant="secondary"
              size="lg"
              className="bg-background/80 backdrop-blur-sm"
            >
              <RotateCcw className="mr-2" />
              New Sky
            </Button>
            {user && (
              <Button
                onClick={handleSaveToLibrary}
                variant="secondary"
                size="lg"
                className="bg-background/80 backdrop-blur-sm"
              >
                <Bookmark className="mr-2" />
                Save
              </Button>
            )}
            <Button
              onClick={handleDownload}
              variant="secondary"
              size="lg"
              className="bg-background/80 backdrop-blur-sm"
            >
              <Download className="mr-2" />
              Download
            </Button>
          </>
        )}
      </div>

      {/* Story Display */}
      <AnimatePresence>
        {stories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl"
          >
            <div className="bg-background/90 backdrop-blur-xl p-6 rounded-lg border border-border/50 shadow-2xl">
              {/* Watermark for free users */}
              {!isPremium && (
                <div className="mb-4 p-3 bg-primary/10 rounded-md border border-primary/20">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Free Version</span> - Unlock 3 story variations
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setPremiumDialogOpen(true)}
                      className="ml-2"
                    >
                      Upgrade
                    </Button>
                  </div>
                </div>
              )}

              <h2 className="text-2xl font-bold mb-3 text-primary">
                {stories[currentStoryIndex].name}
              </h2>
              <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-line">
                {stories[currentStoryIndex].story}
              </p>

              {/* Story variations selector */}
              {stories.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">Variation:</span>
                  {stories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStoryIndex(index)}
                      className={`w-8 h-8 rounded-full transition-colors ${
                        index === currentStoryIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/50 hover:bg-background/70'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <PremiumDialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen} />
    </div>
  );
};

export default ConstellationCanvas;