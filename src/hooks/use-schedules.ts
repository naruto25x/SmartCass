import { Schedule } from '@/data/types';
import { usePersistedState } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';

const STORAGE_KEY = 'unistu_schedules';

export function useSchedules(classId?: string) {
  const [allSchedules, setAllSchedules] = usePersistedState<Record<string, Schedule[]>>(STORAGE_KEY, {});
  const [remoteSchedules, setRemoteSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !classId) return;

    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('id, course_code, course_name, instructor, day, time_slot, room, status, cancellation_reason')
        .eq('classroom_id', classId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Failed to load schedules', error.message);
        return;
      }

      if (!mounted) return;
      setRemoteSchedules(
        (data || []).map(item => ({
          id: item.id,
          courseCode: item.course_code,
          courseName: item.course_name,
          instructor: item.instructor,
          day: item.day,
          timeSlot: item.time_slot,
          room: item.room,
          status: item.status,
          cancellationReason: item.cancellation_reason || undefined,
        }))
      );
    };

    void load();

    const channel = supabase
      .channel(`schedules-${classId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedules', filter: `classroom_id=eq.${classId}` },
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

  const schedules = useMemo(() => {
    if (isSupabaseEnabled && classId) {
      return remoteSchedules;
    }
    return classId ? allSchedules[classId] || [] : allSchedules.default || [];
  }, [allSchedules, classId, remoteSchedules]);

  const addSchedule = async (schedule: Schedule, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const { error } = await supabase.from('schedules').insert({
        id: schedule.id,
        classroom_id: key,
        course_code: schedule.courseCode,
        course_name: schedule.courseName,
        instructor: schedule.instructor,
        day: schedule.day,
        time_slot: schedule.timeSlot,
        room: schedule.room,
        status: schedule.status,
        cancellation_reason: schedule.cancellationReason || null,
      });

      if (error) {
        console.warn('Failed to add schedule', error.message);
      }
      return;
    }

    setAllSchedules(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), schedule],
    }));
  };

  const updateSchedule = async (scheduleId: string, updates: Partial<Schedule>, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const payload: Record<string, unknown> = {};
      if (updates.courseCode !== undefined) payload.course_code = updates.courseCode;
      if (updates.courseName !== undefined) payload.course_name = updates.courseName;
      if (updates.instructor !== undefined) payload.instructor = updates.instructor;
      if (updates.day !== undefined) payload.day = updates.day;
      if (updates.timeSlot !== undefined) payload.time_slot = updates.timeSlot;
      if (updates.room !== undefined) payload.room = updates.room;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.cancellationReason !== undefined) {
        payload.cancellation_reason = updates.cancellationReason || null;
      }

      const { error } = await supabase
        .from('schedules')
        .update(payload)
        .eq('id', scheduleId)
        .eq('classroom_id', key);

      if (error) {
        console.warn('Failed to update schedule', error.message);
      }
      return;
    }

    setAllSchedules(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(s => s.id === scheduleId ? { ...s, ...updates } : s),
    }));
  };

  const deleteSchedule = async (scheduleId: string, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId)
        .eq('classroom_id', key);

      if (error) {
        console.warn('Failed to delete schedule', error.message);
      }
      return;
    }

    setAllSchedules(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(s => s.id !== scheduleId),
    }));
  };

  return { schedules, addSchedule, updateSchedule, deleteSchedule };
}
