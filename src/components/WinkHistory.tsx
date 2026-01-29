import React from 'react';
import { MapPin, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Wink {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
  radius: number;
  hasMatch?: boolean;
}

interface WinkHistoryProps {
  winks: Wink[];
  onWinkClick?: (wink: Wink) => void;
  onWinkDelete?: (winkId: string) => void;
}

// Format coordinates to a readable string
const formatCoords = (lat: number, lng: number) => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
};

const WinkHistory: React.FC<WinkHistoryProps> = ({ winks, onWinkClick, onWinkDelete }) => {
  if (winks.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          No winks yet. Tap the button above when you notice someone special!
        </p>
      </div>
    );
  }

  // Convert timestamp to short format like "5m ago"
  const formatTimeAgo = (timestamp: string) => {
    if (timestamp === 'Just now') return 'now';
    if (timestamp.includes('Today')) {
      const time = timestamp.replace('Today at ', '');
      return time;
    }
    if (timestamp.includes('Yesterday')) return '1d ago';
    return timestamp;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Recent Winks
      </h3>
      <div className="space-y-3">
        {winks.map((wink, index) => (
          <button
            key={wink.id}
            onClick={() => onWinkClick?.(wink)}
            className={cn(
              "w-full p-5 rounded-2xl glass text-left transition-all duration-300",
              "hover:shadow-elevated hover:border-primary/40 hover:scale-[1.02]",
              "animate-fade-in-up",
              wink.hasMatch 
                ? "border-secondary/50 shadow-[0_0_20px_hsl(var(--secondary)/0.2)]" 
                : ""
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  wink.hasMatch 
                    ? "gradient-secondary shadow-[0_0_15px_hsl(var(--secondary)/0.4)]" 
                    : "bg-primary/20"
                )}>
                  <MapPin className={cn(
                    "w-5 h-5",
                    wink.hasMatch ? "text-secondary-foreground" : "text-primary"
                  )} />
                </div>
                
                {/* Content */}
                <div className="min-w-0">
                  {/* Coordinates - Roboto Mono, Neon Cyan */}
                  <p className="font-mono font-semibold text-base tracking-tight text-cyan drop-shadow-[0_0_8px_hsl(var(--cyan)/0.6)]">
                    {formatCoords(wink.lat, wink.lng)}
                  </p>
                  
                  {/* Radius info */}
                  <p className="text-xs text-muted-foreground mt-1">
                    {wink.radius}m radius
                  </p>
                </div>
              </div>
              
              {/* Right side - Time badge, Match badge, Delete button */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-end gap-2">
                  {/* Time ago badge with glow */}
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-medium",
                    "bg-[hsl(var(--cyan)/0.15)] text-[hsl(var(--cyan))]",
                    "border border-[hsl(var(--cyan)/0.3)]",
                    "shadow-[0_0_8px_hsl(var(--cyan)/0.3)]",
                    "animate-glow"
                  )}>
                    {formatTimeAgo(wink.timestamp)}
                  </span>
                  
                  {/* Match badge with gradient neon border */}
                  {wink.hasMatch && (
                    <span className="relative px-3 py-1 rounded-full text-xs font-bold text-white">
                      {/* Gradient border background */}
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 animate-pulse-glow" />
                      {/* Inner fill */}
                      <span className="absolute inset-[1px] rounded-full bg-background/90" />
                      {/* Text */}
                      <span className="relative bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-bold">
                        Match!
                      </span>
                    </span>
                  )}
                </div>
                
                {/* Delete button - only show if no match */}
                {!wink.hasMatch && onWinkDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onWinkDelete(wink.id);
                    }}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center",
                      "bg-destructive/10 text-destructive/70 hover:bg-destructive/20 hover:text-destructive",
                      "transition-all duration-200"
                    )}
                    title="Delete wink"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WinkHistory;
