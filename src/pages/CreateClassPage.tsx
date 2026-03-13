import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useClassRooms } from '@/hooks/use-classrooms';

export default function CreateClassPage() {
  const { user, isProfileComplete } = useAuth();
  const { classRooms, addClass } = useClassRooms();
  const navigate = useNavigate();
  const [semesterName, setSemesterName] = useState('');

  // Require profile completion before creating a class
  if (!isProfileComplete) {
    return <Navigate to="/profile-setup?redirect=/create-class" replace />;
  }
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const existingCodes = new Set(classRooms.map(c => c.classCode.toUpperCase()));
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    } while (existingCodes.has(code));
    return code;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = generateCode();
    const newClass = {
      id: crypto.randomUUID(),
      semesterName,
      department,
      university: user?.profile?.university || '',
      year,
      classCode: code,
      studentCount: 0,
      teacherCount: 0,
      createdBy: user?.id || '',
    };
    addClass(newClass);
    setGeneratedCode(code);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="text-center mb-8">
        <h1 className="text-xl font-display font-bold text-foreground">Create a Class</h1>
        <p className="text-sm text-muted-foreground mt-2">Set up a new class for your batch</p>
      </div>

      <div className="bg-card rounded-3xl p-6 shadow-lg shadow-black/20">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-muted-foreground mb-2 font-medium">Semester Name</label>
            <input
              type="text"
              value={semesterName}
              onChange={e => setSemesterName(e.target.value)}
              className="w-full bg-input rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. 3rd Year 1st Semester"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2 font-medium">Department</label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full bg-input rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. Computer Science"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2 font-medium">Year</label>
            <input
              type="text"
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full bg-input rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. 2026"
              required
            />
          </div>

          {!generatedCode ? (
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl text-sm shadow-lg shadow-primary/25"
            >
              Generate Class Code
            </motion.button>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/10 rounded-2xl p-5 text-center">
                <p className="text-xs text-muted-foreground mb-2">Your Class Code</p>
                <p className="text-3xl font-display font-bold text-primary tracking-widest">{generatedCode}</p>
              </div>
              <motion.button
                type="button"
                onClick={copyCode}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-card border border-primary/30 text-primary font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => navigate('/')}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl text-sm shadow-lg shadow-primary/25"
              >
                Done
              </motion.button>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
}
