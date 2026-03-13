import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/data/types';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EditProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const draftKey = `unistu_profile_draft_${user?.id || 'anonymous'}`;
  const [form, setForm] = useState<UserProfile>(() => {
    const fallback = user?.profile || {
      firstName: '', lastName: '', university: '', department: '', phone: '', studentId: '',
    };
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed?.form || fallback;
    } catch {
      return fallback;
    }
  });
  const [username, setUsername] = useState(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return user?.username || '';
      const parsed = JSON.parse(raw);
      return parsed?.username || user?.username || '';
    } catch {
      return user?.username || '';
    }
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const isValid =
    username.trim().length >= 3 &&
    form.firstName &&
    form.lastName &&
    form.university &&
    form.department &&
    form.phone &&
    (user?.role !== 'student' || form.studentId);

  // Keep a draft so leaving the page does not lose input.
  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify({ form, username }));
  }, [draftKey, form, username]);

  const latest = useRef({ form, username, isValid });

  useEffect(() => {
    latest.current = { form, username, isValid };
  }, [form, username, isValid]);

  useEffect(() => {
    return () => {
      const { form: latestForm, username: latestUsername, isValid: latestIsValid } = latest.current;
      if (latestIsValid) {
        void updateProfile(latestForm, latestUsername).then(result => {
          if (result.success) {
            localStorage.removeItem(draftKey);
          }
        });
      }
    };
  }, [draftKey, updateProfile]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await updateProfile(form, username.trim());
    if (!result.success) {
      setError(result.error || 'Could not save profile changes');
      return;
    }
    localStorage.removeItem(draftKey);
    setSaved(true);
    navigate('/', { replace: true });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <h1 className="text-xl font-display font-bold text-foreground mb-6">Edit Profile</h1>

      <div className="bg-card rounded-3xl p-6 shadow-lg shadow-black/20">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-2 font-medium">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" required minLength={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-medium">First Name</label>
              <input type="text" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)}
                className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" required />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-medium">Last Name</label>
              <input type="text" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)}
                className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" required />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2 font-medium">University</label>
            <input type="text" value={form.university} onChange={e => handleChange('university', e.target.value)}
              className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" required />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2 font-medium">Department</label>
            <input type="text" value={form.department} onChange={e => handleChange('department', e.target.value)}
              className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" required />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2 font-medium">Phone</label>
            <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)}
              className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" required />
          </div>

          {user?.role === 'student' && (
            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-medium">Student ID</label>
              <input type="text" value={form.studentId} onChange={e => handleChange('studentId', e.target.value)}
                className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          )}

          <motion.button
            type="submit"
            disabled={!isValid}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </motion.button>

          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
        </form>
      </div>
    </motion.div>
  );
}
