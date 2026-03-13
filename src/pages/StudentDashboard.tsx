import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClassRooms } from '@/hooks/use-classrooms';
import { motion } from 'framer-motion';
import { Plus, Users, BarChart3, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, joinedClassIds, leaveClass } = useAuth();
  const { classRooms } = useClassRooms();
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
            {p?.studentId && <p className="text-xs text-primary font-medium">{p.studentId}</p>}
            {p ? (
              <p className="text-xs text-muted-foreground mt-0.5">{p.department} • {p.university}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">Student</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/join-class')}
          className="w-full bg-card rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-black/10 border border-border/50"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Join Class</span>
        </motion.button>
      </div>

      {/* Joined Classes */}
      <div className="mb-6">
        <h3 className="text-sm font-display font-semibold text-foreground mb-3">My Classes</h3>
        {joinedClasses.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center border border-dashed border-border">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No classes joined yet</p>
            <p className="text-xs text-muted-foreground mt-1">Ask your CR for a class code</p>
          </div>
        ) : (
          <div className="space-y-3">
            {joinedClasses.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/class/${cls.id}`)}
                className="bg-card rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{cls.semesterName}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{cls.department} • {cls.university}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); leaveClass(cls.id); }}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0 -mr-1 -mt-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />{cls.studentCount} students
                  </span>
                  <span className="text-xs text-primary font-medium">{cls.classCode}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
