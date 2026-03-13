export type UserRole = 'student' | 'teacher' | 'cr' | 'admin';

export interface UserProfile {
  firstName: string;
  lastName: string;
  university: string;
  department: string;
  phone: string;
  studentId?: string;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  profile?: UserProfile;
}

export interface ClassRoom {
  id: string;
  semesterName: string;
  department: string;
  university: string;
  year: string;
  classCode: string;
  studentCount: number;
  teacherCount: number;
  createdBy: string;
}

export interface Schedule {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  date?: string;
  day: string;
  timeSlot: string;
  room: string;
  status: 'Scheduled' | 'Cancelled' | 'Rescheduled';
  cancellationReason?: string;
}

export interface TeacherScheduleEntry {
  id: string;
  courseName: string;
  date?: string;
  day: string;
  timeSlot: string;
  room: string;
}

export interface ClassTest {
  id: string;
  ctNumber: string;
  courseCode: string;
  courseName: string;
  date: string;
  time: string;
  duration: string;
  totalMarks: number;
  syllabus: string[];
  venue: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
}

export interface AttendanceSheet {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  date: string;
  recordsByStudentId: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  courseCode: string;
  courseName: string;
  totalClasses: number;
  attended: number;
  percentage: number;
  lastUpdated: string;
}

export interface Resource {
  id: string;
  title: string;
  courseCode: string;
  type: 'Notes' | 'Slides' | 'Assignment' | 'Past Paper';
  fileUrl: string;
  uploadedBy: string;
  uploadDate: string;
}

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  courseCode: string;
  courseName: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  author: string;
  authorRole: UserRole;
  createdBy?: string;
  date: string;
  priority: 'normal' | 'important' | 'urgent';
}

export interface StudentInfo {
  id: string;
  name: string;
  studentId: string;
  department: string;
  university: string;
  phone: string;
  attendancePercentage: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'test' | 'schedule' | 'attendance' | 'class';
  date: string;
  read: boolean;
}
