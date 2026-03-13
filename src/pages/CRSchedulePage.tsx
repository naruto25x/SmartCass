import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useSchedules } from '@/hooks/use-schedules';
import { useClassRooms } from '@/hooks/use-classrooms';
import { useCourses } from '@/hooks/use-courses';
import { useTeachers } from '@/hooks/use-teachers';
import { Schedule } from '@/data/types';
import { ArrowLeft, Plus, Pencil, Trash2, X, Check, Calendar, Clock, MapPin } from 'lucide-react';

const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const statusOptions: Schedule['status'][] = ['Scheduled', 'Cancelled', 'Rescheduled'];

const weekdayByIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const getCurrentDay = () => weekdayByIndex[new Date().getDay()];

const statusColors: Record<string, string> = {
  Scheduled: 'text-green-400 bg-green-400/10',
  Cancelled: 'text-red-400 bg-red-400/10',
  Rescheduled: 'text-blue-400 bg-blue-400/10',
};

const emptyForm = {
  courseCode: '',
  courseName: '',
  instructor: '',
  day: getCurrentDay(),
  timeSlot: '',
  room: '',
  status: 'Scheduled' as Schedule['status'],
  cancellationReason: '',
};

export default function CRSchedulePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classRooms } = useClassRooms();
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useSchedules(id);
  const { courses } = useCourses(id);
  const { teachers } = useTeachers(id);
  const cls = classRooms.find(c => c.id === id);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterDay, setFilterDay] = useState('Saturday');

  if (!cls) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Class not found</p></div>;
  }

  const filtered = schedules.filter(s => s.day === filterDay);

  const openAddForm = () => {
    setForm({ ...emptyForm, day: getCurrentDay() });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (s: Schedule) => {
    setForm({
      courseCode: s.courseCode,
      courseName: s.courseName,
      instructor: s.instructor,
      day: s.day,
      timeSlot: s.timeSlot,
      room: s.room,
      status: s.status,
      cancellationReason: s.cancellationReason || '',
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSchedule(editingId, {
        ...form,
        day: form.day || getCurrentDay(),
        cancellationReason: form.cancellationReason || undefined,
      });
    } else {
      addSchedule({
        id: crypto.randomUUID(),
        ...form,
        day: form.day || getCurrentDay(),
        cancellationReason: form.cancellationReason || undefined,
      });
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = (scheduleId: string) => {
    deleteSchedule(scheduleId);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Schedule</h2>
          <p className="text-sm text-muted-foreground mt-1">{cls.semesterName}</p>
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

      {/* Day filter */}
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

      {/* Form Modal */}
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Course Code</label>
                {courses.length > 0 ? (
                  <select
                    value={form.courseCode}
                    onChange={e => {
                      const selectedCode = e.target.value;
                      const matched = courses.find(course => course.code === selectedCode);
                      setForm({
                        ...form,
                        courseCode: selectedCode,
                        courseName: matched?.name || form.courseName,
                      });
                    }}
                    className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="" disabled>Select course code</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.code}>{course.code}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.courseCode}
                    onChange={e => setForm({ ...form, courseCode: e.target.value })}
                    className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="CS201"
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Room</label>
                <input
                  type="text"
                  value={form.room}
                  onChange={e => setForm({ ...form, room: e.target.value })}
                  className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="LH-301"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Course Name</label>
              {courses.length > 0 ? (
                <select
                  value={form.courseName}
                  onChange={e => {
                    const selectedName = e.target.value;
                    const matched = courses.find(course => course.name === selectedName);
                    setForm({
                      ...form,
                      courseName: selectedName,
                      courseCode: matched?.code || form.courseCode,
                    });
                  }}
                  className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="" disabled>Select course name</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.name}>{course.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.courseName}
                  onChange={e => setForm({ ...form, courseName: e.target.value })}
                  className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Data Structures"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Instructor</label>
              {teachers.length > 0 ? (
                <select
                  value={form.instructor}
                  onChange={e => setForm({ ...form, instructor: e.target.value })}
                  className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="" disabled>Select teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.instructor}
                  onChange={e => setForm({ ...form, instructor: e.target.value })}
                  className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Dr. Ananya Sharma"
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Day</label>
                <select
                  value={form.day}
                  onChange={e => setForm({ ...form, day: e.target.value })}
                  className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as Schedule['status'] })}
                  className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {(form.status === 'Cancelled' || form.status === 'Rescheduled') && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Reason</label>
                  <input
                    type="text"
                    value={form.cancellationReason}
                    onChange={e => setForm({ ...form, cancellationReason: e.target.value })}
                    className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Reason..."
                  />
                </div>
              )}
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

      {/* Schedule List */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No schedules yet. Add one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-card rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50 ${
                s.status === 'Cancelled' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-primary">{s.courseCode}</span>
                  <h4 className="text-sm font-medium text-foreground mt-0.5">{s.courseName}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColors[s.status]}`}>
                    {s.status}
                  </span>
                  <button
                    onClick={() => openEditForm(s)}
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{s.instructor}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.timeSlot}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.room}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{s.day.slice(0, 3)}</span>
              </div>
              {s.cancellationReason && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-400 bg-orange-400/10 rounded-lg px-3 py-1.5">
                  <span>{s.cancellationReason}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
