import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapPreview from './MapPreview';
import { cn } from '@/lib/utils';

interface WinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { timeOffset: number; radius: number; lat: number; lng: number }) => void;
}

const RADIUS_OPTIONS = [20, 50, 100, 150, 300, 400];

// Time presets in minutes ago
const TIME_PRESETS = [
  { label: 'Just now', value: 0 },
  { label: '1 min ago', value: -1 },
  { label: '2 mins ago', value: -2 },
  { label: '5 mins ago', value: -5 },
  { label: '10 mins ago', value: -10 },
];

const WinkModal: React.FC<WinkModalProps> = ({ open, onOpenChange, onSubmit }) => {
  const [timeOffset, setTimeOffset] = useState(0); // Minutes from now (negative = past)
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [radius, setRadius] = useState(100);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  }, []);

  const handleSubmit = () => {
    if (coordinates) {
      onSubmit({ timeOffset, radius, lat: coordinates.lat, lng: coordinates.lng });
    }
  };

  // Format the display time
  const displayTime = useMemo(() => {
    if (timeOffset === 0) return 'Just now';
    const absOffset = Math.abs(timeOffset);
    return `${absOffset} min${absOffset > 1 ? 's' : ''} ago`;
  }, [timeOffset]);

  // Adjust custom time
  const adjustTime = (delta: number) => {
    const newOffset = Math.max(-10, Math.min(0, timeOffset + delta));
    setTimeOffset(newOffset);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md border-[#3F3F46] bg-[#18181B]"
        style={{
          boxShadow: '0px 10px 40px rgba(0,0,0,0.8)',
        }}
      >
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] rounded-lg"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-gradient">Drop a Wink</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 relative z-10">
          {/* Map Preview */}
          <MapPreview radius={radius} onLocationChange={handleLocationChange} />

          {/* Time Selector - Modern Chip Design */}
          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center gap-2 text-[#A0A0A0]">
              <Clock className="w-4 h-4 text-primary" />
              When did you see them?
            </label>
            
            {/* Time selector container */}
            <div 
              className="rounded-2xl p-4"
              style={{
                backgroundColor: '#111111',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              {/* Quick preset chips */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {TIME_PRESETS.map((preset) => (
                  <motion.button
                    key={preset.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setTimeOffset(preset.value);
                      setShowCustomTime(false);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      timeOffset === preset.value && !showCustomTime
                        ? "bg-primary text-white shadow-[0_0_15px_hsl(280_70%_60%/0.4)]"
                        : "bg-[#1a1a1a] border border-[#333] text-[#888] hover:border-primary/50 hover:text-white"
                    )}
                  >
                    {preset.label}
                  </motion.button>
                ))}
              </div>

              {/* Custom time toggle */}
              <button
                onClick={() => setShowCustomTime(!showCustomTime)}
                className="w-full flex items-center justify-center gap-2 text-xs text-[#666] hover:text-primary transition-colors py-2"
              >
                <span>Custom time</span>
                {showCustomTime ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Custom time adjuster */}
              <AnimatePresence>
                {showCustomTime && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#222] mt-2">
                      {/* Minus button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => adjustTime(-1)}
                        disabled={timeOffset <= -10}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all",
                          timeOffset <= -10
                            ? "bg-[#1a1a1a] text-[#444] cursor-not-allowed"
                            : "bg-[#1a1a1a] border border-[#333] text-white hover:border-primary hover:bg-primary/10"
                        )}
                      >
                        −
                      </motion.button>

                      {/* Time display */}
                      <div className="text-center min-w-[100px]">
                        <div 
                          className="text-3xl font-bold font-mono"
                          style={{
                            color: '#D500F9',
                            textShadow: '0px 0px 15px rgba(213, 0, 249, 0.5)',
                          }}
                        >
                          {Math.abs(timeOffset)}
                        </div>
                        <div className="text-xs text-[#666] mt-1">
                          {timeOffset === 0 ? 'right now' : 'mins ago'}
                        </div>
                      </div>

                      {/* Plus button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => adjustTime(1)}
                        disabled={timeOffset >= 0}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all",
                          timeOffset >= 0
                            ? "bg-[#1a1a1a] text-[#444] cursor-not-allowed"
                            : "bg-[#1a1a1a] border border-[#333] text-white hover:border-primary hover:bg-primary/10"
                        )}
                      >
                        +
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Current selection indicator */}
              <div className="text-center mt-3 pt-3 border-t border-[#222]">
                <span className="text-xs text-[#555]">Selected: </span>
                <span 
                  className="text-sm font-semibold"
                  style={{ color: '#D500F9' }}
                >
                  {displayTime}
                </span>
              </div>
            </div>
          </div>

          {/* Radius Selector - Inset Style */}
          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center gap-2 text-[#A0A0A0]">
              <MapPin className="w-4 h-4 text-primary" />
              Search radius
            </label>
            
            {/* Inset container - Deep Black */}
            <div 
              className="rounded-2xl p-4"
              style={{
                backgroundColor: '#09090B',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                {RADIUS_OPTIONS.map((option) => (
                  <motion.button
                    key={option}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRadius(option)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      radius === option
                        ? "bg-primary text-white shadow-[0_0_20px_hsl(280_70%_60%/0.5)]"
                        : "bg-transparent border border-[#52525B] text-[#A0A0A0] hover:border-[#71717A] hover:text-white"
                    )}
                    style={radius === option ? {
                      textShadow: '0 0 10px rgba(255,255,255,0.5)',
                    } : undefined}
                  >
                    {option}m
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            className="w-full h-14 text-lg" 
            size="lg"
            variant="glow"
            disabled={!coordinates}
          >
            <Sparkles className="w-5 h-5" />
            Drop Wink
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WinkModal;
