import { useState } from 'react';
import { ClassTest } from '@/data/types';
import { useAuth } from '@/contexts/AuthContext';
import { usePersistedState } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, ChevronDown, Clock, MapPin, BookOpen, Trash2, Edit3, ArrowLeft, X } from 'lucide-react';
import { formatDistanceToNow, isPast, parseISO, format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';

export default function ClassTestsPage() {
  const { user } = useAuth();
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const canEdit = user?.role === 'teacher' || user?.role === 'cr';
  const [tests, setTests] = usePersistedState<ClassTest[]>(`unistu_classtests_${classId || 'global'}`, []);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add test form state
  const [ctNum, setCtNum] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [venue, setVenue] = useState('');
  const [syllabusText, setSyllabusText] = useState('');

  const upcoming = tests.filter(ct => !isPast(parseISO(ct.date)));
  const past = tests.filter(ct => isPast(parseISO(ct.date)));

  const resetForm = () => {
    setCtNum(''); setCourseCode(''); setCourseName(''); setDate(''); setTime('');
    setDuration(''); setTotalMarks(''); setVenue(''); setSyllabusText('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = (id: string) => setTests(prev => prev.filter(t => t.id !== id));

  const handleEdit = (ct: typeof tests[0]) => {
    setCtNum(ct.ctNumber);
    setCourseCode(ct.courseCode);
    setCourseName(ct.courseName);
    setDate(ct.date.split('T')[0]);
    setTime(ct.time);
    setDuration(ct.duration);
    setTotalMarks(String(ct.totalMarks));
    setVenue(ct.venue);
    setSyllabusText(ct.syllabus.join('\n'));
    setEditingId(ct.id);
    setShowForm(true);
  };

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setTests(prev => prev.map(t => t.id === editingId ? {
        ...t,
        ctNumber: ctNum.trim() || 'CT',
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        date: new Date(date).toISOString(),
        time: time.trim(),
        duration: duration.trim(),
        totalMarks: parseInt(totalMarks) || 0,
        syllabus: syllabusText.split('\n').map(s => s.trim()).filter(Boolean),
        venue: venue.trim(),
      } : t));
    } else {
      const newTest = {
        id: crypto.randomUUID(),
        ctNumber: ctNum.trim() || 'CT',
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        date: new Date(date).toISOString(),
        time: time.trim(),
        duration: duration.trim(),
        totalMarks: parseInt(totalMarks) || 0,
        syllabus: syllabusText.split('\n').map(s => s.trim()).filter(Boolean),
        venue: venue.trim(),
      };
      setTests(prev => [newTest, ...prev]);
    }
    resetForm();
  };

  const TestCard = ({ ct, index }: { ct: typeof tests[0]; index: number }) => {
    const isUpcoming = !isPast(parseISO(ct.date));
    const expanded = expandedId === ct.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="surface-card surface-card-hover overflow-hidden"
      >
        <div
          className="p-4 cursor-pointer"
          onClick={() => setExpandedId(expanded ? null : ct.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-primary">{ct.courseCode}</span>
              <span className={`status-pill ${isUpcoming ? 'status-rescheduled' : 'status-completed'}`}>
                {ct.ctNumber}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isUpcoming && (
                <span className="text-xs text-primary font-medium animate-pulse-glow flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(parseISO(ct.date))}
                </span>
              )}
              {!isUpcoming && <span className="text-xs text-muted-foreground">Completed</span>}
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>

          <p className="text-sm text-foreground mt-2">{ct.courseName}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{format(parseISO(ct.date), 'MMM d, yyyy')} · {ct.time}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ct.venue}</span>
            <span>{ct.totalMarks} marks · {ct.duration}</span>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-border pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Syllabus</span>
                </div>
                <ul className="space-y-1">
                  {ct.syllabus.map((topic, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
                {canEdit && (
                  <div className="flex justify-end gap-3 mt-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(ct); }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(ct.id); }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Class Tests</h2>
          <p className="text-sm text-muted-foreground mt-1">Track upcoming and past assessments.</p>
        </div>
        {canEdit && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Test'}
          </motion.button>
        )}
      </div>

      {/* Add Test Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-5"
          >
            <form onSubmit={handleAddTest} className="bg-card rounded-2xl p-5 border border-border/50 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">CT Number</label>
                  <input type="text" value={ctNum} onChange={e => setCtNum(e.target.value)} placeholder="CT-1" className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Course Code</label>
                  <input type="text" value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="CS201" className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">Course Name</label>
                <input type="text" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="Data Structures" className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Time</label>
                  <input type="text" value={time} onChange={e => setTime(e.target.value)} placeholder="10:00 AM" className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Duration</label>
                  <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="1 hour" className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Marks</label>
                  <input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} placeholder="30" className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Venue</label>
                  <input type="text" value={venue} onChange={e => setVenue(e.target.value)} placeholder="LH-301" className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">Syllabus (one topic per line)</label>
                <textarea value={syllabusText} onChange={e => setSyllabusText(e.target.value)} rows={3} placeholder="Topic 1&#10;Topic 2" className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
              <motion.button type="submit" whileTap={{ scale: 0.98 }} className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm">
                {editingId ? 'Save Changes' : 'Add Test'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {upcoming.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Upcoming</h3>
          <div className="grid grid-cols-1 gap-3">
            {upcoming.map((ct, i) => <TestCard key={ct.id} ct={ct} index={i} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Past</h3>
          <div className="grid grid-cols-1 gap-3">
            {past.map((ct, i) => <TestCard key={ct.id} ct={ct} index={i} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
}
