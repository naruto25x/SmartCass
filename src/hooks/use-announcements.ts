import { useEffect, useMemo, useState } from 'react';
import { usePersistedState } from '@/lib/utils';
import { Announcement } from '@/data/types';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import { notifyClassMembers } from '@/lib/notification-events';

export function useAnnouncements(classId?: string) {
  const storageKey = `unistu_announcements_${classId || 'global'}`;
  const [localAnnouncements, setLocalAnnouncements] = usePersistedState<Announcement[]>(storageKey, []);
  const [remoteAnnouncements, setRemoteAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !classId) return;

    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, body, author_name, author_role, created_by, created_at, priority')
        .eq('classroom_id', classId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to load announcements from Supabase', error.message);
        return;
      }

      if (!mounted) return;
      setRemoteAnnouncements(
        (data || []).map(item => ({
          id: item.id,
          title: item.title,
          message: item.body,
          author: item.author_name,
          authorRole: item.author_role,
          createdBy: item.created_by || undefined,
          date: item.created_at,
          priority: item.priority,
        }))
      );
    };

    void load();

    const channel = supabase
      .channel(`announcements-${classId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements', filter: `classroom_id=eq.${classId}` },
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

  const announcements = useMemo(() => {
    if (!isSupabaseEnabled || !classId) {
      return localAnnouncements;
    }
    return remoteAnnouncements;
  }, [classId, localAnnouncements, remoteAnnouncements]);

  const addAnnouncement = async (announcement: Announcement) => {
    if (!isSupabaseEnabled || !supabase || !classId) {
      setLocalAnnouncements(prev => [announcement, ...prev]);

      if (announcement.authorRole === 'teacher' || announcement.authorRole === 'cr') {
        await notifyClassMembers({
          classId,
          actorId: announcement.createdBy,
          type: 'announcement',
          title: 'New Announcement',
          message: `${announcement.author}: ${announcement.title}`,
          payload: { announcementId: announcement.id },
        });
      }
      return;
    }

    const { error } = await supabase.from('announcements').insert({
      id: announcement.id,
      classroom_id: classId,
      title: announcement.title,
      body: announcement.message,
      author_name: announcement.author,
      author_role: announcement.authorRole,
      created_by: announcement.createdBy || null,
      priority: announcement.priority,
      created_at: announcement.date,
    });

    if (error) {
      console.warn('Failed to create announcement', error.message);
      return;
    }

    if (announcement.authorRole === 'teacher' || announcement.authorRole === 'cr') {
      await notifyClassMembers({
        classId,
        actorId: announcement.createdBy,
        type: 'announcement',
        title: 'New Announcement',
        message: `${announcement.author}: ${announcement.title}`,
        payload: { announcementId: announcement.id },
      });
    }
  };

  const updateAnnouncement = async (announcementId: string, updates: Partial<Announcement>) => {
    if (!isSupabaseEnabled || !supabase || !classId) {
      setLocalAnnouncements(prev =>
        prev.map(item => (item.id === announcementId ? { ...item, ...updates } : item))
      );
      return;
    }

    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.message !== undefined) payload.body = updates.message;
    if (updates.priority !== undefined) payload.priority = updates.priority;

    const { error } = await supabase
      .from('announcements')
      .update(payload)
      .eq('id', announcementId)
      .eq('classroom_id', classId);

    if (error) {
      console.warn('Failed to update announcement', error.message);
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    if (!isSupabaseEnabled || !supabase || !classId) {
      setLocalAnnouncements(prev => prev.filter(item => item.id !== announcementId));
      return;
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId)
      .eq('classroom_id', classId);

    if (error) {
      console.warn('Failed to delete announcement', error.message);
    }
  };

  return { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement };
}
