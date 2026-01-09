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
  const adRef = React.useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = React.useState(false);

  React.useEffect(() => {
    if (isVisible && !adLoaded && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (e) {
        console.log("AdSense initializing...");
      }
    }
  }, [isVisible, adLoaded]);

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
          <div className="bg-background/40 backdrop-blur-sm rounded-lg p-2 w-[280px] h-[75px] sm:w-[300px] sm:h-[80px] overflow-hidden border border-white/10 shadow-lg">
            <ins
              ref={adRef}
              className="adsbygoogle"
              style={{ display: "block", width: "100%", height: "100%" }}
              data-ad-client="ca-pub-9522684726063783"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
