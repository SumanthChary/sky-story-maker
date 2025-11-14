import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, Download } from "lucide-react";
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

interface AnimatedLine extends ConstellationLine {
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

const ConstellationCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animatedLines, setAnimatedLines] = useState<AnimatedLine[]>([]);
  const [story, setStory] = useState<ConstellationStory | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [backgroundStars, setBackgroundStars] = useState<BackgroundStar[]>([]);
  const [locale] = useState<Locale>(getBrowserLocale());
  const t = createTranslator(locale);
  const { toast } = useToast();

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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

    setIsGenerating(true);

    const pattern = analyzeStarPattern(stars);
    const connectionLines = calculateConstellationLines(stars, pattern.shapeType);

    // Clear existing lines
    setAnimatedLines([]);

    // Create animated line sequence
    let delay = 0;
    connectionLines.forEach((line, index) => {
      setTimeout(() => {
        setAnimatedLines((prev) => [...prev, { ...line, progress: 0, id: index }]);

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

    // Generate story after animations start
    setTimeout(async () => {
      try {
        const generatedStory = await generateConstellationStory(pattern);
        setStory(generatedStory);
      } catch (error) {
        console.error("Error generating constellation story:", error);
        toast({
          title: t("errorGenerating"),
          description: t("errorGeneratingDescription"),
          variant: "destructive",
        });
        setStory({
          name: t("mysteriousPattern"),
          story: t("mysteriousStory"),
        });
      } finally {
        setIsGenerating(false);
      }
    }, delay + 300);
  };

  const handleCreateNewSky = () => {
    setStars([]);
    setStory(null);
    setAnimatedLines([]);
  };

  const handleSaveConstellation = async () => {
    if (!containerRef.current) return;

    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: "#000000",
      });

      const link = document.createElement("a");
      link.download = `constellation-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: t("savedSuccess"),
        description: t("savedDescription"),
      });
    } catch (error) {
      toast({
        title: t("errorSaving"),
        description: t("errorSavingDescription"),
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, #1a0b2e 0%, #000000 100%)",
      }}
    >
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

      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 cursor-crosshair"
        aria-label="Click to place stars"
      />

      {/* Shooting stars */}
      {shootingStars.map((shootingStar) => (
        <div
          key={shootingStar.id}
          className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star pointer-events-none"
          style={{
            left: shootingStar.startX,
            top: shootingStar.startY,
            boxShadow: "0 0 10px #ffffff, 0 0 20px #8b5cf6",
          }}
        />
      ))}

      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {animatedLines.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x1 + (line.x2 - line.x1) * line.progress}
            y2={line.y1 + (line.y2 - line.y1) * line.progress}
            stroke="rgba(139, 92, 246, 0.6)"
            strokeWidth="2"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
          />
        ))}
      </svg>

      {/* User-placed stars */}
      {stars.map((star) => (
        <motion.div
          key={star.timestamp}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute pointer-events-none"
          style={{
            left: star.x - 4,
            top: star.y - 4,
          }}
        >
          <div className="relative">
            <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
            <div
              className="absolute inset-0 w-2 h-2 bg-white rounded-full blur-sm"
              style={{
                animation: `twinkle 2s ease-in-out infinite ${star.timestamp % 1000}ms`,
              }}
            />
            <div className="absolute -inset-1 bg-white/30 rounded-full blur-md star-glow" />
          </div>
        </motion.div>
      ))}

      {/* Particle effects */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-primary rounded-full animate-particle-burst pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            "--tx": `${Math.cos(particle.angle) * 30}px`,
            "--ty": `${Math.sin(particle.angle) * 30}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* UI Controls */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10 px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-foreground text-center capitalize"
        >
          {t("title")}
        </motion.h1>

        {stars.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-center max-w-md capitalize-first"
          >
            {t("instructions")}
          </motion.p>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-wrap gap-4 justify-center z-10 px-4">
        {stars.length >= 3 && !story && (
          <Button
            onClick={handleRevealConstellation}
            disabled={isGenerating}
            className="glass-button min-h-[44px] min-w-[44px] px-6 py-3 text-foreground font-semibold capitalize-first"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isGenerating ? t("revealingButton") : t("revealButton")}
          </Button>
        )}

        {stars.length > 0 && (
          <Button
            onClick={handleCreateNewSky}
            variant="outline"
            className="glass-button min-h-[44px] min-w-[44px] px-6 py-3 text-foreground font-semibold capitalize-first"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            {t("resetButton")}
          </Button>
        )}

        {story && (
          <Button
            onClick={handleSaveConstellation}
            className="glass-button min-h-[44px] min-w-[44px] px-6 py-3 text-foreground font-semibold capitalize-first"
          >
            <Download className="mr-2 h-5 w-5" />
            {t("saveButton")}
          </Button>
        )}
      </div>

      {/* Story display */}
      <AnimatePresence>
        {story && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-full mx-4 z-20"
          >
            <div className="glass-panel p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-foreground mb-4 capitalize-first">
                {story.name}
              </h2>
              <p className="text-foreground/90 text-lg leading-relaxed">{story.story}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConstellationCanvas;
