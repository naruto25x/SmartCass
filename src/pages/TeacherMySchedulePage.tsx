import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTeacherSchedule } from '@/hooks/use-teacher-schedule';
import { TeacherScheduleEntry } from '@/data/types';
import { ArrowLeft, Plus, Pencil, Trash2, X, Calendar, Clock, MapPin } from 'lucide-react';

const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekdayByIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const getCurrentDay = () => weekdayByIndex[new Date().getDay()];

const emptyForm = {
  courseName: '',
  day: getCurrentDay(),
  timeSlot: '',
  room: '',
};

export default function TeacherMySchedulePage() {
  const navigate = useNavigate();
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useTeacherSchedule();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterDay, setFilterDay] = useState('Saturday');

  const filtered = schedules.filter(item => item.day === filterDay);

  const openAddForm = () => {
    setForm({ ...emptyForm, day: getCurrentDay() });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (entry: TeacherScheduleEntry) => {
    setForm({
      courseName: entry.courseName,
      day: entry.day,
      timeSlot: entry.timeSlot,
      room: entry.room,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateSchedule(editingId, { ...form, day: form.day || getCurrentDay() });
    } else {
      addSchedule({
        id: crypto.randomUUID(),
        ...form,
        day: form.day || getCurrentDay(),
      });
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">My Schedule</h2>
          <p className="text-sm text-muted-foreground mt-1">Your personal teaching calendar</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openAddForm}
          className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          Add
        </motion.button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
        {daysOfWeek.map(d => d.slice(0, 3)).map(day => (
          <button
            key={day}
            onClick={() => setFilterDay(daysOfWeek.find(d => d.startsWith(day)) || day)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              filterDay === daysOfWeek.find(d => d.startsWith(day))
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-muted-foreground border border-border/50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 shadow-lg shadow-black/20 border border-border/50 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-display font-bold text-foreground">
              {editingId ? 'Edit Schedule' : 'Add Schedule'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Course Name</label>
              <input
                type="text"
                value={form.courseName}
                onChange={e => setForm({ ...form, courseName: e.target.value })}
                className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. C Programming"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Time Slot</label>
                <input
                  type="text"
                  value={form.timeSlot}
                  onChange={e => setForm({ ...form, timeSlot: e.target.value })}
                  className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="09:00 - 10:30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Room Number</label>
                <input
                  type="text"
                  value={form.room}
                  onChange={e => setForm({ ...form, room: e.target.value })}
                  className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. LH-301"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-primary/25"
            >
              {editingId ? 'Update Schedule' : 'Add Schedule'}
            </motion.button>
          </form>
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No classes scheduled for {filterDay}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">{entry.courseName}</h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditForm(entry)}
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteSchedule(entry.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{entry.timeSlot}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.room}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{entry.day.slice(0, 3)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
