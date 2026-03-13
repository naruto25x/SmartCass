import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/data/types';
import { motion } from 'framer-motion';
import { User, Building2, Phone, Hash } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ProfileSetupPage() {
  const { user, completeProfile, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const draftKey = `unistu_profile_setup_draft_${user?.id || 'anonymous'}`;
  const [form, setForm] = useState<UserProfile>(() => {
    const fallback = {
      firstName: '',
      lastName: '',
      university: '',
      department: '',
      phone: '',
      studentId: '',
    };
    try {
      const raw = localStorage.getItem(draftKey);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(form));
  }, [draftKey, form]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeProfile(form);
    localStorage.removeItem(draftKey);
    // Redirect back to where the user came from, or home
    navigate(redirectTo || '/', { replace: true });
  };

  // If profile is already complete and there's a redirect, go there directly
  if (isProfileComplete && redirectTo) {
    navigate(redirectTo, { replace: true });
    return null;
  }
  if (isProfileComplete && !redirectTo) {
    navigate('/', { replace: true });
    return null;
  }

  const isValid = form.firstName && form.lastName && form.university && form.department && form.phone && (user?.role !== 'student' || form.studentId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[390px]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {redirectTo ? 'Complete your profile to continue' : 'Fill in your details to get started'}
          </p>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-lg shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-medium">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-medium">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                  className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-medium">
                <Building2 className="w-3 h-3 inline mr-1" />University
              </label>
              <input
                type="text"
                value={form.university}
                onChange={e => handleChange('university', e.target.value)}
                className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Dhaka University"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-medium">Department</label>
              <input
                type="text"
                value={form.department}
                onChange={e => handleChange('department', e.target.value)}
                className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Computer Science"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-medium">
                <Phone className="w-3 h-3 inline mr-1" />Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="+880 1XXX XXXXXX"
                required
              />
            </div>

            {user?.role === 'student' && (
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-medium">
                  <Hash className="w-3 h-3 inline mr-1" />Student ID
                </label>
                <input
                  type="text"
                  value={form.studentId}
                  onChange={e => handleChange('studentId', e.target.value)}
                  className="w-full bg-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. CSE-2024-001"
                  required
                />
              </div>
            )}

            <motion.button
              type="submit"
              disabled={!isValid}
              whileHover={isValid ? { scale: 1.02 } : {}}
              whileTap={isValid ? { scale: 0.98 } : {}}
              className={`w-full font-bold py-4 rounded-xl text-sm mt-2 transition-all ${
                isValid
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Complete Profile
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
