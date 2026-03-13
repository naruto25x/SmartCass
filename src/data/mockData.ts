import { Schedule, ClassTest, Attendance, Resource, Teacher, ClassRoom, Announcement, StudentInfo, Notification } from './types';

export const mockClassRooms: ClassRoom[] = [
  { id: '1', semesterName: '1st Year 1st Semester', department: 'Computer Science', university: 'Dhaka University', year: '2024', classCode: 'CS24A1', studentCount: 45, teacherCount: 5, createdBy: 'cr1' },
  { id: '2', semesterName: '2nd Year 2nd Semester', department: 'Computer Science', university: 'Dhaka University', year: '2023', classCode: 'CS23B2', studentCount: 38, teacherCount: 4, createdBy: 'cr1' },
  { id: '3', semesterName: '3rd Year 1st Semester', department: 'Computer Science', university: 'Dhaka University', year: '2022', classCode: 'CS22C1', studentCount: 42, teacherCount: 6, createdBy: 'cr1' },
];

export const mockAnnouncements: Announcement[] = [
  { id: '1', title: 'Mid-Semester Exam Schedule', message: 'Mid-semester exams will begin from March 20. Check the schedule page for details.', author: 'Dr. Ananya Sharma', authorRole: 'teacher', date: '2026-03-10T10:00:00Z', priority: 'important' },
  { id: '2', title: 'Lab Session Rescheduled', message: 'The Data Structures lab session on Wednesday is moved to Thursday 2:00 PM.', author: 'Prof. Rajesh Kumar', authorRole: 'teacher', date: '2026-03-09T14:30:00Z', priority: 'normal' },
  { id: '3', title: 'Assignment Submission Deadline', message: 'All pending assignments must be submitted by March 15. Late submissions will not be accepted.', author: 'Class Representative', authorRole: 'cr', date: '2026-03-08T09:00:00Z', priority: 'urgent' },
  { id: '4', title: 'Guest Lecture on AI', message: 'A guest lecture on Artificial Intelligence will be held on March 22 at LH-301.', author: 'Dr. Vikram Patel', authorRole: 'teacher', date: '2026-03-07T16:00:00Z', priority: 'normal' },
];

export const mockStudents: StudentInfo[] = [
  { id: '1', name: 'Raihan Ahmed', studentId: 'CSE-2024-001', department: 'Computer Science', university: 'Dhaka University', phone: '+880 1712 345678', attendancePercentage: 85.7 },
  { id: '2', name: 'Fatima Begum', studentId: 'CSE-2024-002', department: 'Computer Science', university: 'Dhaka University', phone: '+880 1812 345678', attendancePercentage: 92.3 },
  { id: '3', name: 'Karim Hassan', studentId: 'CSE-2024-003', department: 'Computer Science', university: 'Dhaka University', phone: '+880 1912 345678', attendancePercentage: 68.5 },
  { id: '4', name: 'Nusrat Jahan', studentId: 'CSE-2024-004', department: 'Computer Science', university: 'Dhaka University', phone: '+880 1612 345678', attendancePercentage: 95.0 },
  { id: '5', name: 'Arif Hossain', studentId: 'CSE-2024-005', department: 'Computer Science', university: 'Dhaka University', phone: '+880 1512 345678', attendancePercentage: 78.2 },
];

export const mockNotifications: Notification[] = [
  { id: '1', title: 'New Announcement', message: 'Mid-Semester Exam Schedule has been posted.', type: 'announcement', date: '2026-03-10T10:00:00Z', read: false },
  { id: '2', title: 'Test Reminder', message: 'CT-1: Data Structures is in 6 days.', type: 'test', date: '2026-03-12T08:00:00Z', read: false },
  { id: '3', title: 'Schedule Change', message: 'Operating Systems class cancelled today.', type: 'schedule', date: '2026-03-11T07:00:00Z', read: true },
  { id: '4', title: 'Attendance Alert', message: 'Your attendance in OS is below 75%.', type: 'attendance', date: '2026-03-10T18:00:00Z', read: true },
  { id: '5', title: 'Class Joined', message: 'You have joined 3rd Year 1st Semester.', type: 'class', date: '2026-03-05T12:00:00Z', read: true },
];

export const mockSchedules: Schedule[] = [
  { id: '1', courseCode: 'CS201', courseName: 'Data Structures', instructor: 'Dr. Ananya Sharma', day: 'Monday', timeSlot: '09:00 - 10:30', room: 'LH-301', status: 'Scheduled' },
  { id: '2', courseCode: 'CS301', courseName: 'Operating Systems', instructor: 'Prof. Rajesh Kumar', day: 'Monday', timeSlot: '11:00 - 12:30', room: 'LH-204', status: 'Cancelled', cancellationReason: 'Faculty on leave — conference at IIT Delhi' },
  { id: '3', courseCode: 'MA201', courseName: 'Probability & Statistics', instructor: 'Dr. Priya Nair', day: 'Tuesday', timeSlot: '09:00 - 10:30', room: 'LH-105', status: 'Scheduled' },
  { id: '4', courseCode: 'CS202', courseName: 'Database Systems', instructor: 'Dr. Vikram Patel', day: 'Tuesday', timeSlot: '14:00 - 15:30', room: 'LH-301', status: 'Rescheduled', cancellationReason: 'Moved to Thursday same time' },
  { id: '5', courseCode: 'EC201', courseName: 'Digital Electronics', instructor: 'Prof. Meera Iyer', day: 'Wednesday', timeSlot: '10:00 - 11:30', room: 'LH-102', status: 'Scheduled' },
  { id: '6', courseCode: 'CS201', courseName: 'Data Structures', instructor: 'Dr. Ananya Sharma', day: 'Wednesday', timeSlot: '14:00 - 15:30', room: 'Lab-3', status: 'Scheduled' },
  { id: '7', courseCode: 'CS301', courseName: 'Operating Systems', instructor: 'Prof. Rajesh Kumar', day: 'Thursday', timeSlot: '09:00 - 10:30', room: 'LH-204', status: 'Scheduled' },
  { id: '8', courseCode: 'MA201', courseName: 'Probability & Statistics', instructor: 'Dr. Priya Nair', day: 'Thursday', timeSlot: '11:00 - 12:30', room: 'LH-105', status: 'Scheduled' },
  { id: '9', courseCode: 'CS202', courseName: 'Database Systems', instructor: 'Dr. Vikram Patel', day: 'Friday', timeSlot: '09:00 - 10:30', room: 'LH-301', status: 'Scheduled' },
  { id: '10', courseCode: 'EC201', courseName: 'Digital Electronics', instructor: 'Prof. Meera Iyer', day: 'Friday', timeSlot: '14:00 - 15:30', room: 'Lab-1', status: 'Scheduled' },
];

export const mockClassTests: ClassTest[] = [
  { id: '1', ctNumber: 'CT-1', courseCode: 'CS201', courseName: 'Data Structures', date: '2026-03-18T00:00:00Z', time: '10:00 AM', duration: '1 hour', totalMarks: 30, syllabus: ['Arrays & Linked Lists', 'Stacks & Queues', 'Complexity Analysis'], venue: 'LH-301' },
  { id: '2', ctNumber: 'CT-1', courseCode: 'CS301', courseName: 'Operating Systems', date: '2026-03-20T00:00:00Z', time: '02:00 PM', duration: '1.5 hours', totalMarks: 40, syllabus: ['Process Management', 'CPU Scheduling', 'Deadlocks'], venue: 'LH-204' },
  { id: '3', ctNumber: 'CT-2', courseCode: 'MA201', courseName: 'Probability & Statistics', date: '2026-03-25T00:00:00Z', time: '09:00 AM', duration: '1 hour', totalMarks: 25, syllabus: ['Bayes Theorem', 'Random Variables', 'Probability Distributions'], venue: 'LH-105' },
  { id: '4', ctNumber: 'CT-1', courseCode: 'CS202', courseName: 'Database Systems', date: '2026-03-10T00:00:00Z', time: '11:00 AM', duration: '1 hour', totalMarks: 30, syllabus: ['ER Diagrams', 'Normalization', 'SQL Basics'], venue: 'LH-301' },
  { id: '5', ctNumber: 'CT-1', courseCode: 'EC201', courseName: 'Digital Electronics', date: '2026-03-08T00:00:00Z', time: '10:00 AM', duration: '45 mins', totalMarks: 20, syllabus: ['Boolean Algebra', 'Logic Gates', 'Karnaugh Maps'], venue: 'LH-102' },
];

export const mockAttendance: Attendance[] = [
  { id: '1', courseCode: 'CS201', courseName: 'Data Structures', totalClasses: 28, attended: 24, percentage: 85.7, lastUpdated: '2026-03-11T00:00:00Z' },
  { id: '2', courseCode: 'CS301', courseName: 'Operating Systems', totalClasses: 25, attended: 18, percentage: 72.0, lastUpdated: '2026-03-11T00:00:00Z' },
  { id: '3', courseCode: 'MA201', courseName: 'Probability & Statistics', totalClasses: 30, attended: 27, percentage: 90.0, lastUpdated: '2026-03-10T00:00:00Z' },
  { id: '4', courseCode: 'CS202', courseName: 'Database Systems', totalClasses: 22, attended: 20, percentage: 90.9, lastUpdated: '2026-03-11T00:00:00Z' },
  { id: '5', courseCode: 'EC201', courseName: 'Digital Electronics', totalClasses: 26, attended: 19, percentage: 73.1, lastUpdated: '2026-03-09T00:00:00Z' },
];

export const mockResources: Resource[] = [
  { id: '1', title: 'Linked List Implementation Notes', courseCode: 'CS201', type: 'Notes', fileUrl: '#', uploadedBy: 'Dr. Ananya Sharma', uploadDate: '2026-03-05T00:00:00Z' },
  { id: '2', title: 'Process Scheduling Slides', courseCode: 'CS301', type: 'Slides', fileUrl: '#', uploadedBy: 'Prof. Rajesh Kumar', uploadDate: '2026-03-08T00:00:00Z' },
  { id: '3', title: 'Probability Assignment 3', courseCode: 'MA201', type: 'Assignment', fileUrl: '#', uploadedBy: 'Dr. Priya Nair', uploadDate: '2026-03-07T00:00:00Z' },
  { id: '4', title: 'SQL Practice Problems', courseCode: 'CS202', type: 'Past Paper', fileUrl: '#', uploadedBy: 'Dr. Vikram Patel', uploadDate: '2026-03-06T00:00:00Z' },
  { id: '5', title: 'Boolean Algebra Cheat Sheet', courseCode: 'EC201', type: 'Notes', fileUrl: '#', uploadedBy: 'Prof. Meera Iyer', uploadDate: '2026-03-04T00:00:00Z' },
  { id: '6', title: 'Tree Traversal Algorithms', courseCode: 'CS201', type: 'Slides', fileUrl: '#', uploadedBy: 'Dr. Ananya Sharma', uploadDate: '2026-03-09T00:00:00Z' },
  { id: '7', title: 'Deadlock Prevention Strategies', courseCode: 'CS301', type: 'Notes', fileUrl: '#', uploadedBy: 'Prof. Rajesh Kumar', uploadDate: '2026-03-10T00:00:00Z' },
  { id: '8', title: 'Mid-Sem Question Paper 2025', courseCode: 'MA201', type: 'Past Paper', fileUrl: '#', uploadedBy: 'Dr. Priya Nair', uploadDate: '2026-03-01T00:00:00Z' },
];

export const mockTeachers: Teacher[] = [
  { id: '1', name: 'Dr. Ananya Sharma', phone: '+91 98765 43210', courseCode: 'CS201', courseName: 'Data Structures' },
  { id: '2', name: 'Prof. Rajesh Kumar', phone: '+91 98765 43211', courseCode: 'CS301', courseName: 'Operating Systems' },
  { id: '3', name: 'Dr. Priya Nair', phone: '+91 98765 43212', courseCode: 'MA201', courseName: 'Linear Algebra' },
  { id: '4', name: 'Dr. Vikram Patel', phone: '+91 98765 43213', courseCode: 'CS202', courseName: 'Algorithms' },
  { id: '5', name: 'Prof. Meera Iyer', phone: '+91 98765 43214', courseCode: 'EC201', courseName: 'Digital Electronics' },
];
