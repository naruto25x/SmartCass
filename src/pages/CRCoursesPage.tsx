import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, X, Search, BookOpen } from 'lucide-react';
import { useClassRooms } from '@/hooks/use-classrooms';
import { useCourses } from '@/hooks/use-courses';

export default function CRCoursesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classRooms } = useClassRooms();
  const { courses, addCourse, updateCourse, deleteCourse } = useCourses(id);
  const cls = classRooms.find(c => c.id === id);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');

  if (!cls) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Class not found</p></div>;
  }

  const filtered = courses.filter(course =>
    course.code.toLowerCase().includes(search.toLowerCase()) ||
    course.name.toLowerCase().includes(search.toLowerCase())
  );

  const normalizedCode = code.trim();
  const normalizedName = name.trim();
  const hasDuplicateCode = courses.some(
    course => course.code.trim().toLowerCase() === normalizedCode.toLowerCase() && course.id !== editingId
  );

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setCode('');
    setName('');
  };

  const openAddForm = () => {
    setEditingId(null);
    setCode('');
    setName('');
    setShowForm(true);
  };

  const openEditForm = (course: { id: string; code: string; name: string }) => {
    setEditingId(course.id);
    setCode(course.code);
    setName(course.name);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedCode || !normalizedName || hasDuplicateCode) return;

    if (editingId) {
      updateCourse(editingId, { code: normalizedCode, name: normalizedName });
    } else {
      addCourse({
        id: crypto.randomUUID(),
        code: normalizedCode,
        name: normalizedName,
      });
    }

    resetForm();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Courses</h2>
          <p className="text-sm text-muted-foreground mt-1">{cls.semesterName} • {courses.length} courses</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openAddForm}
          className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          Add
        </motion.button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by course code or name"
          className="w-full bg-card rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border/50"
        />
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 shadow-lg shadow-black/20 border border-border/50 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-display font-bold text-foreground">
              {editingId ? 'Edit Course' : 'Add Course'}
            </h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Course Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. CSE301"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Course Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Computer Networks"
                required
              />
            </div>

            {hasDuplicateCode && (
              <p className="text-xs text-destructive">A course with this code already exists in this class.</p>
            )}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={!normalizedCode || !normalizedName || hasDuplicateCode}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? 'Update Course' : 'Add Course'}
            </motion.button>
          </form>
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No courses yet. Add one to enable attendance sheets.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-400/15 flex items-center justify-center text-blue-400 font-display font-bold text-xs shrink-0">
                  {course.code}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">{course.name}</h4>
                  <p className="text-xs text-muted-foreground">{course.code}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditForm(course)}
                    className="text-muted-foreground hover:text-primary transition-colors p-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors p-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
