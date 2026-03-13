import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Megaphone, ClipboardList, Calendar, BarChart3, Users, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNotifications } from '@/hooks/use-notifications';

const typeIcons: Record<string, React.ReactNode> = {
  announcement: <Megaphone className="w-4 h-4" />,
  test: <ClipboardList className="w-4 h-4" />,
  schedule: <Calendar className="w-4 h-4" />,
  attendance: <BarChart3 className="w-4 h-4" />,
  class: <Users className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  announcement: 'text-orange-400 bg-orange-400/10',
  test: 'text-purple-400 bg-purple-400/10',
  schedule: 'text-blue-400 bg-blue-400/10',
  attendance: 'text-green-400 bg-green-400/10',
  class: 'text-primary bg-primary/10',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllRead } = useNotifications();
  const unreadCount = notifications.filter(item => !item.read).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => void markAllRead()} className="text-xs text-primary font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notif, i) => {
          const colors = typeColors[notif.type] || 'text-muted-foreground bg-muted';
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => void markAsRead(notif.id)}
              className={`bg-card rounded-2xl p-4 border transition-all cursor-pointer ${
                notif.read ? 'border-border/50 opacity-60' : 'border-primary/20 shadow-lg shadow-black/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors}`}>
                  {typeIcons[notif.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground truncate">{notif.title}</h3>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{format(parseISO(notif.date), 'MMM d, h:mm a')}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
