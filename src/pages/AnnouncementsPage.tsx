import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import type { Announcement } from '@/data/types';
import { Megaphone, AlertTriangle, AlertCircle, Info, ArrowLeft, Plus, X, Edit3, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { useAnnouncements } from '@/hooks/use-announcements';

const priorityConfig = {
  urgent: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  important: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  normal: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
};

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const canPost = user?.role === 'teacher' || user?.role === 'cr';
  const currentAuthorName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.username || '';
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements(classId);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [editingId, setEditingId] = useState<string | null>(null);

  const canManageAnnouncement = (ann: Announcement) => {
    if (!canPost || !user) return false;

    if (ann.createdBy) {
      return ann.createdBy === user.id;
    }

    // Backward compatibility for old announcements without createdBy.
    return ann.author === currentAuthorName && ann.authorRole === user.role;
  };

  const visibleAnnouncements = useMemo(() => {
    if (!user) return [];
    if (user.role === 'student') return announcements;
    if (user.role === 'cr') {
      return announcements.filter(ann => ann.authorRole === 'teacher' || canManageAnnouncement(ann));
    }
    return announcements.filter(canManageAnnouncement);
  }, [announcements, user]);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setPriority('normal');
    setEditingId(null);
    setShowForm(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (editingId) {
      const editing = visibleAnnouncements.find(item => item.id === editingId);
      if (!editing || !canManageAnnouncement(editing)) return;

      void updateAnnouncement(editingId, {
        title: title.trim(),
        message: message.trim(),
        priority,
      });
      resetForm();
      return;
    }

    const newAnn = {
      id: crypto.randomUUID(),
      title: title.trim(),
      message: message.trim(),
      author: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.username || 'Unknown',
      authorRole: user?.role || 'teacher' as const,
      createdBy: user?.id,
      date: new Date().toISOString(),
      priority,
    };
    void addAnnouncement(newAnn);
    resetForm();
  };

  const handleEdit = (ann: typeof announcements[0]) => {
    if (!canManageAnnouncement(ann)) return;
    setTitle(ann.title);
    setMessage(ann.message);
    setPriority(ann.priority);
    setEditingId(ann.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const target = visibleAnnouncements.find(item => item.id === id);
    if (!target || !canManageAnnouncement(target)) return;
    void deleteAnnouncement(id);
  };

  const getRelativeDateLabel = (isoDate: string) => {
    const date = parseISO(isoDate);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getDateOnlyLabel = (isoDate: string) => {
    return format(parseISO(isoDate), 'd MMM yyyy');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground mt-1">Latest updates and notices</p>
        </div>
        {canPost && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Post'}
          </motion.button>
        )}
      </div>

      {/* Add Announcement Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-5"
          >
            <form onSubmit={handlePost} className="bg-card rounded-2xl p-5 border border-border/50 space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Announcement title"
                  className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write your announcement..."
                  rows={3}
                  className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Priority</label>
                <div className="flex gap-2">
                  {(['normal', 'important', 'urgent'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 text-xs font-medium py-2.5 rounded-xl capitalize transition-colors ${
                        priority === p
                          ? p === 'urgent' ? 'bg-red-400/20 text-red-400' : p === 'important' ? 'bg-orange-400/20 text-orange-400' : 'bg-blue-400/20 text-blue-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm"
              >
                {editingId ? 'Save Changes' : 'Post Announcement'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {visibleAnnouncements.map((ann, i) => {
          const config = priorityConfig[ann.priority];
          return (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-2xl p-4 shadow-lg shadow-black/10 border ${config.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <config.icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color} ${config.bg} px-2 py-0.5 rounded-full`}>
                      {ann.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{ann.title}</h3>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {getRelativeDateLabel(ann.date)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ann.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{ann.author}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">{getDateOnlyLabel(ann.date)}</span>
                    </div>
                    {canManageAnnouncement(ann) && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(ann)}
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ann.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
