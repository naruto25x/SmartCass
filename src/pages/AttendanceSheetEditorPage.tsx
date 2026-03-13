import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Save, X } from 'lucide-react';
import { useStudents } from '@/hooks/use-students';
import { useAttendanceSheets } from '@/hooks/use-attendance-sheets';
import { format, parseISO } from 'date-fns';

function normalizeStudentId(value: string) {
  return (value || '').trim().toLowerCase().replace(/[-\s]/g, '');
}

export default function AttendanceSheetEditorPage() {
  const navigate = useNavigate();
  const { id: classId, sheetId } = useParams();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');

  const { students } = useStudents(classId);
  const { attendanceSheets, updateAttendanceSheet } = useAttendanceSheets(classId);

  const sheet = attendanceSheets.find(item => item.id === sheetId) || null;
  const [draftRecords, setDraftRecords] = useState<Record<string, boolean>>({});
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    if (!sheet) return;
    setDraftRecords(() => {
      const next: Record<string, boolean> = {};

      students.forEach(student => {
        const normalizedStudentId = normalizeStudentId(student.studentId);
        const matchedEntry = Object.entries(sheet.recordsByStudentId).find(
          ([storedStudentId]) => normalizeStudentId(storedStudentId) === normalizedStudentId
        );

        next[student.studentId] = matchedEntry ? matchedEntry[1] : false;
      });

      return next;
    });
  }, [sheet, students]);

  useEffect(() => {
    if (!sheet) return;
    setDraftRecords(prev => {
      const next = { ...prev };
      students.forEach(student => {
        next[student.studentId] = next[student.studentId] ?? false;
      });
      return next;
    });
  }, [students, sheet]);

  const presentCount = useMemo(
    () => students.filter(student => draftRecords[student.studentId]).length,
    [students, draftRecords]
  );

  const goBack = () => {
    if (!classId) return navigate(-1);
    if (from === 'saved') return navigate(`/class/${classId}/attendance/saved`);
    return navigate(`/class/${classId}/attendance`);
  };

  const toggleStudent = (studentId: string) => {
    setDraftRecords(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    setStatusText('');
  };

  const markAll = (present: boolean) => {
    setDraftRecords(prev => {
      const next = { ...prev };
      students.forEach(student => {
        next[student.studentId] = present;
      });
      return next;
    });
    setStatusText('');
  };

  const handleSave = () => {
    if (!sheet) return;
    updateAttendanceSheet(sheet.id, {
      recordsByStudentId: draftRecords,
      updatedAt: new Date().toISOString(),
    });

    setStatusText('Attendance saved.');

    if (classId) {
      setTimeout(() => {
        if (from === 'saved') {
          navigate(`/class/${classId}/attendance/saved`, { replace: true });
        } else {
          navigate(`/class/${classId}/attendance`, { replace: true });
        }
      }, 0);
      return;
    }
  };

  if (!sheet) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Attendance sheet not found.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <button onClick={goBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">Edit Attendance</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {sheet.courseCode} - {sheet.courseName} • {format(parseISO(sheet.date), 'EEE, MMM d, yyyy')}
        </p>
        {statusText && <p className="text-xs text-muted-foreground mt-2">{statusText}</p>}
      </div>

      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Present</p>
          <p className="text-2xl font-display font-bold text-foreground">{presentCount}/{students.length}</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => markAll(true)} className="bg-green-400/15 text-green-400 text-xs font-medium px-3 py-2 rounded-xl">
            All Present
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => markAll(false)} className="bg-red-400/15 text-red-400 text-xs font-medium px-3 py-2 rounded-xl">
            All Absent
          </motion.button>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {students.length === 0 && (
          <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
            <p className="text-sm text-muted-foreground">No students added yet</p>
          </div>
        )}

        {students.map((student, i) => {
          const isPresent = draftRecords[student.studentId] ?? false;
          return (
            <motion.button
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleStudent(student.studentId)}
              className={`w-full bg-card rounded-2xl p-4 border transition-colors flex items-center gap-3 ${
                isPresent ? 'border-green-400/40' : 'border-border/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isPresent ? 'bg-green-400/20 text-green-400' : 'bg-red-400/15 text-red-400'
              }`}>
                {isPresent ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-sm font-medium text-foreground truncate">{student.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{student.studentId}</p>
              </div>
              <span className={`text-xs font-medium ${isPresent ? 'text-green-400' : 'text-red-400'}`}>
                {isPresent ? 'Present' : 'Absent'}
              </span>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className="w-full font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/25"
      >
        <Save className="w-4 h-4" />
        Save Attendance
      </motion.button>
    </motion.div>
  );
}
