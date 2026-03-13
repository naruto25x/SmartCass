import { Course } from '@/data/types';
import { usePersistedState } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';

const STORAGE_KEY = 'unistu_courses';

export function useCourses(classId?: string) {
  const [allCourses, setAllCourses] = usePersistedState<Record<string, Course[]>>(STORAGE_KEY, {});
  const [remoteCourses, setRemoteCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !classId) return;

    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, code, name')
        .eq('classroom_id', classId)
        .order('code', { ascending: true });

      if (error) {
        console.warn('Failed to load courses', error.message);
        return;
      }

      if (!mounted) return;
      setRemoteCourses((data || []).map(item => ({ id: item.id, code: item.code, name: item.name })));
    };

    void load();

    const channel = supabase
      .channel(`courses-${classId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses', filter: `classroom_id=eq.${classId}` },
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

  const courses = useMemo(() => {
    if (isSupabaseEnabled && classId) {
      return remoteCourses;
    }
    return classId ? allCourses[classId] || [] : allCourses.default || [];
  }, [allCourses, classId, remoteCourses]);

  const addCourse = async (course: Course, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const { error } = await supabase.from('courses').insert({
        id: course.id,
        classroom_id: key,
        code: course.code,
        name: course.name,
      });

      if (error) {
        console.warn('Failed to add course', error.message);
      }
      return;
    }

    setAllCourses(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), course],
    }));
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const payload: Record<string, unknown> = {};
      if (updates.code !== undefined) payload.code = updates.code;
      if (updates.name !== undefined) payload.name = updates.name;

      const { error } = await supabase
        .from('courses')
        .update(payload)
        .eq('id', courseId)
        .eq('classroom_id', key);

      if (error) {
        console.warn('Failed to update course', error.message);
      }
      return;
    }

    setAllCourses(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(course =>
        course.id === courseId ? { ...course, ...updates } : course
      ),
    }));
  };

  const deleteCourse = async (courseId: string, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
        .eq('classroom_id', key);

      if (error) {
        console.warn('Failed to delete course', error.message);
      }
      return;
    }

    setAllCourses(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(course => course.id !== courseId),
    }));
  };

  return { courses, addCourse, updateCourse, deleteCourse };
}
