import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import DashboardPage from "./pages/DashboardPage";
import SchedulePage from "./pages/SchedulePage";
import ClassTestsPage from "./pages/ClassTestsPage";
import AttendancePage from "./pages/AttendancePage";
import SavedAttendancePage from "./pages/SavedAttendancePage";
import SavedAttendanceCoursePage from "./pages/SavedAttendanceCoursePage";
import AttendanceSheetEditorPage from "./pages/AttendanceSheetEditorPage";
import ResourcesPage from "./pages/ResourcesPage";
import TeachersPage from "./pages/TeachersPage";
import JoinClassPage from "./pages/JoinClassPage";
import ClassListPage from "./pages/ClassListPage";
import ClassDashboardPage from "./pages/ClassDashboardPage";
import TeacherClassDashboard from "./pages/TeacherClassDashboard";
import TeacherMySchedulePage from "./pages/TeacherMySchedulePage";
import CRClassDashboard from "./pages/CRClassDashboard";
import CRSchedulePage from "./pages/CRSchedulePage";
import CRStudentsPage from "./pages/CRStudentsPage";
import CRTeachersPage from "./pages/CRTeachersPage";
import CRCoursesPage from "./pages/CRCoursesPage";
import ViewClassTeachersPage from "./pages/ViewClassTeachersPage";
import ViewClassStudentsPage from "./pages/ViewClassStudentsPage";
import CreateClassPage from "./pages/CreateClassPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import StudentListPage from "./pages/StudentListPage";
import StudentProfileView from "./pages/StudentProfileView";
import EditProfilePage from "./pages/EditProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedRoute({ children, withLayout = false }: { children: React.ReactNode; withLayout?: boolean }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (withLayout) return <AppLayout>{children}</AppLayout>;
  return <>{children}</>;
}

function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
      <Route path="/profile-setup" element={<ProfileGuard><ProfileSetupPage /></ProfileGuard>} />

      {/* Main routes with bottom nav layout */}
      <Route path="/" element={<ProtectedRoute withLayout><DashboardPage /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute withLayout><SchedulePage /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute withLayout><AttendancePage /></ProtectedRoute>} />
      <Route path="/class-tests" element={<ProtectedRoute withLayout><ClassTestsPage /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute withLayout><ResourcesPage /></ProtectedRoute>} />
      <Route path="/teachers" element={<ProtectedRoute withLayout><TeachersPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute withLayout><NotificationsPage /></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute withLayout><EditProfilePage /></ProtectedRoute>} />

      {/* Class routes */}
      <Route path="/join-class" element={<ProtectedRoute><JoinClassPage /></ProtectedRoute>} />
      <Route path="/classes" element={<ProtectedRoute withLayout><ClassListPage /></ProtectedRoute>} />
      <Route path="/class/:id" element={<ProtectedRoute withLayout><ClassDashboardPage /></ProtectedRoute>} />
      <Route path="/teacher-class/:id" element={<ProtectedRoute withLayout><TeacherClassDashboard /></ProtectedRoute>} />
      <Route path="/teacher-my-schedule" element={<ProtectedRoute withLayout><TeacherMySchedulePage /></ProtectedRoute>} />
      <Route path="/cr-class/:id" element={<ProtectedRoute withLayout><CRClassDashboard /></ProtectedRoute>} />
      <Route path="/cr-class/:id/schedule" element={<ProtectedRoute withLayout><CRSchedulePage /></ProtectedRoute>} />
      <Route path="/cr-class/:id/students" element={<ProtectedRoute withLayout><CRStudentsPage /></ProtectedRoute>} />
      <Route path="/cr-class/:id/teachers" element={<ProtectedRoute withLayout><CRTeachersPage /></ProtectedRoute>} />
      <Route path="/cr-class/:id/courses" element={<ProtectedRoute withLayout><CRCoursesPage /></ProtectedRoute>} />
      <Route path="/cr-class/:id/class-tests" element={<ProtectedRoute withLayout><ClassTestsPage /></ProtectedRoute>} />
      <Route path="/cr-class/:id/announcements" element={<ProtectedRoute withLayout><AnnouncementsPage /></ProtectedRoute>} />
      <Route path="/class/:id/teachers" element={<ProtectedRoute withLayout><ViewClassTeachersPage /></ProtectedRoute>} />
      <Route path="/class/:id/students" element={<ProtectedRoute withLayout><ViewClassStudentsPage /></ProtectedRoute>} />
      <Route path="/class/:id/schedule" element={<ProtectedRoute withLayout><SchedulePage /></ProtectedRoute>} />
      <Route path="/class/:id/announcements" element={<ProtectedRoute withLayout><AnnouncementsPage /></ProtectedRoute>} />
      <Route path="/class/:id/attendance" element={<ProtectedRoute withLayout><AttendancePage /></ProtectedRoute>} />
      <Route path="/class/:id/attendance/saved" element={<ProtectedRoute withLayout><SavedAttendancePage /></ProtectedRoute>} />
      <Route path="/class/:id/attendance/saved/course/:courseId" element={<ProtectedRoute withLayout><SavedAttendanceCoursePage /></ProtectedRoute>} />
      <Route path="/class/:id/attendance/sheet/:sheetId" element={<ProtectedRoute withLayout><AttendanceSheetEditorPage /></ProtectedRoute>} />
      <Route path="/class/:id/class-tests" element={<ProtectedRoute withLayout><ClassTestsPage /></ProtectedRoute>} />
      <Route path="/class/:id/resources" element={<ProtectedRoute withLayout><ResourcesPage /></ProtectedRoute>} />
      <Route path="/create-class" element={<ProtectedRoute><CreateClassPage /></ProtectedRoute>} />

      {/* Detail routes */}
      <Route path="/announcements" element={<ProtectedRoute withLayout><AnnouncementsPage /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute withLayout><StudentListPage /></ProtectedRoute>} />
      <Route path="/student/:id" element={<ProtectedRoute withLayout><StudentProfileView /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
