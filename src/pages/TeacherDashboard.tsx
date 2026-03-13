import { useAuth } from '@/contexts/AuthContext';
import { useClassRooms } from '@/hooks/use-classrooms';
import { useTeacherSchedule } from '@/hooks/use-teacher-schedule';
import { motion } from 'framer-motion';
import { Users, Plus, ArrowRight, CalendarDays, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user, joinedClassIds } = useAuth();
  const { classRooms } = useClassRooms();
  const { schedules } = useTeacherSchedule();
  const navigate = useNavigate();
  const p = user?.profile;
  const joinedClasses = classRooms.filter(c => joinedClassIds.includes(c.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/25 flex items-center justify-center text-primary text-xl font-display font-bold">
            {p ? `${p.firstName?.charAt(0)}${p.lastName?.charAt(0)}` : user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-display font-bold text-foreground truncate">
              {p ? `${p.firstName} ${p.lastName}` : user?.username}
            </h2>
            <p className="text-xs text-primary font-medium">Teacher</p>
            {p ? (
              <p className="text-xs text-muted-foreground mt-0.5">{p.department} • {p.university}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">Welcome back!</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/teacher-my-schedule')}
          className="w-full bg-card rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-black/10 border border-border/50"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-400/15 flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <span className="text-sm font-medium text-foreground">My Schedule</span>
            <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
              <Clock3 className="w-3 h-3" />
              {schedules.length} class{ schedules.length === 1 ? '' : 'es' } added
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/join-class')}
          className="w-full mt-3 bg-card rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-black/10 border border-border/50"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Join Class</span>
        </motion.button>
      </div>

      {/* Joined Classes */}
      <div>
        <h3 className="text-sm font-display font-semibold text-foreground mb-3">My Classes</h3>
        {joinedClasses.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center border border-dashed border-border">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No classes joined yet</p>
            <p className="text-xs text-muted-foreground mt-1">Join a class to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {joinedClasses.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/teacher-class/${cls.id}`)}
                className="bg-card rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{cls.semesterName}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{cls.department}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
