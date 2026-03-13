import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClassRooms } from '@/hooks/use-classrooms';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Users } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';

export default function JoinClassPage() {
  const { user, joinClass, joinedClassIds, isProfileComplete } = useAuth();
  const { classRooms, updateClass } = useClassRooms();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Require profile completion before joining a class
  if (!isProfileComplete) {
    return <Navigate to="/profile-setup?redirect=/join-class" replace />;
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const profile = user?.profile;
    const userStudentId = profile?.studentId?.trim().toLowerCase() || '';
    const userPhone = profile?.phone?.trim().replace(/\s+/g, '') || '';

    if (!userStudentId && !userPhone) {
      setError('You must add Student ID or Phone Number in profile before joining any class.');
      return;
    }

    const found = classRooms.find(c => c.classCode.toLowerCase() === code.trim().toLowerCase());
    if (!found) {
      setError('Invalid class code. Please check and try again.');
      return;
    }
    if (joinedClassIds.includes(found.id)) {
      setError('You have already joined this class.');
      return;
    }

    // Verify student identity against CR's student list
    const raw = localStorage.getItem('unistu_students');
    const allStudentsData: Record<string, { studentId: string; phone: string }[]> = raw ? JSON.parse(raw) : {};
    const classStudents = allStudentsData[found.id] || [];
    const isAllowed = classStudents.some(s => {
      const sId = s.studentId?.trim().toLowerCase() || '';
      const sPhone = s.phone?.trim().replace(/\s+/g, '') || '';
      return (userStudentId && sId && userStudentId === sId) ||
             (userPhone && sPhone && userPhone === sPhone);
    });

    if (!isAllowed) {
      setError('Your Student ID or Phone Number is not in this class student list. Contact your CR to be added.');
      return;
    }

    joinClass(found.id);
    updateClass(found.id, { studentCount: (found.studentCount || 0) + 1 });
    navigate('/', { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-display font-bold text-foreground">Join a Class</h1>
        <p className="text-sm text-muted-foreground mt-2">Enter the class code provided by your CR</p>
      </div>

      <div className="bg-card rounded-3xl p-6 shadow-lg shadow-black/20">
        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-xs text-muted-foreground mb-2 font-medium">Class Code</label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={e => { setCode(e.target.value); setError(''); setSuccess(''); }}
                className="w-full bg-input rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase tracking-widest text-center text-lg font-display font-bold"
                placeholder="Enter code"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Ask your Class Representative for the code
            </p>
          </div>

          {error && <p className="text-xs text-destructive text-center bg-destructive/10 rounded-xl py-2">{error}</p>}
          {success && <p className="text-xs text-green-400 text-center bg-green-400/10 rounded-xl py-2">{success}</p>}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl text-sm shadow-lg shadow-primary/25"
          >
            Join Class
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
