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
            <ins
              className="adsbygoogle"
              style={{ display: "block", width: "100%", height: "100%" }}
              data-ad-client="ca-pub-9522684726063783"
              data-ad-slot="YOUR_AD_UNIT_ID"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
