import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Teacher } from '@/data/types';
import { usePersistedState } from '@/lib/utils';
import { ArrowLeft, GraduationCap, Phone, BookOpen, Search, ChevronDown } from 'lucide-react';

export default function TeachersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [teachers] = usePersistedState<Teacher[]>('unistu_page_teachers', []);

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.courseCode.toLowerCase().includes(search.toLowerCase()) ||
    t.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
      </button>
      <div className="mb-6">
        <h2 className="text-h2 text-foreground">Teachers</h2>
        <p className="text-sm text-muted-foreground mt-1">Faculty directory.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or course code"
          className="w-full bg-input rounded-md pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Teacher List */}
      <div className="space-y-3">
        {filtered.map((t, i) => {
          const expanded = expandedId === t.id;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="surface-card surface-card-hover overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedId(expanded ? null : t.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/15 flex items-center justify-center text-primary font-display font-bold text-sm">
                    {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.courseCode} — {t.courseName}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-3">
                      <a href={`tel:${t.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                        {t.phone}
                      </a>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="w-3.5 h-3.5" />
                        {t.courseCode} — {t.courseName}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No teachers found.</p>
        )}
      </div>
    </motion.div>
  );
}
