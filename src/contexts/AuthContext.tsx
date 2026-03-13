import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User, UserRole, UserProfile } from '@/data/types';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';

interface AuthActionResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  login: (username: string, password: string, role: UserRole) => Promise<AuthActionResult>;
  register: (username: string, password: string, role: UserRole) => Promise<AuthActionResult>;
  completeProfile: (profile: UserProfile) => Promise<void>;
  updateProfile: (profile: UserProfile, nextUsername?: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  joinedClassIds: string[];
  joinClass: (classId: string) => Promise<void>;
  leaveClass: (classId: string) => Promise<void>;
}

interface StoredAccount {
  id: string;
  username: string;
  usernameNormalized: string;
  role: UserRole;
  password: string;
  profile?: UserProfile;
}

const AUTH_STORAGE_KEY = 'unistu_active_user_id';
const ACCOUNTS_STORAGE_KEY = 'unistu_accounts';
const CLASSES_STORAGE_KEY = 'unistu_classes_by_user';
const LEGACY_AUTH_STORAGE_KEY = 'unistu_user';
const LEGACY_CLASSES_STORAGE_KEY = 'unistu_classes';

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function toDbRole(role: UserRole): string {
  return role === 'cr' ? 'class_rep' : role;
}

function fromDbRole(role: string): UserRole {
  if (role === 'class_rep') return 'cr';
  if (role === 'admin') return 'admin';
  if (role === 'teacher') return 'teacher';
  return 'student';
}

function usernameToEmail(username: string) {
  const clean = normalizeUsername(username);
  return clean.includes('@') ? clean : `${clean}@cybercohort.local`;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function getInitialAuthState() {
  const accounts = loadFromStorage<StoredAccount[]>(ACCOUNTS_STORAGE_KEY, []);
  const activeUserId = loadFromStorage<string | null>(AUTH_STORAGE_KEY, null);
  const joinedByUser = loadFromStorage<Record<string, string[]>>(CLASSES_STORAGE_KEY, {});

  if (accounts.length > 0) {
    return { accounts, activeUserId, joinedByUser };
  }

  const legacyUser = loadFromStorage<User | null>(LEGACY_AUTH_STORAGE_KEY, null);
  const legacyJoined = loadFromStorage<string[]>(LEGACY_CLASSES_STORAGE_KEY, []);

  if (!legacyUser?.username || !legacyUser?.role) {
    return { accounts, activeUserId, joinedByUser };
  }

  const migratedId = legacyUser.id || crypto.randomUUID();
  const migrated: StoredAccount = {
    id: migratedId,
    username: legacyUser.username,
    usernameNormalized: normalizeUsername(legacyUser.username),
    role: legacyUser.role,
    password: '',
    profile: legacyUser.profile,
  };

  const migratedJoinedByUser = {
    [migratedId]: Array.isArray(legacyJoined) ? legacyJoined : [],
  };

  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([migrated]));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(migratedId));
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(migratedJoinedByUser));
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_CLASSES_STORAGE_KEY);
  } catch {
    // Ignore migration write failure and continue with in-memory migrated state.
  }

  return {
    accounts: [migrated],
    activeUserId: migratedId,
    joinedByUser: migratedJoinedByUser,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState(() => getInitialAuthState());
  const [accounts, setAccounts] = useState<StoredAccount[]>(initial.accounts);
  const [activeUserId, setActiveUserId] = useState<string | null>(initial.activeUserId);
  const [joinedByUser, setJoinedByUser] = useState<Record<string, string[]>>(initial.joinedByUser);

  const [remoteUser, setRemoteUser] = useState<User | null>(null);
  const [remoteJoinedClassIds, setRemoteJoinedClassIds] = useState<string[]>([]);

  const localUser = activeUserId
    ? (() => {
        const found = accounts.find(item => item.id === activeUserId);
        return found
          ? { id: found.id, username: found.username, role: found.role, profile: found.profile }
          : null;
      })()
    : null;

  const user = useMemo(() => {
    if (isSupabaseEnabled && supabase) {
      return remoteUser;
    }
    return localUser;
  }, [localUser, remoteUser]);

  const joinedClassIds = useMemo(() => {
    if (isSupabaseEnabled && supabase) {
      return remoteJoinedClassIds;
    }
    return user ? joinedByUser[user.id] || [] : [];
  }, [joinedByUser, remoteJoinedClassIds, user]);

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (activeUserId) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(activeUserId));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(joinedByUser));
  }, [joinedByUser]);

  const loadRemoteSession = useCallback(async (authUserId: string, fallbackUsername?: string) => {
    if (!supabase) return;

    const [{ data: profileData, error: profileError }, { data: enrollmentData, error: enrollmentError }] = await Promise.all([
      supabase
        .from('profiles')
        .select('username, role, first_name, last_name, university, department, phone, student_id')
        .eq('id', authUserId)
        .maybeSingle(),
      supabase.from('class_enrollments').select('classroom_id').eq('user_id', authUserId),
    ]);

    if (profileError) {
      console.warn('Could not load profile from Supabase', profileError.message);
    }
    if (enrollmentError) {
      console.warn('Could not load class enrollments from Supabase', enrollmentError.message);
    }

    const profile = profileData
      ? {
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          university: profileData.university || '',
          department: profileData.department || '',
          phone: profileData.phone || '',
          studentId: profileData.student_id || '',
        }
      : undefined;

    setRemoteUser({
      id: authUserId,
      username: profileData?.username || fallbackUsername || 'user',
      role: fromDbRole(profileData?.role || 'student'),
      profile,
    });

    setRemoteJoinedClassIds((enrollmentData || []).map(item => item.classroom_id));
  }, []);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return;

    let mounted = true;

    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (mounted && sessionUser) {
        await loadRemoteSession(sessionUser.id, sessionUser.email?.split('@')[0]);
      }
      if (mounted && !sessionUser) {
        setRemoteUser(null);
        setRemoteJoinedClassIds([]);
      }
    };

    void initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user;
      if (!authUser) {
        setRemoteUser(null);
        setRemoteJoinedClassIds([]);
        return;
      }
      void loadRemoteSession(authUser.id, authUser.email?.split('@')[0]);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadRemoteSession]);

  const login = useCallback(async (username: string, password: string, role: UserRole): Promise<AuthActionResult> => {
    if (isSupabaseEnabled && supabase) {
      const email = usernameToEmail(username);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed' };
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      if (profileData?.role && fromDbRole(profileData.role) !== role) {
        await supabase.auth.signOut();
        return { success: false, error: 'Role does not match this username' };
      }

      await loadRemoteSession(data.user.id, username);
      return { success: true };
    }

    const usernameNormalized = normalizeUsername(username);
    const existing = accounts.find(item => item.usernameNormalized === usernameNormalized);
    if (!existing) {
      return { success: false, error: 'Username not found' };
    }
    if (existing.role !== role) {
      return { success: false, error: 'Role does not match this username' };
    }
    if (!existing.password) {
      setAccounts(prev => prev.map(item => (item.id === existing.id ? { ...item, password } : item)));
      setActiveUserId(existing.id);
      return { success: true };
    }
    if (existing.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    setActiveUserId(existing.id);
    return { success: true };
  }, [accounts, loadRemoteSession]);

  const register = useCallback(async (username: string, password: string, role: UserRole): Promise<AuthActionResult> => {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      return { success: false, error: 'Username is required' };
    }

    if (isSupabaseEnabled && supabase) {
      const email = usernameToEmail(cleanUsername);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const authUserId = data.user?.id;
      if (!authUserId) {
        return { success: false, error: 'Registration failed. Please try again.' };
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authUserId,
        username: cleanUsername,
        role: toDbRole(role),
      });

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      await loadRemoteSession(authUserId, cleanUsername);
      return { success: true };
    }

    const usernameNormalized = normalizeUsername(cleanUsername);
    const existing = accounts.find(item => item.usernameNormalized === usernameNormalized);
    if (existing) {
      return { success: false, error: 'Username already exists. Please choose another one.' };
    }

    const created: StoredAccount = {
      id: crypto.randomUUID(),
      username: cleanUsername,
      usernameNormalized,
      role,
      password,
    };

    setAccounts(prev => [...prev, created]);
    setActiveUserId(created.id);
    return { success: true };
  }, [accounts, loadRemoteSession]);

  const completeProfile = useCallback(async (profile: UserProfile) => {
    if (isSupabaseEnabled && supabase && remoteUser?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          university: profile.university,
          department: profile.department,
          phone: profile.phone,
          student_id: profile.studentId || null,
        })
        .eq('id', remoteUser.id);

      if (error) {
        console.warn('Failed to complete profile', error.message);
        return;
      }

      setRemoteUser(prev => (prev ? { ...prev, profile } : prev));
      return;
    }

    setAccounts(prev => prev.map(item => (item.id === activeUserId ? { ...item, profile } : item)));
  }, [activeUserId, remoteUser?.id]);

  const updateProfile = useCallback(async (profile: UserProfile, nextUsername?: string): Promise<AuthActionResult> => {
    const cleanUsername = (nextUsername ?? user?.username ?? '').trim();
    if (!cleanUsername) {
      return { success: false, error: 'Username cannot be empty' };
    }

    if (isSupabaseEnabled && supabase && remoteUser?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: cleanUsername,
          first_name: profile.firstName,
          last_name: profile.lastName,
          university: profile.university,
          department: profile.department,
          phone: profile.phone,
          student_id: profile.studentId || null,
        })
        .eq('id', remoteUser.id);

      if (error) {
        return { success: false, error: error.message };
      }

      setRemoteUser(prev => (prev ? { ...prev, username: cleanUsername, profile } : prev));
      return { success: true };
    }

    if (!activeUserId) {
      return { success: false, error: 'No active user found' };
    }

    const current = accounts.find(item => item.id === activeUserId);
    if (!current) {
      return { success: false, error: 'No active user found' };
    }

    const usernameNormalized = normalizeUsername(cleanUsername);
    const duplicate = accounts.find(
      item => item.usernameNormalized === usernameNormalized && item.id !== activeUserId
    );
    if (duplicate) {
      return { success: false, error: 'This username is already taken' };
    }

    setAccounts(prev =>
      prev.map(item =>
        item.id === activeUserId
          ? {
              ...item,
              username: cleanUsername,
              usernameNormalized,
              profile,
            }
          : item
      )
    );

    return { success: true };
  }, [accounts, activeUserId, remoteUser?.id, user?.username]);

  const logout = useCallback(async () => {
    if (isSupabaseEnabled && supabase) {
      await supabase.auth.signOut();
      setRemoteUser(null);
      setRemoteJoinedClassIds([]);
      return;
    }

    setActiveUserId(null);
  }, []);

  const joinClass = useCallback(async (classId: string) => {
    if (isSupabaseEnabled && supabase && remoteUser?.id) {
      const { error } = await supabase.from('class_enrollments').upsert({
        classroom_id: classId,
        user_id: remoteUser.id,
      });

      if (error) {
        console.warn('Failed to join class', error.message);
        return;
      }

      setRemoteJoinedClassIds(prev => (prev.includes(classId) ? prev : [...prev, classId]));
      return;
    }

    if (!activeUserId) return;
    setJoinedByUser(prev => {
      const existing = prev[activeUserId] || [];
      if (existing.includes(classId)) return prev;
      return {
        ...prev,
        [activeUserId]: [...existing, classId],
      };
    });
  }, [activeUserId, remoteUser?.id]);

  const leaveClass = useCallback(async (classId: string) => {
    if (isSupabaseEnabled && supabase && remoteUser?.id) {
      const { error } = await supabase
        .from('class_enrollments')
        .delete()
        .eq('classroom_id', classId)
        .eq('user_id', remoteUser.id);

      if (error) {
        console.warn('Failed to leave class', error.message);
        return;
      }

      setRemoteJoinedClassIds(prev => prev.filter(id => id !== classId));
      return;
    }

    if (!activeUserId) return;
    setJoinedByUser(prev => ({
      ...prev,
      [activeUserId]: (prev[activeUserId] || []).filter(id => id !== classId),
    }));
  }, [activeUserId, remoteUser?.id]);

  const isProfileComplete = Boolean(
    user?.profile?.firstName &&
      user?.profile?.lastName &&
      user?.profile?.university &&
      user?.profile?.department &&
      user?.profile?.phone &&
      (user.role !== 'student' || user.profile?.studentId)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isProfileComplete,
        login,
        register,
        completeProfile,
        updateProfile,
        logout,
        joinedClassIds,
        joinClass,
        leaveClass,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
