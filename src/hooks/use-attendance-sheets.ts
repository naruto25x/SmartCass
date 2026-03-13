import { AttendanceSheet } from '@/data/types';
import { usePersistedState } from '@/lib/utils';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'unistu_attendance_sheets';

export function useAttendanceSheets(classId?: string) {
  const [allAttendanceSheets, setAllAttendanceSheets] = usePersistedState<
    Record<string, AttendanceSheet[]>
  >(STORAGE_KEY, {});
  const [remoteAttendanceSheets, setRemoteAttendanceSheets] = useState<AttendanceSheet[]>([]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !classId) return;

    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('attendance_sheets')
        .select('id, course_id, course_code, course_name, attendance_date, records_by_student_id, created_at, updated_at')
        .eq('classroom_id', classId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to load attendance sheets', error.message);
        return;
      }

      if (!mounted) return;

      setRemoteAttendanceSheets(
        (data || []).map(item => ({
          id: item.id,
          courseId: item.course_id,
          courseCode: item.course_code,
          courseName: item.course_name,
          date: item.attendance_date,
          recordsByStudentId: (item.records_by_student_id || {}) as Record<string, boolean>,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }))
      );
    };

    void load();

    const channel = supabase
      .channel(`attendance-sheets-${classId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_sheets', filter: `classroom_id=eq.${classId}` },
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

  const getLatestSheets = (): Record<string, AttendanceSheet[]> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return allAttendanceSheets;
    }
  };

  const attendanceSheets = useMemo(() => {
    if (isSupabaseEnabled && classId) {
      return remoteAttendanceSheets;
    }
    return classId ? allAttendanceSheets[classId] || [] : allAttendanceSheets.default || [];
  }, [allAttendanceSheets, classId, remoteAttendanceSheets]);

  const addAttendanceSheet = async (sheet: AttendanceSheet, cId?: string) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const { error } = await supabase.from('attendance_sheets').insert({
        id: sheet.id,
        classroom_id: key,
        course_id: sheet.courseId,
        course_code: sheet.courseCode,
        course_name: sheet.courseName,
        attendance_date: sheet.date,
        records_by_student_id: sheet.recordsByStudentId,
        created_at: sheet.createdAt,
        updated_at: sheet.updatedAt,
      });

      if (error) {
        console.warn('Failed to create attendance sheet', error.message);
      }
      return;
    }

    const latest = getLatestSheets();
    const next = {
      ...latest,
      [key]: [...(latest[key] || []), sheet],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAllAttendanceSheets(next);
  };

  const updateAttendanceSheet = async (
    sheetId: string,
    updates: Partial<AttendanceSheet>,
    cId?: string
  ) => {
    const key = cId || classId || 'default';

    if (isSupabaseEnabled && supabase && key !== 'default') {
      const payload: Record<string, unknown> = {};
      if (updates.courseId !== undefined) payload.course_id = updates.courseId;
      if (updates.courseCode !== undefined) payload.course_code = updates.courseCode;
      if (updates.courseName !== undefined) payload.course_name = updates.courseName;
      if (updates.date !== undefined) payload.attendance_date = updates.date;
      if (updates.recordsByStudentId !== undefined) {
        payload.records_by_student_id = updates.recordsByStudentId;
      }
      payload.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('attendance_sheets')
        .update(payload)
        .eq('id', sheetId)
        .eq('classroom_id', key);

      if (error) {
        console.warn('Failed to update attendance sheet', error.message);
      }
      return;
    }

    const latest = getLatestSheets();
    const next = {
      ...latest,
      [key]: (latest[key] || []).map(sheet =>
        sheet.id === sheetId ? { ...sheet, ...updates } : sheet
      ),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAllAttendanceSheets(next);
  };

  return { attendanceSheets, addAttendanceSheet, updateAttendanceSheet };
}
