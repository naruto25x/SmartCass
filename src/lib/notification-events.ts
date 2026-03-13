import type { Notification } from '@/data/types';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';

const LOCAL_NOTIFICATIONS_BY_USER_KEY = 'unistu_notifications_by_user';
const LOCAL_CLASSES_BY_USER_KEY = 'unistu_classes_by_user';

type NotificationEventType = Notification['type'];

interface NotifyClassMembersInput {
  classId?: string;
  actorId?: string;
  type: NotificationEventType;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore local persistence failures so app flow is not blocked.
  }
}

function resolveLocalRecipientIds(classId: string, actorId?: string) {
  const classesByUser = loadJson<Record<string, string[]>>(LOCAL_CLASSES_BY_USER_KEY, {});
  const recipients = Object.entries(classesByUser)
    .filter(([, classIds]) => (classIds || []).includes(classId))
    .map(([userId]) => userId);

  if (actorId) recipients.push(actorId);

  return [...new Set(recipients.filter(Boolean))];
}

async function resolveRemoteRecipientIds(classId: string, actorId?: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('class_enrollments')
    .select('user_id')
    .eq('classroom_id', classId);

  if (error) {
    console.warn('Failed to resolve notification recipients', error.message);
    return actorId ? [actorId] : [];
  }

  const recipients = (data || []).map(item => item.user_id);
  if (actorId) recipients.push(actorId);
  return [...new Set(recipients.filter(Boolean))];
}

export async function notifyClassMembers({ classId, actorId, type, title, message, payload }: NotifyClassMembersInput) {
  if (!classId) return;

  const createdAt = new Date().toISOString();

  if (isSupabaseEnabled && supabase) {
    const recipients = await resolveRemoteRecipientIds(classId, actorId);
    if (recipients.length === 0) return;

    const rows = recipients.map(userId => ({
      user_id: userId,
      type,
      title,
      body: message,
      payload_json: payload || null,
    }));

    const { error } = await supabase.from('notifications').insert(rows);
    if (error) {
      console.warn('Failed to create notifications', error.message);
    }
    return;
  }

  const recipients = resolveLocalRecipientIds(classId, actorId);
  if (recipients.length === 0) return;

  const notificationsByUser = loadJson<Record<string, Notification[]>>(LOCAL_NOTIFICATIONS_BY_USER_KEY, {});

  for (const recipientId of recipients) {
    const nextNotification: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
      date: createdAt,
      read: false,
    };

    const current = notificationsByUser[recipientId] || [];
    notificationsByUser[recipientId] = [nextNotification, ...current];
  }

  saveJson(LOCAL_NOTIFICATIONS_BY_USER_KEY, notificationsByUser);
}
