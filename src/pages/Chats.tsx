import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageCircle, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ChatWindow from '@/components/ChatWindow';
import { format, formatDistanceToNow } from 'date-fns';

interface Match {
  id: string;
  lat: number;
  lng: number;
  createdAt: string;
  otherUserId: string;
  otherUserName: string | null;
}

const Chats: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMatches = async () => {
      // Fetch matches
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          created_at,
          user_a,
          user_b,
          wink:winks!inner(lat, lng)
        `)
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching matches:', error);
        setLoading(false);
        return;
      }

      // Get other user IDs
      const otherUserIds = (data || []).map((match: any) => 
        match.user_a === user.id ? match.user_b : match.user_a
      );

      // Fetch profiles for matched users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', otherUserIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p.display_name])
      );

      const formattedMatches: Match[] = (data || []).map((match: any) => {
        const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;
        return {
          id: match.id,
          lat: match.wink?.lat || 0,
          lng: match.wink?.lng || 0,
          createdAt: match.created_at,
          otherUserId,
          otherUserName: profileMap.get(otherUserId) || null,
        };
      });

      setMatches(formattedMatches);
      setLoading(false);
    };

    fetchMatches();
  }, [user]);

  const formatMatchTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    
    if (diffDays === 0) {
      return `Matched today at ${format(date, 'h:mm a')}`;
    } else if (diffDays === 1) {
      return `Matched yesterday`;
    } else {
      return `Matched ${formatDistanceToNow(date, { addSuffix: true })}`;
    }
  };

  if (selectedMatch) {
    return (
      <ChatWindow
        open={true}
        onClose={() => setSelectedMatch(null)}
        matchId={selectedMatch.id}
        matchLocation={{ lat: selectedMatch.lat, lng: selectedMatch.lng }}
        matchName={selectedMatch.otherUserName}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555679427-1f6dfcce943b?q=80&w=2070&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,22,0.92) 0%, rgba(15,15,22,0.85) 40%, rgba(20,10,30,0.90) 100%)',
        }}
      />

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <header className="flex items-center gap-3 p-4 glass border-b border-border/50">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">Your Chats</h1>
            <p className="text-xs text-muted-foreground">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full gradient-primary animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading chats...</p>
            </div>
          ) : matches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold mb-2">No matches yet</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Drop a wink when you notice someone special. If they noticed you too, you'll match!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {matches.map((match, index) => (
                  <motion.button
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedMatch(match)}
                    className="w-full p-4 rounded-2xl glass text-left transition-all duration-300 hover:shadow-elevated hover:border-primary/40"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">
                          {match.otherUserName || 'Your Match'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatMatchTime(match.createdAt)}</span>
                        </div>
                      </div>
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;