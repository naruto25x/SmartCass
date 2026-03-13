import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard,
  Bell,
  LogOut,
  Menu,
  X,
  Edit3,
  Phone,
  Building2,
  GraduationCap,
  Hash,
} from 'lucide-react';

const classNavItems = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
];

const classContextPaths = ['/class-tests', '/announcements', '/students', '/resources', '/teachers'];
const classContextPrefixes = ['/class/', '/teacher-class/', '/cr-class/', '/student/'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isClassContext = classContextPaths.includes(location.pathname) || classContextPrefixes.some(p => location.pathname.startsWith(p));
  const p = user?.profile;
  const displayName = p ? `${p.firstName} ${p.lastName}` : user?.username || 'User';
  const initials = p ? `${p.firstName?.charAt(0)}${p.lastName?.charAt(0)}` : user?.username?.charAt(0)?.toUpperCase() || 'U';
  const roleLabel = user?.role === 'cr' ? 'Class Representative' : user?.role === 'teacher' ? 'Teacher' : 'Student';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">
            Uni<span className="text-primary">Stu</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold"
          >
            {initials}
          </button>
        </div>
      </header>

      {/* Profile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-card border-r border-border z-50 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-4 flex items-center justify-between border-b border-border">
                <h2 className="font-display font-bold text-foreground">Profile</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-5">
                  {/* Avatar & Name */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-2xl font-display font-bold mb-3">
                      {initials}
                    </div>
                    <h3 className="text-base font-display font-bold text-foreground">{displayName}</h3>
                    <span className="text-xs text-primary font-medium mt-1 bg-primary/10 px-3 py-1 rounded-full">{roleLabel}</span>
                    <p className="text-xs text-muted-foreground mt-1">@{user?.username}</p>
                  </div>

                  {/* Info Items */}
                  {p ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                        <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">University</p>
                          <p className="text-xs text-foreground truncate">{p.university}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                        <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">Department</p>
                          <p className="text-xs text-foreground truncate">{p.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">Phone</p>
                          <p className="text-xs text-foreground">{p.phone}</p>
                        </div>
                      </div>
                      {p.studentId && (
                        <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                          <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">Student ID</p>
                            <p className="text-xs text-foreground">{p.studentId}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-background rounded-xl border border-dashed border-border">
                      <p className="text-xs text-muted-foreground">Profile not yet completed</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Join or create a class to fill your profile</p>
                    </div>
                  )}

                  {/* Edit Profile Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSidebarOpen(false); navigate('/edit-profile'); }}
                    className="w-full mt-5 flex items-center justify-center gap-2 bg-primary/10 text-primary font-medium py-3 rounded-xl text-sm hover:bg-primary/20 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    {p ? 'Edit Profile' : 'Setup Profile'}
                  </motion.button>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-border">
                <button
                  onClick={() => { setSidebarOpen(false); void logout(); }}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors py-2.5 rounded-xl hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 pt-14 pb-20">
        <div className="px-4 py-4 max-w-lg mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom navigation — Home always visible, extra tabs in class context */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-md border-t border-border flex items-center justify-around z-40 px-2">
        {(isClassContext ? classNavItems : [classNavItems[0]]).map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute -top-0.5 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                />
              )}
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
