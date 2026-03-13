import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/use-courses';
import { useAttendanceSheets } from '@/hooks/use-attendance-sheets';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, ArrowLeft, PlusCircle, CalendarDays, BookOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useClassRooms } from '@/hooks/use-classrooms';
import { computeCourseAttendanceForStudent } from '@/lib/attendance';

function TeacherAttendanceView() {
  const navigate = useNavigate();
  const { id: classId } = useParams();
  const { courses } = useCourses(classId);
  const { attendanceSheets, addAttendanceSheet } = useAttendanceSheets(classId);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusText, setStatusText] = useState('');

  const defaultCourseId = selectedCourseId || courses[0]?.id || '';

  const startAttendanceSheet = () => {
    if (!defaultCourseId || !selectedDate) return;

    const selectedCourse = courses.find(course => course.id === defaultCourseId);
    if (!selectedCourse) return;

    const exists = attendanceSheets.some(
      sheet => sheet.courseId === defaultCourseId && sheet.date === selectedDate
    );

    if (exists) {
      setStatusText('This course already has an attendance sheet for the selected date.');
      return;
    }

    const now = new Date().toISOString();
    const recordsByStudentId: Record<string, boolean> = {};

    const newSheet = {
      id: crypto.randomUUID(),
      courseId: selectedCourse.id,
      courseCode: selectedCourse.code,
      courseName: selectedCourse.name,
      date: selectedDate,
      recordsByStudentId,
      createdAt: now,
      updatedAt: now,
    };

    addAttendanceSheet(newSheet);
    setStatusText('');
    navigate(`/class/${classId}/attendance/sheet/${newSheet.id}?from=attendance`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">Take Attendance</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose course and date, then create a new attendance sheet.</p>
      </div>

      {courses.length === 0 && (
        <div className="bg-card rounded-2xl p-5 border border-border/50 mb-5">
          <p className="text-sm text-muted-foreground">
            No courses found for this class. Ask the CR to add semester courses first.
          </p>
        </div>
      )}

      {courses.length > 0 && (
        <div className="bg-card rounded-2xl p-4 border border-border/50 mb-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground font-medium">
              <span className="mb-1.5 inline-flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Course
              </span>
              <select
                value={defaultCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted-foreground font-medium">
              <span className="mb-1.5 inline-flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                Attendance Date
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </label>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={startAttendanceSheet}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            <PlusCircle className="w-4 h-4" />
            Add Attendance
          </motion.button>

          {statusText && <p className="text-xs text-destructive">{statusText}</p>}
        </div>
      )}
    </motion.div>
  );
}

function StudentAttendanceView() {
  const navigate = useNavigate();
  const { user, joinedClassIds } = useAuth();
  const { id: classId } = useParams();
  const { classRooms } = useClassRooms();
  const effectiveClassId = classId || joinedClassIds[0] || '';
  const { courses } = useCourses(effectiveClassId);
  const { attendanceSheets } = useAttendanceSheets(effectiveClassId);

  const studentId = user?.profile?.studentId || '';
  const selectedClass = classRooms.find(cls => cls.id === effectiveClassId);

  const attendanceRecords = useMemo(() => {
    if (!studentId) return [];
    return computeCourseAttendanceForStudent(attendanceSheets, courses, studentId);
  }, [attendanceSheets, courses, studentId]);

  const overallStats = attendanceRecords.reduce(
    (acc, item) => {
      acc.totalClasses += item.totalClasses;
      acc.attended += item.attended;
      return acc;
    },
    { totalClasses: 0, attended: 0 }
  );

  const overall =
    overallStats.totalClasses > 0
      ? (overallStats.attended / overallStats.totalClasses) * 100
      : 0;
  const lowCount = attendanceRecords.filter(
    item => item.totalClasses > 0 && item.percentage < 70
  ).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">Attendance</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedClass ? `${selectedClass.semesterName} course-wise attendance` : 'Your course-wise attendance'}
        </p>
      </div>

      {!effectiveClassId && (
        <div className="bg-card rounded-2xl p-5 border border-border/50 mb-6">
          <p className="text-sm text-muted-foreground">Join a class first to view attendance percentages.</p>
        </div>
      )}

      {effectiveClassId && !studentId && (
        <div className="bg-card rounded-2xl p-5 border border-border/50 mb-6">
          <p className="text-sm text-muted-foreground">Add your student ID in profile to track attendance by course.</p>
        </div>
      )}

      {/* Overall card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="surface-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Overall Attendance</p>
          <p className={`text-3xl font-display font-bold tabular-nums ${overall < 70 ? 'text-destructive' : 'text-status-scheduled'}`}>
            {overall.toFixed(1)}%
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Courses</p>
          <p className="text-3xl font-display font-bold text-foreground">{attendanceRecords.length}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Below Threshold</p>
          <p className={`text-3xl font-display font-bold tabular-nums ${lowCount > 0 ? 'text-destructive' : 'text-status-scheduled'}`}>
            {lowCount}
          </p>
          {lowCount > 0 && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" />
              Action required
            </p>
          )}
        </div>
      </div>

      {/* Per-course */}
      <div className="surface-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Course Breakdown</h3>
        </div>
        <div className="divide-y divide-border">
          {attendanceRecords.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No attendance records yet</p>
            </div>
          )}
          {attendanceRecords.map((a, i) => (
            <motion.div
              key={a.courseId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-primary w-16">{a.courseCode}</span>
                  <span className="text-sm text-foreground">{a.courseName}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground tabular-nums">{a.attended}/{a.totalClasses} classes</span>
                  <span className={`font-medium tabular-nums ${a.percentage < 70 ? 'text-destructive' : 'text-status-scheduled'}`}>
                    {a.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${a.percentage}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={`h-full rounded-full ${a.percentage < 70 ? 'bg-destructive' : 'bg-status-scheduled'}`}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {a.totalClasses > 0
                  ? `Last updated: ${format(parseISO(a.lastUpdated), 'MMM d, yyyy')}`
                  : 'No attendance sheet created yet for this course'}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function AttendancePage() {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <TeacherAttendanceView />;
  return <StudentAttendanceView />;
}
