import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useClassRooms } from '@/hooks/use-classrooms';
import { ArrowLeft, Users, ArrowRight, GraduationCap } from 'lucide-react';

export default function ClassListPage() {
  const { classRooms } = useClassRooms();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
      </button>
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">Classes</h2>
        <p className="text-sm text-muted-foreground mt-1">All available classes</p>
      </div>

      <div className="space-y-3">
        {classRooms.map((cls, i) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/class/${cls.id}`)}
            className="bg-card rounded-2xl p-5 shadow-lg shadow-black/10 border border-border/50 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">{cls.semesterName}</h3>
                <p className="text-xs text-muted-foreground mt-1">{cls.department}</p>
                <p className="text-xs text-muted-foreground">{cls.university}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {cls.studentCount} students
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {cls.teacherCount} teachers
              </span>
              <span className="text-xs text-primary font-display font-bold bg-primary/10 px-2.5 py-1 rounded-lg">
                {cls.classCode}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
