import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MatchRevealProps {
  open: boolean;
  onClose: () => void;
  onStartChat?: () => void;
  myProfile?: {
    name: string;
    image?: string;
  };
  theirProfile?: {
    name: string;
    image?: string;
    interests: string[];
  };
  matchLocation?: string;
  matchTime?: string;
}

const MatchReveal: React.FC<MatchRevealProps> = ({
  open,
  onClose,
  onStartChat,
  myProfile = {
    name: 'You',
    image: undefined,
  },
  theirProfile = {
    name: 'Alex',
    image: undefined,
    interests: ['Boxing 🥊', 'Cycling 🚴', 'Philosophy 📚', 'Techno 🎵'],
  },
  matchLocation = '///coffee.morning.smile',
  matchTime = '7 mins ago',
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Dimmed map background - 30% opacity */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, hsl(0 0% 2% / 0.7) 0%, hsl(0 0% 2% / 0.85) 100%)',
            }}
          />
          
          {/* Ambient neon glow effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
              style={{ background: 'radial-gradient(circle, hsl(330 100% 50% / 0.15) 0%, transparent 60%)' }}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>

          {/* Titanium Profile Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md z-10 rounded-3xl p-6 overflow-hidden"
            style={{
              background: '#18181B',
              border: '1px solid #3F3F46',
            }}
          >
            {/* Glowing gradient title */}
            <motion.div 
              className="text-center mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h1
                className="text-2xl font-bold uppercase tracking-wider font-display"
                style={{
                  background: 'linear-gradient(135deg, #D946EF 0%, #A855F7 50%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                animate={{ 
                  textShadow: [
                    '0 0 20px hsl(330 100% 50% / 0.5)',
                    '0 0 40px hsl(330 100% 50% / 0.7)',
                    '0 0 20px hsl(330 100% 50% / 0.5)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="inline-block w-5 h-5 mr-2 text-pink-400" />
                Synergy Confirmed
                <Sparkles className="inline-block w-5 h-5 ml-2 text-pink-400" />
              </motion.h1>
            </motion.div>

            {/* Overlapping Profile Photos with Neon Pink Pulse */}
            <motion.div 
              className="flex items-center justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <div className="relative flex items-center justify-center">
                {/* My profile - Left */}
                <div className="relative z-10">
                  {/* Neon Pink Pulse Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'transparent',
                      border: '2px solid hsl(330 100% 60%)',
                      boxShadow: '0 0 20px hsl(330 100% 60% / 0.6), 0 0 40px hsl(330 100% 60% / 0.3)',
                    }}
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.8, 0.4, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div 
                    className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #D946EF 0%, #A855F7 100%)',
                      border: '3px solid #18181B',
                    }}
                  >
                    {myProfile.image ? (
                      <img src={myProfile.image} alt={myProfile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        {myProfile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Their profile - Right (overlapping) */}
                <div className="relative z-20 -ml-8">
                  {/* Neon Pink Pulse Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'transparent',
                      border: '2px solid hsl(330 100% 60%)',
                      boxShadow: '0 0 20px hsl(330 100% 60% / 0.6), 0 0 40px hsl(330 100% 60% / 0.3)',
                    }}
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.8, 0.4, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  <div 
                    className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #06B6D4 0%, #A855F7 100%)',
                      border: '3px solid #18181B',
                    }}
                  >
                    {theirProfile.image ? (
                      <img src={theirProfile.image} alt={theirProfile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        {theirProfile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Identity Chips / Neon Pills */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <div className="flex flex-wrap justify-center gap-2">
                {theirProfile.interests.map((interest, index) => (
                  <motion.span
                    key={interest}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white"
                    style={{
                      background: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid hsl(180 100% 50% / 0.6)',
                      boxShadow: '0 0 12px hsl(180 100% 50% / 0.3), inset 0 0 8px hsl(180 100% 50% / 0.1)',
                    }}
                  >
                    {interest}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Location Context */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mb-4"
            >
              <p 
                className="text-sm font-mono"
                style={{ color: '#A1A1AA' }}
              >
                Matched at <span className="text-cyan-400">{matchLocation}</span> • {matchTime}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="space-y-3"
            >
              <Button
                onClick={onStartChat}
                size="lg"
                className="w-full h-14 text-base font-bold uppercase tracking-wider text-white border-0"
                style={{
                  background: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
                  boxShadow: '0 0 30px hsl(180 100% 50% / 0.4), 0 4px 20px hsl(180 100% 40% / 0.3)',
                }}
              >
                <Lock className="w-5 h-5 mr-2" />
                Start Encrypted Chat
              </Button>
              
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-zinc-500 hover:text-zinc-300 hover:bg-transparent"
              >
                Maybe later
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchReveal;