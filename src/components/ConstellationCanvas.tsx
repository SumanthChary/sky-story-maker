import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, Download } from "lucide-react";
import { generateConstellationStory } from "@/lib/claude";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";

interface Star {
  x: number;
  y: number;
  timestamp: number;
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

interface ConstellationStory {
  name: string;
  story: string;
}

const ConstellationCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [story, setStory] = useState<ConstellationStory | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Background parallax stars
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

    // Draw background stars
    const drawBackgroundStars = () => {
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawBackgroundStars();

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

  // Draw constellation lines
  useEffect(() => {
    if (!story || stars.length < 3) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "rgba(139, 92, 246, 0.5)";
    ctx.lineWidth = 2;

    // Draw lines between consecutive stars
    ctx.beginPath();
    stars.forEach((star, index) => {
      if (index === 0) {
        ctx.moveTo(star.x, star.y);
      } else {
        ctx.lineTo(star.x, star.y);
      }
    });
    ctx.stroke();
  }, [story, stars]);

  const detectPattern = (starArray: Star[]): string => {
    if (starArray.length < 3) return "scattered";

    // Calculate centroid
    const centroidX = starArray.reduce((sum, s) => sum + s.x, 0) / starArray.length;
    const centroidY = starArray.reduce((sum, s) => sum + s.y, 0) / starArray.length;

    // Calculate average distance from centroid
    const avgDistance =
      starArray.reduce((sum, s) => {
        const dx = s.x - centroidX;
        const dy = s.y - centroidY;
        return sum + Math.sqrt(dx * dx + dy * dy);
      }, 0) / starArray.length;

    // Determine pattern
    if (avgDistance < 100) return "cluster";
    if (starArray.length === 3) return "triangle";

    // Check if roughly collinear
    const slopes = [];
    for (let i = 0; i < starArray.length - 1; i++) {
      const slope = (starArray[i + 1].y - starArray[i].y) / (starArray[i + 1].x - starArray[i].x);
      slopes.push(slope);
    }
    const avgSlope = slopes.reduce((sum, s) => sum + s, 0) / slopes.length;
    const slopeVariance =
      slopes.reduce((sum, s) => sum + Math.pow(s - avgSlope, 2), 0) / slopes.length;

    if (slopeVariance < 1) return "line";

    return "scattered";
  };

  const handleRevealConstellation = async () => {
    if (stars.length < 3) {
      toast({
        title: "Not enough stars",
        description: "Place at least 3 stars to create a constellation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const pattern = detectPattern(stars);
      const generatedStory = await generateConstellationStory(stars.length, pattern);
      setStory(generatedStory);
    } catch (error) {
      toast({
        title: "Error generating story",
        description: "Failed to generate constellation story. Please check your API key.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateNewSky = () => {
    setStars([]);
    setStory(null);

    // Clear canvas and redraw background
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw background stars
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
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
        title: "Saved successfully",
        description: "Your constellation has been saved as an image",
      });
    } catch (error) {
      toast({
        title: "Error saving",
        description: "Failed to save constellation",
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
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 cursor-crosshair"
      />

      {/* Shooting stars */}
      {shootingStars.map((shootingStar) => (
        <div
          key={shootingStar.id}
          className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star"
          style={{
            left: shootingStar.startX,
            top: shootingStar.startY,
            boxShadow: "0 0 10px #ffffff, 0 0 20px #8b5cf6",
          }}
        />
      ))}

      {/* User-placed stars */}
      {stars.map((star, index) => (
        <motion.div
          key={star.timestamp}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute w-2 h-2 bg-white rounded-full star-glow"
          style={{
            left: star.x - 4,
            top: star.y - 4,
            animation: `twinkle 2s ease-in-out infinite ${index * 0.3}s`,
          }}
        />
      ))}

      {/* Particle effects */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-primary rounded-full animate-particle-burst"
          style={{
            left: particle.x,
            top: particle.y,
            "--tx": `${Math.cos(particle.angle) * 30}px`,
            "--ty": `${Math.sin(particle.angle) * 30}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* UI Controls */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-foreground text-center"
        >
          Stories in the sky
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center"
        >
          Click anywhere to place stars and create your constellation
        </motion.p>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-wrap gap-4 justify-center z-10">
        {stars.length >= 3 && !story && (
          <Button
            onClick={handleRevealConstellation}
            disabled={isGenerating}
            className="glass-button min-h-[44px] min-w-[44px] px-6 py-3 text-foreground font-semibold"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isGenerating ? "Revealing..." : "Reveal constellation"}
          </Button>
        )}

        {stars.length > 0 && (
          <Button
            onClick={handleCreateNewSky}
            variant="outline"
            className="glass-button min-h-[44px] min-w-[44px] px-6 py-3 text-foreground font-semibold"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Create new sky
          </Button>
        )}

        {story && (
          <Button
            onClick={handleSaveConstellation}
            className="glass-button min-h-[44px] min-w-[44px] px-6 py-3 text-foreground font-semibold"
          >
            <Download className="mr-2 h-5 w-5" />
            Save my constellation
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
              <h2 className="text-3xl font-bold text-foreground mb-4 capitalize">
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
