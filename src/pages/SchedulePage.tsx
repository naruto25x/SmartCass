import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSchedules } from '@/hooks/use-schedules';
import { Calendar, Clock, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayMap: Record<string, string> = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };

const statusColors = {
  Scheduled: 'text-green-400 bg-green-400/10',
  Cancelled: 'text-red-400 bg-red-400/10',
  Rescheduled: 'text-blue-400 bg-blue-400/10',
};

export default function SchedulePage() {
  const [filterDay, setFilterDay] = useState('Mon');
  const navigate = useNavigate();
  const { id: classId } = useParams();
  const { schedules } = useSchedules(classId);
  const filtered = schedules.filter(s => s.day === dayMap[filterDay]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="mb-5">
        <h2 className="text-xl font-display font-bold text-foreground">Schedule</h2>
        <p className="text-sm text-muted-foreground mt-1">Weekly class timetable</p>
      </div>

      {/* Day Filter Pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setFilterDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              filterDay === day
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-muted-foreground border border-border/50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No classes on this day</p>
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
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColors[s.status]}`}>
                  {s.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{s.instructor}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.timeSlot}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.room}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{s.day.slice(0, 3)}</span>
              </div>
              {s.cancellationReason && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-400 bg-orange-400/10 rounded-lg px-3 py-1.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
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
