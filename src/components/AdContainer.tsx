import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdContainerProps {
  isVisible: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[] & { loaded?: boolean };
  }
}

export const AdContainer = ({ isVisible }: AdContainerProps) => {
  const adRef = React.useRef<HTMLModElement>(null);
  const [adInitialized, setAdInitialized] = React.useState(false);
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    if (isVisible && !adInitialized && adRef.current) {
      // Small delay to ensure AdSense script is loaded
      const timer = setTimeout(() => {
        try {
          if (window.adsbygoogle && window.adsbygoogle.loaded) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdInitialized(true);
          } else {
            // AdSense not ready yet, show fallback
            setShowFallback(true);
          }
        } catch (e) {
          console.log("AdSense initializing...", e);
          setShowFallback(true);
        }
      }, 1000);

      // Fallback timer - if ad doesn't load in 5 seconds, show fallback
      const fallbackTimer = setTimeout(() => {
        if (!adInitialized) {
          setShowFallback(true);
        }
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      };
    }
  }, [isVisible, adInitialized]);

  // Reset state when visibility changes
  React.useEffect(() => {
    if (!isVisible) {
      setAdInitialized(false);
      setShowFallback(false);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-3 left-3 z-30"
        >
          <div className="bg-background/40 backdrop-blur-sm rounded-lg p-2 w-[280px] h-[75px] sm:w-[300px] sm:h-[80px] overflow-hidden border border-white/10 shadow-lg flex items-center justify-center">
            {/* AdSense Ad */}
            <ins
              ref={adRef}
              className="adsbygoogle"
              style={{ 
                display: showFallback ? "none" : "block", 
                width: "100%", 
                height: "100%",
                minHeight: "60px"
              }}
              data-ad-client="ca-pub-9522684726063783"
              data-ad-format="horizontal"
              data-full-width-responsive="false"
            ></ins>
            
            {/* Fallback message when ads aren't loading */}
            {showFallback && (
              <div className="text-center text-white/60 text-xs px-2">
                <p className="font-medium">✨ Create your constellation!</p>
                <p className="text-[10px] opacity-70">Ads loading...</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
