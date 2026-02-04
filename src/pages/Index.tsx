import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Eye, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import WinkButton from '@/components/WinkButton';
import WinkModal from '@/components/WinkModal';
import SuccessOverlay from '@/components/SuccessOverlay';

import MutualMatch from '@/components/MutualMatch';
import UserProfile, { mockProfiles } from '@/components/UserProfile';
import WinkHistory from '@/components/WinkHistory';
import WinkDetail from '@/components/WinkDetail';
import ChatWindow from '@/components/ChatWindow';
import NotificationsList from '@/components/NotificationsList';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';

interface Wink {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
  radius: number;
  hasMatch?: boolean;
}

interface MatchData {
  id: string;
  lat: number;
  lng: number;
  timeAgo: string;
  otherUserId?: string;
  otherUserName?: string | null;
}

const Index: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showWinkModal, setShowWinkModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMutualMatch, setShowMutualMatch] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [currentProfileKey, setCurrentProfileKey] = useState<'sara' | 'ben'>('sara');
  const [showWinkDetail, setShowWinkDetail] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showNotificationsList, setShowNotificationsList] = useState(false);
  const [selectedWink, setSelectedWink] = useState<Wink | null>(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [hasNotification, setHasNotification] = useState(false);
  const [winks, setWinks] = useState<Wink[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMatch, setCurrentMatch] = useState<MatchData | null>(null);
  const [recentMatches, setRecentMatches] = useState<MatchData[]>([]);
  const [newMatchIds, setNewMatchIds] = useState<Set<string>>(new Set());

  // Load winks from database
  useEffect(() => {
    if (!user) return;

    const fetchWinksWithMatches = async () => {
      setLoading(true);
      
      // Fetch user's winks and all matches involving user in parallel
      const [winksResult, matchesResult] = await Promise.all([
        supabase
          .from('winks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('matches')
          .select('id, wink_id, user_a, user_b, created_at, wink:winks!inner(lat, lng, created_at)')
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      ]);

      if (winksResult.error) {
        console.error('Error fetching winks:', winksResult.error);
        toast({
          title: "Error loading winks",
          description: winksResult.error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      const winksData = winksResult.data || [];
      const matchesData = matchesResult.data || [];
      
      if (winksData.length === 0) {
        setWinks([]);
        setLoading(false);
        return;
      }

      // Create set of wink IDs directly referenced in matches
      const directMatchedWinkIds = new Set(matchesData.map(m => m.wink_id));
      
      // For each wink, check if it has a match
      // A wink "has a match" if:
      // 1. The wink_id is directly referenced in a match, OR
      // 2. There's a match involving this user where the wink was created
      //    within the matching time window (10 mins) of the match's wink
      const formattedWinks: Wink[] = winksData.map((wink) => {
        // Direct match check
        if (directMatchedWinkIds.has(wink.id)) {
          return {
            id: wink.id,
            lat: wink.lat,
            lng: wink.lng,
            timestamp: formatTimestamp(new Date(wink.created_at)),
            radius: wink.radius,
            hasMatch: true,
          };
        }
        
        // Indirect match check: is there a match where THIS wink was the user's matching wink?
        const winkTime = new Date(wink.created_at).getTime();
        const hasIndirectMatch = matchesData.some(match => {
          const matchWink = match.wink as any;
          if (!matchWink?.created_at) return false;
          
          const matchWinkTime = new Date(matchWink.created_at).getTime();
          const timeDiff = Math.abs(winkTime - matchWinkTime);
          
          // Within 10 minutes (600000ms) = could be the matching wink
          return timeDiff <= 600000;
        });
        
        return {
          id: wink.id,
          lat: wink.lat,
          lng: wink.lng,
          timestamp: formatTimestamp(new Date(wink.created_at)),
          radius: wink.radius,
          hasMatch: hasIndirectMatch,
        };
      });
      
      setWinks(formattedWinks);
      setLoading(false);
    };

    fetchWinksWithMatches();

    // Check for matches and load recent matches
    const checkMatches = async () => {
      const { data: matches } = await supabase
        .from('matches')
        .select(`
          id,
          created_at,
          user_a,
          user_b,
          wink:winks(lat, lng)
        `)
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (matches && matches.length > 0) {
        setHasNotification(true);
        
        // Get other user IDs
        const otherUserIds = matches.map((m: any) => 
          m.user_a === user.id ? m.user_b : m.user_a
        );

        // Fetch profiles for matched users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', otherUserIds);

        const profileMap = new Map(
          (profiles || []).map(p => [p.user_id, p.display_name])
        );
        
        // Set all matches
        const formattedMatches: MatchData[] = matches.map((m: any) => {
          const otherUserId = m.user_a === user.id ? m.user_b : m.user_a;
          return {
            id: m.id,
            lat: m.wink?.lat || 0,
            lng: m.wink?.lng || 0,
            timeAgo: formatTimestamp(new Date(m.created_at)),
            otherUserId,
            otherUserName: profileMap.get(otherUserId) || null,
          };
        });
        setRecentMatches(formattedMatches);
        
        // Set the most recent match data
        const latestMatch = matches[0] as any;
        const latestOtherUserId = latestMatch.user_a === user.id ? latestMatch.user_b : latestMatch.user_a;
        setCurrentMatch({
          id: latestMatch.id,
          lat: latestMatch.wink?.lat || 0,
          lng: latestMatch.wink?.lng || 0,
          timeAgo: formatTimestamp(new Date(latestMatch.created_at)),
          otherUserId: latestOtherUserId,
          otherUserName: profileMap.get(latestOtherUserId) || null,
        });
      }
    };
    checkMatches();

    // Subscribe to real-time match notifications
    const matchChannel = supabase
      .channel('match-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
        },
        async (payload) => {
          const newMatch = payload.new as any;
          // Check if this match involves the current user
          if (newMatch.user_a === user.id || newMatch.user_b === user.id) {
            // Fetch the wink location for this match
            const { data: wink } = await supabase
              .from('winks')
              .select('lat, lng')
              .eq('id', newMatch.wink_id)
              .maybeSingle();

            const matchData: MatchData = {
              id: newMatch.id,
              lat: wink?.lat || 0,
              lng: wink?.lng || 0,
              timeAgo: 'Just now',
            };

            // Add to recent matches
            setRecentMatches(prev => [matchData, ...prev]);
            setCurrentMatch(matchData);
            setHasNotification(true);
            
            // Mark as new
            setNewMatchIds(prev => new Set([...prev, newMatch.id]));
            
            // Auto-show the mutual match popup!
            setShowMutualMatch(true);

            toast({
              title: "It's a match! 💜",
              description: "Someone noticed you too!",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, [user, toast]);

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `Today at ${format(date, 'h:mm a')}`;
    if (diffDays === 1) return `Yesterday at ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d') + ' at ' + format(date, 'h:mm a');
  };

  const handleWinkSubmit = async (data: { timeOffset: number; radius: number; lat: number; lng: number }) => {
    // 1. SECURITY CHECK: Ensure user exists
    if (!user) {
      toast({
        title: "❌ Error",
        description: "You must be logged in to wink!",
        variant: "destructive",
      });
      return;
    }

    console.log("🟣 Attempting to drop wink for User ID:", user.id);

    setCurrentLocation({ lat: data.lat, lng: data.lng });
    
    // 2. DATABASE INSERT (With explicit Error Logging)
    const { data: newWinkData, error } = await supabase
      .from('winks')
      .insert({
        user_id: user.id, 
        lat: data.lat,
        lng: data.lng,
        radius: data.radius,
        time_offset: data.timeOffset,
      })
      .select()
      .single();

    // 3. ERROR TRAP
    if (error) {
      console.error('🔥 SUPABASE ERROR:', error);
      toast({
        title: "Database Error",
        description: error.message || "Could not save wink",
        variant: "destructive",
      });
      return;
    }

    // 4. SUCCESS STATE
    const newWink: Wink = {
      id: newWinkData.id,
      lat: data.lat,
      lng: data.lng,
      timestamp: 'Just now',
      radius: data.radius,
      hasMatch: false,
    };
    setWinks([newWink, ...winks]);
    
    setShowWinkModal(false);
    setShowSuccess(true);

    // 5. MATCH CHECKING (Keep existing logic)
    try {
      const { data: matchResult, error: matchError } = await supabase.functions.invoke('check-wink-matches', {
        body: { winkId: newWinkData.id, userId: user.id }
      });

      if (matchError) {
        console.error('Match check error:', matchError);
      } else if (matchResult?.matches?.length > 0) {
          toast({
            title: "🎉 Match Found!",
            description: `You matched with someone!`,
          });
          setWinks(prev => prev.map(w => w.id === newWinkData.id ? { ...w, hasMatch: true } : w));
          setShowSuccess(false);
          setShowMutualMatch(true);
      }
    } catch (err) {
      console.error('Error checking matches:', err);
    }

    toast({
      title: "Wink dropped! 💜",
      description: "We'll notify you if there's a match",
    });
  };
    // Add to local state
    
  const handleWinkClick = (wink: Wink) => {
    setSelectedWink(wink);
    setShowWinkDetail(true);
  };

  const handleWinkDelete = async (winkId: string) => {
    const { error } = await supabase
      .from('winks')
      .delete()
      .eq('id', winkId);

    if (error) {
      toast({
        title: "Cannot delete wink",
        description: error.message.includes('policy') 
          ? "This wink has a match and cannot be deleted" 
          : error.message,
        variant: "destructive",
      });
      return;
    }

    setWinks(prev => prev.filter(w => w.id !== winkId));
    toast({
      title: "Wink deleted",
      description: "The wink has been removed",
    });
  };

  const handleOpenChatFromDetail = () => {
    setShowWinkDetail(false);
    setShowChat(true);
  };

  return (
    <>
      <Helmet>
        <title>Winklet - Never Miss a Connection</title>
        <meta name="description" content="Winklet helps you reconnect with people you noticed but never met. Drop a wink when you see someone special, and if they noticed you too, you'll match." />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#050505' }}>
        {/* Street-Level Dark Mode Map - "Midnight Blueprint" Treatment */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1555662092-3363be252a92?q=80&w=2600&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%) invert(85%) contrast(120%) brightness(60%)',
          }}
        />
        {/* CSS Grid Fallback (shows if image fails) */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundColor: '#0a0a0a',
            backgroundImage: `
              linear-gradient(rgba(40, 40, 40, 0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(40, 40, 40, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Cinematic Radial Gradient Overlay - Spotlight Center */}
        <div 
          className="fixed inset-0 z-[1]"
          style={{
            background: `
              radial-gradient(
                ellipse 60% 55% at 50% 50%,
                transparent 0%,
                rgba(5, 5, 5, 0.4) 35%,
                rgba(5, 5, 5, 0.7) 55%,
                rgba(5, 5, 5, 0.9) 75%,
                #050505 100%
              )
            `,
          }}
        />
        

        {/* Subtle ambient glow behind the button */}
        <div className="ambient-glow" />
        <Header
          hasNotification={hasNotification}
          onNotificationClick={() => {
            setShowNotificationsList(true);
            setHasNotification(false);
          }}
        />

        {/* Main content */}
        <main className="pt-20 pb-8 px-4 max-w-md mx-auto relative z-10">
          {/* Hero section */}
          <div className="text-center py-12">
            <h1 className="font-display text-3xl font-bold mb-3" style={{ letterSpacing: '-0.02em' }}>
              <span className="text-gradient">Never Miss</span>
              <br />
              <span className="text-white">a Connection</span>
            </h1>
            <p className="font-sans text-lg text-silver max-w-[300px] mx-auto leading-relaxed">
              Noticed someone? Drop a wink. If they noticed you too, you'll match.
            </p>
          </div>

          {/* Wink button */}
          <div className="flex justify-center py-8">
            <WinkButton onClick={() => setShowWinkModal(true)} />
          </div>

          {/* Demo buttons */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentProfileKey('sara');
                setShowUserProfile(true);
              }}
              className="text-xs opacity-60 hover:opacity-100"
            >
              Demo: Sara's Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentProfileKey('ben');
                setShowUserProfile(true);
              }}
              className="text-xs opacity-60 hover:opacity-100"
            >
              Demo: Ben's Profile
            </Button>
          </div>

          {/* Recent Winks / Matches Section */}
          {recentMatches.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold text-white mb-4">Your Matches</h2>
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => {
                      setCurrentMatch(match);
                      setShowChat(true);
                    }}
                    className="w-full bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-4 text-left hover:bg-card/70 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Eye className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-sans text-sm font-medium text-white">
                            {match.otherUserName || 'Your Match'}
                          </p>
                          <p className="font-sans text-xs text-muted-foreground">
                            Matched {match.timeAgo.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wink history */}
          <div className="mt-12">
            {loading ? (
              <div className="text-center text-muted-foreground">Loading your winks...</div>
            ) : (
              <WinkHistory 
                winks={winks} 
                onWinkClick={handleWinkClick}
                onWinkDelete={handleWinkDelete}
              />
            )}
          </div>
        </main>

        {/* Modals */}
        <WinkModal
          open={showWinkModal}
          onOpenChange={setShowWinkModal}
          onSubmit={handleWinkSubmit}
        />

        <SuccessOverlay
          open={showSuccess}
          onClose={() => setShowSuccess(false)}
          location={currentLocation}
        />


        <WinkDetail
          open={showWinkDetail}
          onClose={() => setShowWinkDetail(false)}
          onOpenChat={handleOpenChatFromDetail}
          wink={selectedWink}
        />

        <ChatWindow
          open={showChat}
          onClose={() => setShowChat(false)}
          matchId={currentMatch?.id || null}
          matchLocation={currentMatch ? { lat: currentMatch.lat, lng: currentMatch.lng } : { lat: 51.5074, lng: -0.1278 }}
          matchName={currentMatch?.otherUserName}
        />

        <MutualMatch
          open={showMutualMatch}
          onStartChat={() => {
            setShowMutualMatch(false);
            setShowChat(true);
            toast({
              title: "Chat unlocked! 💬",
              description: "You can now message your match",
            });
          }}
          onKeepWinking={() => setShowMutualMatch(false)}
        />

        <UserProfile
          open={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          onSendMessage={() => {
            setShowUserProfile(false);
            setShowChat(true);
          }}
          profile={mockProfiles[currentProfileKey]}
        />

        <NotificationsList
          open={showNotificationsList}
          onClose={() => setShowNotificationsList(false)}
          notifications={recentMatches.map(m => ({
            ...m,
            isNew: newMatchIds.has(m.id),
          }))}
          onNotificationClick={(notification) => {
            setShowNotificationsList(false);
            setCurrentMatch({
              id: notification.id,
              lat: notification.lat,
              lng: notification.lng,
              timeAgo: notification.timeAgo,
            });
            // Clear the "new" status
            setNewMatchIds(prev => {
              const next = new Set(prev);
              next.delete(notification.id);
              return next;
            });
            setShowChat(true);
          }}
        />
      </div>
    </>
  );
};

export default Index;
