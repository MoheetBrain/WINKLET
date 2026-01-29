import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Bell, User, MessageCircle, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface HeaderProps {
  hasNotification?: boolean;
  onNotificationClick?: () => void;
}


const Header: React.FC<HeaderProps> = ({
  hasNotification,
  onNotificationClick,
}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleClearAllData = async () => {
    if (!user) return;
    
    setIsClearing(true);
    try {
      // First get all match IDs for this user
      const { data: userMatches } = await supabase
        .from('matches')
        .select('id')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
      
      const matchIds = (userMatches || []).map(m => m.id);
      
      // Delete all messages in user's matches
      if (matchIds.length > 0) {
        const { error: messagesError } = await supabase
          .from('messages')
          .delete()
          .in('match_id', matchIds);
        
        if (messagesError) console.error('Error deleting messages:', messagesError);
      }

      // Delete matches where user is involved
      const { error: matchesError } = await supabase
        .from('matches')
        .delete()
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
      
      if (matchesError) console.error('Error deleting matches:', matchesError);

      // Delete all winks (including ones with matches now that matches are deleted)
      const { error: winksError } = await supabase
        .from('winks')
        .delete()
        .eq('user_id', user.id);
      
      if (winksError) console.error('Error deleting winks:', winksError);

      toast({
        title: "Data cleared",
        description: "All your winks, matches, and messages have been deleted",
      });

      // Refresh the page to reset state
      window.location.reload();
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
      setShowClearConfirm(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-border/50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-button">
              <Eye className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">Winklet</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Chats button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/chats')}
              className="relative"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationClick}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {hasNotification && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
              )}
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass">
                {user ? (
                  <>
                    <DropdownMenuItem 
                      onClick={() => navigate(`/profile/${user.id}`)}
                      className="cursor-pointer"
                    >
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Debug</DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => setShowClearConfirm(true)}
                      className="text-destructive cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Winks & Chats
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/auth')}>
                    <User className="w-4 h-4 mr-2" />
                    Login / Sign up
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Confirmation Dialog */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your winks, matches, and chat messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAllData}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? 'Clearing...' : 'Clear All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Header;
