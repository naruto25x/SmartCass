import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import CRDashboard from './CRDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'teacher') return <TeacherDashboard />;
  if (user?.role === 'cr') return <CRDashboard />;
  return <StudentDashboard />;
}
