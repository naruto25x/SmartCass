import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudents } from '@/hooks/use-students';
import { useClassRooms } from '@/hooks/use-classrooms';
import { ArrowLeft, Plus, Pencil, Trash2, X, Search, Users } from 'lucide-react';

export default function CRStudentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classRooms, updateClass } = useClassRooms();
  const { students, addStudent, updateStudent, deleteStudent } = useStudents(id);
  const cls = classRooms.find(c => c.id === id);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');

  if (!cls) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Class not found</p></div>;
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const openAddForm = () => {
    setName('');
    setStudentId('');
    setPhone('');
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (s: { id: string; name: string; studentId: string; phone: string }) => {
    setName(s.name);
    setStudentId(s.studentId);
    setPhone(s.phone);
    setEditingId(s.id);
    setShowForm(true);
  };

  const normalizedName = name.trim();
  const normalizedStudentId = studentId.trim();
  const normalizedPhone = phone.trim();
  const hasDuplicateStudentId = students.some(
    s => s.studentId.trim().toLowerCase() === normalizedStudentId.toLowerCase() && s.id !== editingId
  );
  const isFormValid =
    normalizedName.length >= 2 &&
    normalizedStudentId.length >= 3 &&
    normalizedPhone.length >= 6 &&
    !hasDuplicateStudentId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    if (editingId) {
      updateStudent(editingId, { name: normalizedName, studentId: normalizedStudentId, phone: normalizedPhone });
    } else {
      addStudent({
        id: crypto.randomUUID(),
        name: normalizedName,
        studentId: normalizedStudentId,
        department: cls.department,
        university: cls.university,
        phone: normalizedPhone,
        attendancePercentage: 0,
      });
      if (id) updateClass(id, { studentCount: students.length + 1 });
    }
    setShowForm(false);
    setEditingId(null);
    setName('');
    setStudentId('');
    setPhone('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Students</h2>
          <p className="text-sm text-muted-foreground mt-1">{cls.semesterName} • {students.length} students</p>
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
          placeholder="Search by name or ID"
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
              {editingId ? 'Edit Student' : 'Add Student'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. CSE-2024-001"
                minLength={3}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Raihan Ahmed"
                minLength={2}
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
                minLength={6}
                required
              />
            </div>

            {hasDuplicateStudentId && (
              <p className="text-xs text-destructive">This student ID already exists in this class.</p>
            )}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={!isFormValid}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? 'Update Student' : 'Add Student'}
            </motion.button>
          </form>
        </motion.div>
      )}

      {/* Student List */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No students yet. Add one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-display font-bold text-sm shrink-0">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">{student.name}</h4>
                  <p className="text-xs text-muted-foreground">{student.studentId}</p>
                  {student.phone && <p className="text-xs text-muted-foreground">{student.phone}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditForm(student)}
                    className="text-muted-foreground hover:text-primary transition-colors p-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { deleteStudent(student.id); if (id) updateClass(id, { studentCount: students.length - 1 }); }}
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
