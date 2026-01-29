import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, MessageCircle, Lock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MatchNotificationProps {
  open: boolean;
  onClose: () => void;
  onReveal?: () => void;
  isFemaleView?: boolean;
  matchData?: {
    lat: number;
    lng: number;
    timeAgo: string;
    profileImage?: string;
  };
}

// Format coordinates to a readable string
const formatCoords = (lat: number, lng: number) => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
};

const MatchNotification: React.FC<MatchNotificationProps> = ({
  open,
  onClose,
  onReveal,
  isFemaleView = true,
  matchData = {
    lat: 51.5074,
    lng: -0.1278,
    timeAgo: 'yesterday at 3:42 PM',
  },
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-3xl glass border border-primary/20 shadow-elevated overflow-hidden"
          >
            {/* Gradient header */}
            <div className="gradient-primary p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="mx-auto w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-3"
              >
                <Heart className="w-8 h-8 text-primary-foreground animate-heartbeat" fill="currentColor" />
              </motion.div>
              <h2 className="text-xl font-bold text-primary-foreground">
                Someone noticed you!
              </h2>
              <p className="text-primary-foreground/80 text-sm mt-1">
                You crossed paths with a mutual connection
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Location info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Memory location</p>
                  <p className="font-mono font-semibold text-sm text-cyan drop-shadow-[0_0_8px_hsl(var(--cyan)/0.6)]">
                    {formatCoords(matchData.lat, matchData.lng)}
                  </p>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {matchData.timeAgo}
              </p>

              {/* Profile preview */}
              <div className="relative">
                {isFemaleView ? (
                  // Female view - clear profile
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-button">
                      <Eye className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <p className="text-sm font-medium">Tap reveal to see who</p>
                  </div>
                ) : (
                  // Male view - blurred
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-muted blur-lg" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Match nearby. Waiting for reveal...
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {isFemaleView && onReveal && (
                  <Button
                    onClick={onReveal}
                    className="w-full"
                    size="lg"
                    variant="glow"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Reveal & Start Chat
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full"
                >
                  Maybe later
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchNotification;
