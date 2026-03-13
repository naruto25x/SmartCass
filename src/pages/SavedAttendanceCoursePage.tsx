import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useCourses } from '@/hooks/use-courses';
import { useAttendanceSheets } from '@/hooks/use-attendance-sheets';

export default function SavedAttendanceCoursePage() {
  const navigate = useNavigate();
  const { id: classId, courseId } = useParams();
  const { courses } = useCourses(classId);
  const { attendanceSheets } = useAttendanceSheets(classId);

  const course = courses.find(item => item.id === courseId);

  const courseSheets = attendanceSheets
    .filter(sheet => sheet.courseId === courseId)
    .sort((a, b) => {
      if (a.date === b.date) return b.updatedAt.localeCompare(a.updatedAt);
      return b.date.localeCompare(a.date);
    });

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button
        onClick={() => navigate(`/class/${classId}/attendance/saved`)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">{course.code} - {course.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">Date-wise attendance sheets</p>
      </div>

      {courseSheets.length === 0 ? (
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">No attendance sheets found for this course.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="divide-y divide-border">
            {courseSheets.map(sheet => {
              const presentCount = Object.values(sheet.recordsByStudentId).filter(Boolean).length;
              const totalStudents = Object.keys(sheet.recordsByStudentId).length;

              return (
                <div key={sheet.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-foreground font-medium inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                      {format(parseISO(sheet.date), 'EEE, MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Present: {presentCount}/{totalStudents} • Updated {format(parseISO(sheet.updatedAt), 'MMM d, h:mm a')}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/class/${classId}/attendance/sheet/${sheet.id}?from=saved`)}
                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors inline-flex items-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
