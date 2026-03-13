import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/data/types';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Users, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roles: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: 'student', label: 'Student', icon: <GraduationCap className="w-5 h-5" /> },
  { value: 'teacher', label: 'Teacher', icon: <BookOpen className="w-5 h-5" /> },
  { value: 'cr', label: 'CR', icon: <Users className="w-5 h-5" /> },
];

const LAST_USERNAME_STORAGE_KEY = 'unistu_last_username';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem(LAST_USERNAME_STORAGE_KEY);
      if (savedUsername) {
        setUsername(savedUsername);
      }
    } catch {
      // Ignore storage access issues and keep the form usable.
    }
  }, []);

  useEffect(() => {
    try {
      const trimmedUsername = username.trim();
      if (trimmedUsername) {
        localStorage.setItem(LAST_USERNAME_STORAGE_KEY, trimmedUsername);
      }
    } catch {
      // Ignore storage access issues and keep the form usable.
    }
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username.trim() && password.trim()) {
      const result = await login(username.trim(), password, role);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[390px]"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/15 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Smart Class <span className="text-primary">Manager</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Manage your academic life efficiently
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-card rounded-2xl p-1.5 mb-6 shadow-lg shadow-black/20">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                role === r.value
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-3xl p-6 shadow-lg shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-input rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-input rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl text-sm shadow-lg shadow-primary/25 transition-all"
            >
              Login
            </motion.button>

            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')} className="text-primary font-medium hover:underline">
            Create Account
          </button>
        </p>
      </motion.div>
    </div>
  );
}
