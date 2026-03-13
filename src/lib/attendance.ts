import { AttendanceSheet, Course } from '@/data/types';

export interface CourseAttendanceStat {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalClasses: number;
  attended: number;
  percentage: number;
  lastUpdated: string;
}

function normalizeStudentId(value: string) {
  return (value || '').trim().toLowerCase().replace(/[-\s]/g, '');
}

function isStudentPresentById(recordsByStudentId: Record<string, boolean>, studentId: string) {
  const normalizedTarget = normalizeStudentId(studentId);

  return Object.entries(recordsByStudentId).some(
    ([storedId, isPresent]) => isPresent && normalizeStudentId(storedId) === normalizedTarget
  );
}

export function computeCourseAttendanceForStudent(
  sheets: AttendanceSheet[],
  courses: Course[],
  studentId: string
): CourseAttendanceStat[] {
  return courses.map(course => {
    const courseSheets = sheets.filter(sheet => sheet.courseId === course.id);
    const totalClasses = courseSheets.length;
    const attended = courseSheets.reduce(
      (count, sheet) => count + (isStudentPresentById(sheet.recordsByStudentId, studentId) ? 1 : 0),
      0
    );

    const lastUpdated =
      courseSheets.length > 0
        ? courseSheets
            .map(sheet => sheet.updatedAt)
            .sort((a, b) => b.localeCompare(a))[0]
        : new Date().toISOString();

    return {
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      totalClasses,
      attended,
      percentage: totalClasses > 0 ? (attended / totalClasses) * 100 : 0,
      lastUpdated,
    };
  });
}

export function computeStudentCoursePercentage(
  sheets: AttendanceSheet[],
  studentId: string,
  courseId: string
) {
  const courseSheets = sheets.filter(sheet => sheet.courseId === courseId);
  const totalClasses = courseSheets.length;
  const attended = courseSheets.reduce(
    (count, sheet) => count + (isStudentPresentById(sheet.recordsByStudentId, studentId) ? 1 : 0),
    0
  );
  const percentage = totalClasses > 0 ? (attended / totalClasses) * 100 : 0;

  return { totalClasses, attended, percentage };
}
