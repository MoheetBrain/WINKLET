import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Target, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Wink {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
  radius: number;
  hasMatch?: boolean;
}

interface WinkDetailProps {
  open: boolean;
  onClose: () => void;
  onOpenChat: () => void;
  wink: Wink | null;
}

// Format coordinates to a readable string
const formatCoords = (lat: number, lng: number) => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
};

const WinkDetail: React.FC<WinkDetailProps> = ({ open, onClose, onOpenChat, wink }) => {
  if (!wink) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-3xl glass border border-primary/20 shadow-elevated overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  wink.hasMatch 
                    ? 'gradient-secondary shadow-[0_0_20px_hsl(var(--secondary)/0.4)]' 
                    : 'bg-primary/20'
                }`}>
                  <MapPin className={`w-7 h-7 ${wink.hasMatch ? 'text-secondary-foreground' : 'text-primary'}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Wink Details</h2>
                  {wink.hasMatch && (
                    <span className="text-sm text-secondary font-medium">✨ You matched!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 pb-6 space-y-4">
              {/* Location */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Location</span>
                </div>
                <p className="font-mono font-semibold text-cyan drop-shadow-[0_0_8px_hsl(var(--cyan)/0.6)]">
                  {formatCoords(wink.lat, wink.lng)}
                </p>
              </div>

              {/* Time & Radius row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Time</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{wink.timestamp}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Target className="w-3.5 h-3.5" />
                    <span>Radius</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{wink.radius}m</p>
                </div>
              </div>

              {/* Status message */}
              <div className="text-center py-2">
                {wink.hasMatch ? (
                  <p className="text-sm text-muted-foreground">
                    Someone noticed you too! Start a conversation.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Waiting to see if someone noticed you...
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {wink.hasMatch && (
                  <Button
                    onClick={onOpenChat}
                    className="w-full"
                    size="lg"
                    variant="glow"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Open Chat
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WinkDetail;
