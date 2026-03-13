import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { useCourses } from '@/hooks/use-courses';
import { useAttendanceSheets } from '@/hooks/use-attendance-sheets';

export default function SavedAttendancePage() {
  const navigate = useNavigate();
  const { id: classId } = useParams();
  const { courses } = useCourses(classId);
  const { attendanceSheets } = useAttendanceSheets(classId);

  const handleBack = () => {
    if (classId) {
      navigate(`/teacher-class/${classId}`, { replace: true });
      return;
    }
    navigate(-1);
  };

  const sheetsByCourse = courses.map(course => ({
    course,
    sheets: attendanceSheets
      .filter(sheet => sheet.courseId === course.id)
      .sort((a, b) => {
        if (a.date === b.date) return b.updatedAt.localeCompare(a.updatedAt);
        return b.date.localeCompare(a.date);
      }),
  }));

  const totalSheets = attendanceSheets.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">Saved Attendance</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a course to view date-wise attendance sheets. Total sheets: {totalSheets}
        </p>
      </div>

      {courses.length === 0 && (
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">No courses found for this class.</p>
        </div>
      )}

      <div className="space-y-4">
        {sheetsByCourse.map(({ course, sheets }, index) => (
          <motion.button
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => navigate(`/class/${classId}/attendance/saved/course/${course.id}`)}
            className="w-full bg-card rounded-2xl border border-border/50 overflow-hidden text-left"
          >
            <div className="px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground font-medium inline-flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    {course.code} - {course.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{sheets.length} saved sheets</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
