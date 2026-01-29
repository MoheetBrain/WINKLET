import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface SuccessOverlayProps {
  open: boolean;
  onClose: () => void;
  location: { lat: number; lng: number };
}

// Format coordinates to a readable string
const formatCoords = (lat: number, lng: number) => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
};

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ open, onClose, location }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      // Trigger confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const colors = ['#8b5cf6', '#a855f7', '#ec4899', '#f472b6'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      setTimeout(() => setShowContent(true), 300);
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative max-w-sm mx-4 p-8 rounded-3xl glass border border-primary/20 shadow-elevated text-center"
          >
            {/* Success checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="mx-auto w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6 shadow-glow"
            >
              <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
            </motion.div>

            {/* Content */}
            {showContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold">
                  <span className="text-gradient">Wink Dropped!</span>
                </h2>
                
                <p className="text-muted-foreground">
                  Your moment has been saved at
                </p>

                {/* Coordinates Display */}
                <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary/10 border border-primary/20">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-mono font-semibold text-lg text-cyan drop-shadow-[0_0_8px_hsl(var(--cyan)/0.6)]">
                    {formatCoords(location.lat, location.lng)}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  If someone noticed you too, you'll match within 24 hours
                </p>

                {/* Close button */}
                <Button 
                  onClick={onClose} 
                  variant="glass" 
                  size="lg"
                  className="w-full mt-4"
                >
                  <Sparkles className="w-4 h-4" />
                  Got it
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessOverlay;
