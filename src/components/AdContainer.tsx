import { motion, AnimatePresence } from "framer-motion";

interface AdContainerProps {
  isVisible: boolean;
}

export const AdContainer = ({ isVisible }: AdContainerProps) => {
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
          <div className="glass-panel p-4 w-[300px] h-[100px] sm:w-[320px] sm:h-[100px]">
            {/* Ad content placeholder */}
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <div className="text-foreground/60 text-xs mb-2">Advertisement</div>
              <div className="text-foreground/80 text-sm font-semibold mb-1">
                Your Ad Here
              </div>
              <div className="text-foreground/60 text-xs">
                Support our cosmic journey
              </div>
            </div>

            {/* To integrate Google AdSense, replace the above placeholder with: */}
            {/* 
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
            */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
