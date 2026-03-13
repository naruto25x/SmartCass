import { Teacher } from '@/data/types';
import { usePersistedState } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';

const STORAGE_KEY = 'unistu_teachers';

export function useTeachers(classId?: string) {
  const [allTeachers, setAllTeachers] = usePersistedState<Record<string, Teacher[]>>(STORAGE_KEY, {});
  const [remoteTeachers, setRemoteTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !classId) return;

    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, name, phone, course_code, course_name')
        .eq('classroom_id', classId)
        .order('name', { ascending: true });

      if (error) {
        console.warn('Failed to load teachers', error.message);
        return;
      }

      if (!mounted) return;
      setRemoteTeachers(
        (data || []).map(item => ({
          id: item.id,
          name: item.name,
          phone: item.phone || '',
          courseCode: item.course_code || '',
          courseName: item.course_name || '',
        }))
      );
    };

    void load();

    const channel = supabase
      .channel(`teachers-${classId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teachers', filter: `classroom_id=eq.${classId}` },
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

  const teachers = useMemo(() => {
    if (isSupabaseEnabled && classId) {
      return remoteTeachers;
    }
    return classId ? allTeachers[classId] || [] : allTeachers.default || [];
  }, [allTeachers, classId, remoteTeachers]);

  const addTeacher = async (teacher: Teacher, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const { error } = await supabase.from('teachers').insert({
        id: teacher.id,
        classroom_id: key,
        name: teacher.name,
        phone: teacher.phone,
        course_code: teacher.courseCode,
        course_name: teacher.courseName,
      });

      if (error) {
        console.warn('Failed to add teacher', error.message);
      }
      return;
    }

    setAllTeachers(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), teacher],
    }));
  };

  const updateTeacher = async (teacherId: string, updates: Partial<Teacher>, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.courseCode !== undefined) payload.course_code = updates.courseCode;
      if (updates.courseName !== undefined) payload.course_name = updates.courseName;

      const { error } = await supabase
        .from('teachers')
        .update(payload)
        .eq('id', teacherId)
        .eq('classroom_id', key);

      if (error) {
        console.warn('Failed to update teacher', error.message);
      }
      return;
    }

    setAllTeachers(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(t => t.id === teacherId ? { ...t, ...updates } : t),
    }));
  };

  const deleteTeacher = async (teacherId: string, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId)
        .eq('classroom_id', key);

      if (error) {
        console.warn('Failed to delete teacher', error.message);
      }
      return;
    }

    setAllTeachers(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(t => t.id !== teacherId),
    }));
  };

  return { teachers, addTeacher, updateTeacher, deleteTeacher };
}
