import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdContainerProps {
  isVisible: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdContainer = ({ isVisible }: AdContainerProps) => {
  // Initialize AdSense when component mounts
  React.useEffect(() => {
    if (isVisible && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-4 left-4 z-40"
        >
          <div className="glass-panel p-4 w-[300px] h-[100px] sm:w-[320px] sm:h-[100px] overflow-hidden">
            {/* Google AdSense Integration */}
            {/* STEP 1: Replace YOUR_PUBLISHER_ID with your actual AdSense publisher ID */}
            {/* STEP 2: Replace YOUR_AD_UNIT_ID with your ad unit ID */}
            {/* STEP 3: Add AdSense script to index.html (see instructions below) */}
            
            <ins
              className="adsbygoogle"
              style={{ display: "block", width: "100%", height: "100%" }}
              data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
              data-ad-slot="YOUR_AD_UNIT_ID"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>

            {/* Placeholder for testing (remove after AdSense setup) */}
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <div className="text-foreground/60 text-xs mb-2">Advertisement</div>
              <div className="text-foreground/80 text-sm font-semibold mb-1">
                Setup AdSense
              </div>
              <div className="text-foreground/60 text-xs">
                Follow MONETIZATION_GUIDE.md
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
