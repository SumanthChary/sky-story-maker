import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonate: (amount: number) => Promise<void>;
  isProcessing: boolean;
  isDonationSuccess: boolean;
}

const PRESET_AMOUNTS = [5, 10, 25, 50];

export const DonationModal = ({
  isOpen,
  onClose,
  onDonate,
  isProcessing,
  isDonationSuccess,
}: DonationModalProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const handleDonate = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (amount && amount > 0) {
      await onDonate(amount);
    }
  };

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-[101]"
          >
            <div className="glass-panel p-6 sm:p-8 relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {isDonationSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Thank You! 💫
                  </h3>
                  <p className="text-foreground/80">
                    Your support helps keep the stars shining bright!
                  </p>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center">
                    Support Our Cosmic Journey
                  </h2>
                  <p className="text-foreground/80 mb-6 text-center text-sm sm:text-base">
                    Help us keep the constellation stories alive ✨
                  </p>

                  {/* Preset amounts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {PRESET_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handlePresetClick(amount)}
                        disabled={isProcessing}
                        className={`glass-button p-4 text-center transition-all duration-200 ${
                          selectedAmount === amount
                            ? "ring-2 ring-primary scale-105"
                            : ""
                        }`}
                      >
                        <div className="text-2xl font-bold text-foreground">
                          ${amount}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom amount */}
                  <div className="mb-6">
                    <label className="block text-foreground/80 mb-2 text-sm">
                      Or enter custom amount:
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => handleCustomChange(e.target.value)}
                      disabled={isProcessing}
                      min="1"
                      step="0.01"
                      className="bg-background/50 border-glass-border/20 text-foreground placeholder:text-foreground/40"
                    />
                  </div>

                  {/* Donate button */}
                  <Button
                    onClick={handleDonate}
                    disabled={
                      isProcessing ||
                      (!selectedAmount && !customAmount) ||
                      (customAmount && parseFloat(customAmount) <= 0)
                    }
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>❤️ Donate Now</>
                    )}
                  </Button>

                  <p className="text-foreground/60 text-xs text-center mt-4">
                    Secured by PayPal
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
