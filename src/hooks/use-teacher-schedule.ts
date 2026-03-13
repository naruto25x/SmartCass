import { useAuth } from '@/contexts/AuthContext';
import { TeacherScheduleEntry } from '@/data/types';
import { usePersistedState } from '@/lib/utils';

const STORAGE_KEY = 'unistu_teacher_personal_schedule';

export function useTeacherSchedule() {
  const { user } = useAuth();
  const [allSchedules, setAllSchedules] = usePersistedState<Record<string, TeacherScheduleEntry[]>>(
    STORAGE_KEY,
    {}
  );

  const key = user?.id || 'anonymous';
  const schedules = allSchedules[key] || [];

  const addSchedule = (entry: TeacherScheduleEntry) => {
    setAllSchedules(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), entry],
    }));
  };

  const updateSchedule = (entryId: string, updates: Partial<TeacherScheduleEntry>) => {
    setAllSchedules(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(item =>
        item.id === entryId ? { ...item, ...updates } : item
      ),
    }));
  };

  const deleteSchedule = (entryId: string) => {
    setAllSchedules(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(item => item.id !== entryId),
    }));
  };

  return { schedules, addSchedule, updateSchedule, deleteSchedule };
}
