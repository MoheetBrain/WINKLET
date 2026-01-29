import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileData {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

// Extended profile data with demo info
const demoExtras: Record<string, { age: number; bio: string; interests: string[]; distance: string }> = {
  'Sara': {
    age: 23,
    bio: "Love finding new coffee spots.",
    interests: ["Coffee ☕", "Tech 💻", "Music 🎵", "Hiking 🥾"],
    distance: "3m away",
  },
  'Ben': {
    age: 24,
    bio: "Here for the weekend.",
    interests: ["Photography 📷", "Travel ✈️", "Food 🍕", "Gaming 🎮"],
    distance: "5m away",
  },
};

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        setError('Could not load profile');
      } else if (!data) {
        setError('Profile not found');
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000' }}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#000' }}>
        <p className="text-muted-foreground mb-4">{error || 'Profile not found'}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const displayName = profile.display_name || 'User';
  const extras = demoExtras[displayName] || { age: 25, bio: 'No bio yet.', interests: [], distance: 'Nearby' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Photo section - top 60% */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        {/* Profile photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"}')`,
          }}
        />
        
        {/* Gradient fade overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to bottom,
              transparent 0%,
              transparent 40%,
              rgba(0, 0, 0, 0.4) 60%,
              rgba(0, 0, 0, 0.8) 80%,
              #000000 100%
            )`,
          }}
        />

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>

        {/* Name, Age, Location - positioned at bottom of photo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-6"
        >
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            {displayName}, {extras.age}
          </h1>
          
          {/* Live location badge */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              {/* Pulsing purple dot */}
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: "#D946EF" }}
              />
              <div
                className="absolute w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: "#D946EF", opacity: 0.5 }}
              />
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{extras.distance}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bio and Interests section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-1 px-6 py-4 overflow-y-auto"
        style={{ backgroundColor: "#000000" }}
      >
        {/* Glassmorphism bio card */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: "rgba(30, 30, 30, 0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            About
          </h2>
          <p className="text-white text-base leading-relaxed">
            {extras.bio}
          </p>
        </div>

        {/* Interests section */}
        {extras.interests.length > 0 && (
          <div className="mb-24">
            <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {extras.interests.map((interest, index) => (
                <motion.span
                  key={interest}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 rounded-full text-sm text-white cursor-pointer transition-all duration-300"
                  style={{
                    background: "rgba(40, 40, 40, 0.8)",
                    border: "1px solid rgba(217, 70, 239, 0.3)",
                    boxShadow: "0 0 0 rgba(217, 70, 239, 0)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(217, 70, 239, 0.6)";
                    e.currentTarget.style.boxShadow = "0 0 12px rgba(217, 70, 239, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(217, 70, 239, 0.3)";
                    e.currentTarget.style.boxShadow = "0 0 0 rgba(217, 70, 239, 0)";
                  }}
                >
                  {interest}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Sticky bottom action bar - only show if not viewing own profile */}
      {user?.id !== userId && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 p-4 pb-6"
          style={{
            background: "linear-gradient(to top, #000000 60%, transparent)",
          }}
        >
          <Button
            onClick={() => navigate('/chats')}
            className="w-full h-14 text-lg font-bold rounded-full flex items-center justify-center gap-2"
            variant="wink"
          >
            <MessageCircle className="w-5 h-5" />
            Send Message
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;
