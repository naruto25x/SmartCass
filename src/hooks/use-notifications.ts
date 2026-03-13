import { useEffect, useMemo, useState } from 'react';
import { Notification } from '@/data/types';
import { usePersistedState } from '@/lib/utils';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [localNotifications, setLocalNotifications] = usePersistedState<Notification[]>(
    'unistu_notifications',
    []
  );
  const [remoteNotifications, setRemoteNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !user?.id) return;

    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, title, body, payload_json, read_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to load notifications', error.message);
        return;
      }

      if (!mounted) return;
      setRemoteNotifications(
        (data || []).map(item => ({
          id: item.id,
          title: item.title,
          message: item.body,
          type: item.type,
          date: item.created_at,
          read: Boolean(item.read_at),
        }))
      );
    };

    void load();

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          void load();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const notifications = useMemo(() => {
    if (!isSupabaseEnabled || !user?.id) {
      return localNotifications;
    }
    return remoteNotifications;
  }, [localNotifications, remoteNotifications, user?.id]);

  const markAsRead = async (id: string) => {
    if (!isSupabaseEnabled || !supabase || !user?.id) {
      setLocalNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.warn('Failed to mark notification as read', error.message);
    }
  };

  const markAllRead = async () => {
    if (!isSupabaseEnabled || !supabase || !user?.id) {
      setLocalNotifications(prev => prev.map(item => ({ ...item, read: true })));
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

    if (error) {
      console.warn('Failed to mark all notifications as read', error.message);
    }
  };

  return { notifications, markAsRead, markAllRead };
}
