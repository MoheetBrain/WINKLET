import React from 'react';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface WinkButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const WinkButton: React.FC<WinkButtonProps> = ({ onClick, disabled }) => {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Neon Beacon Pin - floating above button */}
      <div className="relative mb-4">
        {/* Radar ping rings */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#D500F9]/50 animate-radar-ping"
          style={{ animationDelay: '0s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#D500F9]/50 animate-radar-ping"
          style={{ animationDelay: '0.7s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#D500F9]/50 animate-radar-ping"
          style={{ animationDelay: '1.4s' }}
        />
        
        {/* The pin itself */}
        <div 
          className="relative animate-float"
          style={{
            filter: 'drop-shadow(0px 0px 12px rgba(213, 0, 249, 0.6))',
          }}
        >
          <svg 
            width="36" 
            height="36" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="buttonNeonPinGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#D500F9" />
                <stop offset="100%" stopColor="#651FFF" />
              </linearGradient>
            </defs>
            {/* Pin body */}
            <path 
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
              fill="url(#buttonNeonPinGradient)"
            />
            {/* Inner white dot - the "eye" */}
            <circle 
              cx="12" 
              cy="9" 
              r="2.5" 
              fill="white" 
              fillOpacity="0.9"
            />
          </svg>
        </div>
      </div>

      {/* Button container with ripples */}
      <div className="relative flex items-center justify-center">
        {/* Neon purple ripple effects */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="absolute w-44 h-44 rounded-full animate-radar-ripple"
            style={{ 
              animationDelay: '0s',
              background: 'radial-gradient(circle, transparent 60%, hsl(280 70% 60% / 0.3) 70%, transparent 100%)',
              border: '2px solid hsl(280 70% 60% / 0.4)'
            }} 
          />
          <div 
            className="absolute w-44 h-44 rounded-full animate-radar-ripple"
            style={{ 
              animationDelay: '0.66s',
              background: 'radial-gradient(circle, transparent 60%, hsl(280 70% 60% / 0.2) 70%, transparent 100%)',
              border: '2px solid hsl(280 70% 60% / 0.3)'
            }} 
          />
          <div 
            className="absolute w-44 h-44 rounded-full animate-radar-ripple"
            style={{ 
              animationDelay: '1.33s',
              background: 'radial-gradient(circle, transparent 60%, hsl(280 70% 60% / 0.1) 70%, transparent 100%)',
              border: '2px solid hsl(280 70% 60% / 0.2)'
            }} 
          />
        </div>
        
        {/* Main button - Neon Purple glow */}
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "relative w-44 h-44 rounded-full gradient-primary text-primary-foreground",
            "font-bold text-lg shadow-button",
            "hover:shadow-glow hover:scale-105 active:scale-[0.97]",
            "transition-all duration-300 ease-out",
            "flex flex-col items-center justify-center gap-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "animate-breathe animate-pulse-glow"
          )}
        >
          <Eye className="w-10 h-10" strokeWidth={2.5} />
          <span className="font-display text-xl font-semibold uppercase tracking-wide">Drop Wink</span>
        </button>
      </div>
    </div>
  );
};

export default WinkButton;
