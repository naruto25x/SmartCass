import { StudentInfo } from '@/data/types';
import { usePersistedState } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { compareStudentByCustomId } from '@/lib/studentIdSort';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';

const STORAGE_KEY = 'unistu_students';

export function useStudents(classId?: string) {
  const [allStudents, setAllStudents] = usePersistedState<Record<string, StudentInfo[]>>(STORAGE_KEY, {});
  const [remoteStudents, setRemoteStudents] = useState<StudentInfo[]>([]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !classId) return;

    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, student_id, department, university, phone, attendance_percentage')
        .eq('classroom_id', classId)
        .order('student_id', { ascending: true });

      if (error) {
        console.warn('Failed to load students', error.message);
        return;
      }

      if (!mounted) return;
      setRemoteStudents(
        (data || []).map(item => ({
          id: item.id,
          name: item.name,
          studentId: item.student_id,
          department: item.department || '',
          university: item.university || '',
          phone: item.phone || '',
          attendancePercentage: Number(item.attendance_percentage || 0),
        }))
      );
    };

    void load();

    const channel = supabase
      .channel(`students-${classId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students', filter: `classroom_id=eq.${classId}` },
        () => {
          void load();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [classId]);

  const students = useMemo(() => {
    const base = isSupabaseEnabled && classId
      ? remoteStudents
      : (classId ? allStudents[classId] || [] : allStudents.default || []);
    return [...base].sort(compareStudentByCustomId);
  }, [allStudents, classId, remoteStudents]);

  const addStudent = async (student: StudentInfo, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const { error } = await supabase.from('students').insert({
        id: student.id,
        classroom_id: key,
        name: student.name,
        student_id: student.studentId,
        department: student.department,
        university: student.university,
        phone: student.phone,
        attendance_percentage: student.attendancePercentage,
      });

      if (error) {
        console.warn('Failed to add student', error.message);
      }
      return;
    }

    setAllStudents(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), student],
    }));
  };

  const updateStudent = async (studentId: string, updates: Partial<StudentInfo>, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.studentId !== undefined) payload.student_id = updates.studentId;
      if (updates.department !== undefined) payload.department = updates.department;
      if (updates.university !== undefined) payload.university = updates.university;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.attendancePercentage !== undefined) {
        payload.attendance_percentage = updates.attendancePercentage;
      }

      const { error } = await supabase
        .from('students')
        .update(payload)
        .eq('id', studentId)
        .eq('classroom_id', key);

      if (error) {
        console.warn('Failed to update student', error.message);
      }
      return;
    }

    setAllStudents(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(s => s.id === studentId ? { ...s, ...updates } : s),
    }));
  };

  const deleteStudent = async (studentId: string, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)
        .eq('classroom_id', key);

      if (error) {
        console.warn('Failed to delete student', error.message);
      }
      return;
    }

    setAllStudents(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(s => s.id !== studentId),
    }));
  };

  return { students, addStudent, updateStudent, deleteStudent };
}
