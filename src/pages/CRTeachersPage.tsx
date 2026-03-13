import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useTeachers } from '@/hooks/use-teachers';
import { useClassRooms } from '@/hooks/use-classrooms';
import { ArrowLeft, Plus, Pencil, Trash2, X, Search, GraduationCap, Phone, BookOpen } from 'lucide-react';

export default function CRTeachersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classRooms, updateClass } = useClassRooms();
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useTeachers(id);
  const cls = classRooms.find(c => c.id === id);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [search, setSearch] = useState('');

  if (!cls) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Class not found</p></div>;
  }

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.courseCode.toLowerCase().includes(search.toLowerCase()) ||
    t.courseName.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setName('');
    setPhone('');
    setCourseCode('');
    setCourseName('');
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (t: { id: string; name: string; phone: string; courseCode: string; courseName: string }) => {
    setName(t.name);
    setPhone(t.phone);
    setCourseCode(t.courseCode);
    setCourseName(t.courseName);
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTeacher(editingId, {
        name: name.trim(),
        phone: phone.trim(),
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
      });
    } else {
      addTeacher({
        id: crypto.randomUUID(),
        name: name.trim(),
        phone: phone.trim(),
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
      });
      if (id) updateClass(id, { teacherCount: teachers.length + 1 });
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
          <h2 className="text-xl font-display font-bold text-foreground">Teachers</h2>
          <p className="text-sm text-muted-foreground mt-1">{cls.semesterName} • {teachers.length} teachers</p>
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

      {/* Search */}
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

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 shadow-lg shadow-black/20 border border-border/50 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-display font-bold text-foreground">
              {editingId ? 'Edit Teacher' : 'Add Teacher'}
            </h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Dr. Karim Rahman"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. +880 1712 345678"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Course Code</label>
              <input
                type="text"
                value={courseCode}
                onChange={e => setCourseCode(e.target.value)}
                className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. CSE301"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Course Name</label>
              <input
                type="text"
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Data Structures"
                required
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-primary/25"
            >
              {editingId ? 'Update Teacher' : 'Add Teacher'}
            </motion.button>
          </form>
        </motion.div>
      )}

      {/* Teacher List */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
          <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No teachers yet. Add one!</p>
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
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditForm(teacher)}
                    className="text-muted-foreground hover:text-primary transition-colors p-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { deleteTeacher(teacher.id); if (id) updateClass(id, { teacherCount: teachers.length - 1 }); }}
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
