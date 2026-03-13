import { useState } from 'react';
import { motion } from 'framer-motion';
import type { StudentInfo } from '@/data/types';
import { usePersistedState } from '@/lib/utils';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentListPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [students] = usePersistedState<StudentInfo[]>('unistu_page_students', []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">Students</h2>
        <p className="text-sm text-muted-foreground mt-1">{students.length} students enrolled</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or ID"
          className="w-full bg-card rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border/50"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((student, i) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => navigate(`/student/${student.id}`)}
            className="bg-card rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-display font-bold text-sm shrink-0">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">{student.name}</h4>
                <p className="text-xs text-muted-foreground">{student.studentId}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold tabular-nums ${student.attendancePercentage < 75 ? 'text-destructive' : 'text-green-400'}`}>
                  {student.attendancePercentage}%
                </span>
                <p className="text-[10px] text-muted-foreground">attendance</p>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No students found.</p>
        )}
      </div>
    </motion.div>
  );
}
