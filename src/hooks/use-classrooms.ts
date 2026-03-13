import { ClassRoom, Schedule, StudentInfo, Teacher } from '@/data/types';
import { usePersistedState } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';

const STORAGE_KEY = 'unistu_classrooms';
const STUDENTS_STORAGE_KEY = 'unistu_students';
const TEACHERS_STORAGE_KEY = 'unistu_teachers';
const SCHEDULES_STORAGE_KEY = 'unistu_schedules';
const CLASSES_BY_USER_STORAGE_KEY = 'unistu_classes_by_user';

export function useClassRooms() {
  const { user } = useAuth();
  const [classRooms, setClassRooms] = usePersistedState<ClassRoom[]>(STORAGE_KEY, []);
  const [allStudents, setAllStudents] = usePersistedState<Record<string, StudentInfo[]>>(STUDENTS_STORAGE_KEY, {});
  const [allTeachers, setAllTeachers] = usePersistedState<Record<string, Teacher[]>>(TEACHERS_STORAGE_KEY, {});
  const [, setAllSchedules] = usePersistedState<Record<string, Schedule[]>>(SCHEDULES_STORAGE_KEY, {});
  const [remoteClassRooms, setRemoteClassRooms] = useState<ClassRoom[]>([]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return;

    let mounted = true;
    const load = async () => {
      const [{ data: classes, error: classError }, { data: students }, { data: teachers }] = await Promise.all([
        supabase
          .from('classrooms')
          .select('id, semester_name, department, university, year, class_code, created_by')
          .order('created_at', { ascending: false }),
        supabase.from('students').select('id, classroom_id'),
        supabase.from('teachers').select('id, classroom_id'),
      ]);

      if (classError) {
        console.warn('Failed to load classrooms', classError.message);
        return;
      }

      if (!mounted) return;

      const studentCountByClass = (students || []).reduce<Record<string, number>>((acc, item) => {
        acc[item.classroom_id] = (acc[item.classroom_id] || 0) + 1;
        return acc;
      }, {});

      const teacherCountByClass = (teachers || []).reduce<Record<string, number>>((acc, item) => {
        acc[item.classroom_id] = (acc[item.classroom_id] || 0) + 1;
        return acc;
      }, {});

      setRemoteClassRooms(
        (classes || []).map(item => ({
          id: item.id,
          semesterName: item.semester_name,
          department: item.department,
          university: item.university,
          year: item.year,
          classCode: item.class_code,
          studentCount: studentCountByClass[item.id] || 0,
          teacherCount: teacherCountByClass[item.id] || 0,
          createdBy: item.created_by || '',
        }))
      );
    };

    void load();

    const classroomChannel = supabase
      .channel('classrooms-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classrooms' }, () => {
        void load();
      })
      .subscribe();

    const studentChannel = supabase
      .channel('classrooms-students-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        void load();
      })
      .subscribe();

    const teacherChannel = supabase
      .channel('classrooms-teachers-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => {
        void load();
      })
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(classroomChannel);
      void supabase.removeChannel(studentChannel);
      void supabase.removeChannel(teacherChannel);
    };
  }, []);

  const classRoomsWithLiveCounts = useMemo(() => {
    if (isSupabaseEnabled) {
      return remoteClassRooms;
    }

    return classRooms.map(cls => ({
      ...cls,
      studentCount: (allStudents[cls.id] || []).length,
      teacherCount: (allTeachers[cls.id] || []).length,
    }));
  }, [allStudents, allTeachers, classRooms, remoteClassRooms]);

  const addClass = async (cls: ClassRoom) => {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('classrooms').insert({
        id: cls.id,
        semester_name: cls.semesterName,
        department: cls.department,
        university: cls.university,
        year: cls.year,
        class_code: cls.classCode,
        created_by: user?.id || null,
      });

      if (error) {
        console.warn('Failed to add classroom', error.message);
      }
      return;
    }

    setClassRooms(prev => [...prev, cls]);
  };

  const updateClass = async (id: string, updates: Partial<ClassRoom>) => {
    if (isSupabaseEnabled && supabase) {
      const payload: Record<string, unknown> = {};
      if (updates.semesterName !== undefined) payload.semester_name = updates.semesterName;
      if (updates.department !== undefined) payload.department = updates.department;
      if (updates.university !== undefined) payload.university = updates.university;
      if (updates.year !== undefined) payload.year = updates.year;
      if (updates.classCode !== undefined) payload.class_code = updates.classCode;

      const { error } = await supabase.from('classrooms').update(payload).eq('id', id);
      if (error) {
        console.warn('Failed to update classroom', error.message);
      }
      return;
    }

    setClassRooms(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteClass = async (id: string) => {
    const cls = classRooms.find(item => item.id === id) || remoteClassRooms.find(item => item.id === id);
    if (!cls) return;

    if (user?.role !== 'cr' && user?.role !== 'admin') return;

    if (cls.createdBy && user?.id && cls.createdBy !== user.id && user.role !== 'admin') return;

    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('classrooms').delete().eq('id', id);
      if (error) {
        console.warn('Failed to delete classroom', error.message);
      }
      return;
    }

    setAllStudents(prev => {
      const { [id]: _deleted, ...rest } = prev;
      return rest;
    });

    setAllTeachers(prev => {
      const { [id]: _deleted, ...rest } = prev;
      return rest;
    });

    setAllSchedules(prev => {
      const { [id]: _deleted, ...rest } = prev;
      return rest;
    });

    localStorage.removeItem(`unistu_classtests_${id}`);
    localStorage.removeItem(`unistu_announcements_${id}`);
    localStorage.removeItem(`unistu_teacher_attendance_${id}`);
    localStorage.removeItem(`unistu_student_attendance_${id}`);

    try {
      const coursesRaw = localStorage.getItem('unistu_courses');
      const allCourses: Record<string, unknown> = coursesRaw ? JSON.parse(coursesRaw) : {};
      const { [id]: _removedCourseSet, ...coursesRest } = allCourses;
      localStorage.setItem('unistu_courses', JSON.stringify(coursesRest));
    } catch {
      // Ignore storage cleanup failures.
    }

    try {
      const sheetsRaw = localStorage.getItem('unistu_attendance_sheets');
      const allSheets: Record<string, unknown> = sheetsRaw ? JSON.parse(sheetsRaw) : {};
      const { [id]: _removedSheetSet, ...sheetsRest } = allSheets;
      localStorage.setItem('unistu_attendance_sheets', JSON.stringify(sheetsRest));
    } catch {
      // Ignore storage cleanup failures.
    }

    try {
      const raw = localStorage.getItem(CLASSES_BY_USER_STORAGE_KEY);
      const current: Record<string, string[]> = raw ? JSON.parse(raw) : {};
      const updated = Object.fromEntries(
        Object.entries(current).map(([userId, classIds]) => [userId, (classIds || []).filter(classId => classId !== id)])
      );
      localStorage.setItem(CLASSES_BY_USER_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Keep delete flow resilient even if joined class mapping is malformed.
    }

    setClassRooms(prev => prev.filter(item => item.id !== id));
  };

  return { classRooms: classRoomsWithLiveCounts, addClass, updateClass, deleteClass };
}
