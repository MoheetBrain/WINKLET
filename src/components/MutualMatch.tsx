import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface MutualMatchProps {
  open: boolean;
  onStartChat: () => void;
  onKeepWinking: () => void;
  myAvatar?: string;
  theirAvatar?: string;
  myName?: string;
  theirName?: string;
}

// Default placeholder images for demo
const DEFAULT_MY_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80";
const DEFAULT_THEIR_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80";

const MutualMatch = ({
  open,
  onStartChat,
  onKeepWinking,
  myAvatar = DEFAULT_MY_AVATAR,
  theirAvatar = DEFAULT_THEIR_AVATAR,
  myName = "You",
  theirName = "Them",
}: MutualMatchProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      // Trigger confetti explosion
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ["#D946EF", "#A855F7", "#EC4899", "#8B5CF6", "#F472B6"];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      // Initial burst
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors,
      });

      frame();
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -30 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1
              className="text-5xl md:text-6xl font-display font-bold text-white mb-3"
              style={{
                textShadow: "0 0 30px rgba(217, 70, 239, 0.6), 0 0 60px rgba(217, 70, 239, 0.3)",
              }}
            >
              It's a Match!
            </h1>
            <p className="text-lg text-muted-foreground">
              You both winked at each other.
            </p>
          </motion.div>

          {/* Avatars with pulse animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.5 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 200 }}
            className="relative flex items-center justify-center mb-12"
          >
            {/* Glowing pulse background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-64 h-64 rounded-full animate-pulse-glow"
                style={{
                  background: "radial-gradient(circle, rgba(217, 70, 239, 0.4) 0%, rgba(217, 70, 239, 0) 70%)",
                }}
              />
            </div>

            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute w-48 h-48 rounded-full border-2 border-primary/30 animate-ping"
                  style={{
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: "2s",
                  }}
                />
              ))}
            </div>

            {/* Avatar container */}
            <div className="relative flex items-center">
              {/* My avatar */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="relative z-10"
              >
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    background: "linear-gradient(135deg, #D946EF, #A855F7)",
                    filter: "blur(8px)",
                    transform: "scale(1.1)",
                  }}
                />
                <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-primary relative">
                  <AvatarImage src={myAvatar} alt={myName} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                    {myName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* Their avatar - overlapping */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="relative z-20 -ml-8"
              >
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    background: "linear-gradient(135deg, #EC4899, #D946EF)",
                    filter: "blur(8px)",
                    transform: "scale(1.1)",
                    animationDelay: "0.5s",
                  }}
                />
                <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-pink-500 relative">
                  <AvatarImage src={theirAvatar} alt={theirName} />
                  <AvatarFallback className="bg-pink-500/20 text-pink-400 text-2xl font-bold">
                    {theirName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="flex flex-col items-center gap-4 w-full max-w-xs px-4"
          >
            <Button
              onClick={onStartChat}
              className="w-full h-14 text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
              variant="wink"
            >
              Start Chatting
            </Button>
            <Button
              onClick={onKeepWinking}
              variant="ghost"
              className="w-full h-12 text-white/80 hover:text-white border-2 border-white/50 hover:border-white hover:bg-white/10 rounded-full"
            >
              Keep Winking
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MutualMatch;
