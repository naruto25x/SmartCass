import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useClassRooms } from '@/hooks/use-classrooms';
import { ArrowLeft, Megaphone, ClipboardList, BarChart3, Users, GraduationCap, ListChecks } from 'lucide-react';

const tools = [
  { label: 'Add Announcement', icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-400/15', path: 'announcements' },
  { label: 'Add Test / CT', icon: ClipboardList, color: 'text-purple-400', bg: 'bg-purple-400/15', path: 'class-tests' },
  { label: 'Take Attendance', icon: BarChart3, color: 'text-green-400', bg: 'bg-green-400/15', path: 'attendance' },
  { label: 'Saved Attendance', icon: ListChecks, color: 'text-emerald-400', bg: 'bg-emerald-400/15', path: 'attendance/saved' },
  { label: 'View Teachers', icon: GraduationCap, color: 'text-yellow-400', bg: 'bg-yellow-400/15', path: 'teachers' },
  { label: 'View Students', icon: Users, color: 'text-primary', bg: 'bg-primary/15', path: 'students' },
];

export default function TeacherClassDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classRooms } = useClassRooms();
  const cls = classRooms.find(c => c.id === id);

  if (!cls) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Class not found</p></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-5 mb-6">
        <h2 className="text-lg font-display font-bold text-foreground">{cls.semesterName}</h2>
        <p className="text-sm text-muted-foreground mt-1">{cls.department}</p>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />{cls.studentCount} students
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />{cls.teacherCount} teachers
          </span>
        </div>
      </div>

      <h3 className="text-sm font-display font-semibold text-foreground mb-3">Teacher Tools</h3>
      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool, i) => (
          <motion.button
            key={tool.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(tool.path.startsWith('/') ? tool.path : `/class/${id}/${tool.path}`)}
            className="bg-card rounded-2xl p-5 flex flex-col items-center gap-3 shadow-lg shadow-black/10 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center`}>
              <tool.icon className={`w-6 h-6 ${tool.color}`} />
            </div>
            <span className="text-sm font-medium text-foreground text-center">{tool.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
