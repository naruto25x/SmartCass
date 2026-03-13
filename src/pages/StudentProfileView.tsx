import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { mockStudents, mockAttendance } from '@/data/mockData';
import { ArrowLeft, Phone, Building2, GraduationCap, BarChart3 } from 'lucide-react';

export default function StudentProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = mockStudents.find(s => s.id === id);

  if (!student) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Student not found</p></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-display font-bold text-2xl mx-auto mb-4">
          {student.name.split(' ').map(n => n[0]).join('')}
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">{student.name}</h2>
        <p className="text-sm text-primary font-medium mt-1">{student.studentId}</p>
      </div>

      {/* Info Cards */}
      <div className="space-y-3">
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Academic Info</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Department</span>
              <span className="text-xs text-foreground">{student.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">University</span>
              <span className="text-xs text-foreground">{student.university}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Contact</span>
          </div>
          <p className="text-sm text-foreground">{student.phone}</p>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Attendance</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-display font-bold tabular-nums ${student.attendancePercentage < 75 ? 'text-destructive' : 'text-green-400'}`}>
              {student.attendancePercentage}%
            </span>
            <div className="flex-1">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${student.attendancePercentage}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${student.attendancePercentage < 75 ? 'bg-destructive' : 'bg-green-400'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Course-wise attendance */}
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <h3 className="text-xs font-medium text-muted-foreground mb-3">Course-wise Attendance</h3>
          <div className="space-y-3">
            {mockAttendance.map(a => (
              <div key={a.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">{a.courseCode} - {a.courseName}</span>
                  <span className={`text-xs font-medium tabular-nums ${a.percentage < 75 ? 'text-destructive' : 'text-green-400'}`}>
                    {a.percentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${a.percentage < 75 ? 'bg-destructive' : 'bg-green-400'}`}
                    style={{ width: `${a.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
