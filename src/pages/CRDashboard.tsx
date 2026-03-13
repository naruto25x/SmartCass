import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClassRooms } from '@/hooks/use-classrooms';
import { ClassRoom } from '@/data/types';
import { motion } from 'framer-motion';
import { Plus, Users, ArrowRight, Copy, Check, Pencil, X, Trash2, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CRDashboard() {
  const { user } = useAuth();
  const { classRooms, updateClass, deleteClass } = useClassRooms();
  const navigate = useNavigate();
  const p = user?.profile;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/25 flex items-center justify-center text-primary text-xl font-display font-bold">
            {p ? `${p.firstName?.charAt(0)}${p.lastName?.charAt(0)}` : user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-display font-bold text-foreground truncate">
              {p ? `${p.firstName} ${p.lastName}` : user?.username}
            </h2>
            <p className="text-xs text-primary font-medium">Class Representative</p>
            {p ? (
              <p className="text-xs text-muted-foreground mt-0.5">{p.department} • {p.university}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">Welcome back!</p>
            )}
          </div>
        </div>
      </div>

      {/* Create Class Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/create-class')}
        className="w-full bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-center gap-3 mb-6 shadow-lg shadow-primary/25 font-bold text-sm"
      >
        <Plus className="w-5 h-5" />
        Create New Class
      </motion.button>

      {/* Classes */}
      <h3 className="text-sm font-display font-semibold text-foreground mb-3">My Classes</h3>
      <div className="space-y-3">
        {classRooms.map((cls, i) => (
          <ClassCard key={cls.id} cls={cls} index={i} navigate={navigate} onRename={(newName) => updateClass(cls.id, { semesterName: newName })} onDelete={() => deleteClass(cls.id)} />
        ))}
      </div>
    </motion.div>
  );
}

function ClassCard({ cls, index, navigate, onRename, onDelete }: { cls: ClassRoom; index: number; navigate: ReturnType<typeof useNavigate>; onRename: (name: string) => void; onDelete: () => void }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(cls.semesterName);

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cls.classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(cls.semesterName);
    setEditing(true);
  };

  const handleSave = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editName.trim()) {
      onRename(editName.trim());
    }
    setEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => !editing && navigate(`/cr-class/${cls.id}`)}
      className="bg-card rounded-2xl p-4 shadow-lg shadow-black/10 border border-border/50 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {editing ? (
            <form onSubmit={handleSave} className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="bg-input rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                autoFocus
              />
              <button type="submit" className="text-primary"><Check className="w-4 h-4" /></button>
              <button type="button" onClick={handleCancel} className="text-muted-foreground"><X className="w-4 h-4" /></button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground">{cls.semesterName}</h4>
              <button onClick={handleEdit} className="text-muted-foreground hover:text-primary transition-colors">
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this class?')) onDelete(); }} className="text-muted-foreground hover:text-red-400 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">{cls.department}</p>
          <p className="text-xs text-muted-foreground">{cls.university}</p>
        </div>
        {!editing && <ArrowRight className="w-5 h-5 text-muted-foreground" />}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />{cls.studentCount} students
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />{cls.teacherCount} teachers
          </span>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 text-xs text-primary font-display font-bold bg-primary/10 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {cls.classCode}
        </button>
      </div>
    </motion.div>
  );
}
