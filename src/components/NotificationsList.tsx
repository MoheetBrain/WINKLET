import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MatchNotification {
  id: string;
  lat: number;
  lng: number;
  timeAgo: string;
  isNew?: boolean;
}

interface NotificationsListProps {
  open: boolean;
  onClose: () => void;
  notifications: MatchNotification[];
  onNotificationClick: (notification: MatchNotification) => void;
}

const formatCoords = (lat: number, lng: number) => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
};

const NotificationsList: React.FC<NotificationsListProps> = ({
  open,
  onClose,
  notifications,
  onNotificationClick,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm glass border-l border-border/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <Heart className="w-4 h-4 text-primary-foreground" />
                </div>
                <h2 className="font-display font-semibold text-lg">Notifications</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-[calc(100%-65px)]">
              <div className="p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No notifications yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Drop a wink to get started!
                    </p>
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <motion.button
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onNotificationClick(notification)}
                      className="w-full text-left p-4 rounded-xl glass border border-border/30 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          notification.isNew 
                            ? 'gradient-primary animate-pulse' 
                            : 'bg-primary/20'
                        }`}>
                          <Heart className={`w-5 h-5 ${
                            notification.isNew ? 'text-primary-foreground' : 'text-primary'
                          }`} fill="currentColor" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {notification.isNew ? '✨ New Match!' : 'Match'}
                            </p>
                            {notification.isNew && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-secondary/20 text-secondary rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="font-mono text-cyan/80 truncate">
                              {formatCoords(notification.lat, notification.lng)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {notification.timeAgo}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsList;
