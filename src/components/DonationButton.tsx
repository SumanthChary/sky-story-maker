import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DonationButtonProps {
  onClick: () => void;
}

export const DonationButton = ({ onClick }: DonationButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="glass-button fixed top-4 right-4 z-50 px-4 py-2 text-foreground hover:scale-110 transition-all duration-300 group"
      size="sm"
    >
      <Heart className="w-4 h-4 mr-2 group-hover:fill-red-500 group-hover:text-red-500 transition-colors duration-300" />
      <span className="hidden sm:inline text-sm font-semibold">Support</span>
      <span className="sm:hidden text-sm font-semibold">❤️</span>
    </Button>
  );
};
