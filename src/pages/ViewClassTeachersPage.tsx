import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useTeachers } from '@/hooks/use-teachers';
import { useClassRooms } from '@/hooks/use-classrooms';
import { ArrowLeft, Search, GraduationCap, Phone, BookOpen } from 'lucide-react';

export default function ViewClassTeachersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classRooms } = useClassRooms();
  const { teachers } = useTeachers(id);
  const cls = classRooms.find(c => c.id === id);
  const [search, setSearch] = useState('');

  if (!cls) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Class not found</p></div>;
  }

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.courseCode.toLowerCase().includes(search.toLowerCase()) ||
    t.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="mb-5">
        <h2 className="text-xl font-display font-bold text-foreground">Teachers</h2>
        <p className="text-sm text-muted-foreground mt-1">{cls.semesterName} • {teachers.length} teachers</p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or course"
          className="w-full bg-card rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border/50"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
          <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No teachers added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-yellow-400/15 flex items-center justify-center text-yellow-400 font-display font-bold text-sm shrink-0">
                  {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">{teacher.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground">{teacher.phone}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <BookOpen className="w-3 h-3 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground">{teacher.courseCode} — {teacher.courseName}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
