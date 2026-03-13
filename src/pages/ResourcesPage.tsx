import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Resource } from '@/data/types';
import { motion } from 'framer-motion';
import { ArrowLeft, FolderOpen, Download, Plus, Filter, Trash2, FileText, Presentation, PenTool, FileQuestion } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const typeIcons: Record<string, React.ReactNode> = {
  Notes: <FileText className="w-4 h-4" />,
  Slides: <Presentation className="w-4 h-4" />,
  Assignment: <PenTool className="w-4 h-4" />,
  'Past Paper': <FileQuestion className="w-4 h-4" />,
};

const types = ['All', 'Notes', 'Slides', 'Assignment', 'Past Paper'];

export default function ResourcesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'teacher' || user?.role === 'cr';
  const [resources, setResources] = useState<Resource[]>([]);
  const [filterType, setFilterType] = useState('All');

  const filtered = filterType === 'All' ? resources : resources.filter(r => r.type === filterType);

  const courseCodes = [...new Set(resources.map(r => r.courseCode))];
  const [filterCourse, setFilterCourse] = useState('All');
  const doubleFiltered = filterCourse === 'All' ? filtered : filtered.filter(r => r.courseCode === filterCourse);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-h2 text-foreground">Resources</h2>
          <p className="text-sm text-muted-foreground mt-1">Class notes, slides, assignments, and past papers.</p>
        </div>
        {canEdit && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Upload
          </motion.button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === t ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', ...courseCodes].map(c => (
            <button
              key={c}
              onClick={() => setFilterCourse(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filterCourse === c ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {doubleFiltered.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="surface-card surface-card-hover p-4 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                {typeIcons[r.type]}
                <span className="status-pill status-completed">{r.type}</span>
              </div>
              <span className="text-xs font-medium text-primary">{r.courseCode}</span>
            </div>
            <h4 className="text-sm font-medium text-foreground mb-2 line-clamp-2">{r.title}</h4>
            <p className="text-xs text-muted-foreground mb-3">
              {r.uploadedBy} · {format(parseISO(r.uploadDate), 'MMM d, yyyy')}
            </p>
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </motion.button>
              {canEdit && (
                <button
                  onClick={() => setResources(prev => prev.filter(x => x.id !== r.id))}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {doubleFiltered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">No resources found.</p>
      )}
    </motion.div>
  );
}
