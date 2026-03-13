import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudents } from '@/hooks/use-students';
import { useClassRooms } from '@/hooks/use-classrooms';
import { useCourses } from '@/hooks/use-courses';
import { useAttendanceSheets } from '@/hooks/use-attendance-sheets';
import { computeStudentCoursePercentage } from '@/lib/attendance';
import { ArrowLeft, Search, Users, Phone } from 'lucide-react';

export default function ViewClassStudentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classRooms } = useClassRooms();
  const { students } = useStudents(id);
  const { courses } = useCourses(id);
  const { attendanceSheets } = useAttendanceSheets(id);
  const cls = classRooms.find(c => c.id === id);
  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  if (!cls) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Class not found</p></div>;
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCourse = courses.find(course => course.id === selectedCourseId) || courses[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="mb-5">
        <h2 className="text-xl font-display font-bold text-foreground">Students</h2>
        <p className="text-sm text-muted-foreground mt-1">{cls.semesterName} • {students.length} students</p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or ID"
          className="w-full bg-card rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border/50"
        />
      </div>

      {courses.length > 0 && (
        <div className="mb-5">
          <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Course Attendance View</label>
          <select
            value={selectedCourseId || selectedCourse?.id || ''}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="w-full bg-card rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border/50"
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {courses.length === 0 && (
        <div className="bg-card rounded-2xl p-4 mb-5 border border-border/50">
          <p className="text-sm text-muted-foreground">No courses added by CR yet, so course-wise attendance is unavailable.</p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No students added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((student, i) => {
            const courseStats = selectedCourse
              ? computeStudentCoursePercentage(attendanceSheets, student.studentId, selectedCourse.id)
              : { totalClasses: 0, attended: 0, percentage: 0 };

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-display font-bold text-sm shrink-0">
                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">{student.name}</h4>
                    <p className="text-xs text-muted-foreground">{student.studentId}</p>
                    {student.phone && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground">{student.phone}</p>
                      </div>
                    )}
                    {selectedCourse && (
                      <div className="mt-1.5">
                        <p className="text-[11px] text-muted-foreground">
                          {selectedCourse.code}: {courseStats.attended}/{courseStats.totalClasses} classes
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedCourse && (
                    <div className="text-right">
                      <p className={`text-sm font-bold tabular-nums ${courseStats.percentage < 75 ? 'text-destructive' : 'text-green-400'}`}>
                        {courseStats.percentage.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">{selectedCourse.code}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
