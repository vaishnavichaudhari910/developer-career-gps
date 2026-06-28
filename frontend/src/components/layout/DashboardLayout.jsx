import { useState }          from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector }     from 'react-redux';
import { logout }            from '../../redux/slices/authSlice';
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Map,
  Briefcase,
  MessageSquare,
  Mic,
  FolderGit2,
  LogOut,
  Menu,
  X,
  Compass,
  Moon,
  Sun,
} from "lucide-react";

const navItems = [
  { path: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard'  },
  { path: '/dashboard/resume',    icon: FileText,        label: 'Resume'     },
  { path: '/dashboard/github',    icon: GitBranch,          label: 'GitHub'     },
  { path: '/dashboard/roadmap',   icon: Map,             label: 'Roadmap'    },
  { path: '/dashboard/jobs',      icon: Briefcase,       label: 'Jobs'       },
  { path: '/dashboard/coach',     icon: MessageSquare,   label: 'AI Coach'   },
  { path: '/dashboard/interview', icon: Mic,             label: 'Interview'  },
  { path: '/dashboard/projects',  icon: FolderGit2,      label: 'Projects'   },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode,    setDarkMode]    = useState(false);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden`}>

      {/* ── Sidebar ── */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-16'}
        transition-all duration-300 bg-white dark:bg-gray-800
        border-r border-gray-200 dark:border-gray-700
        flex flex-col shadow-sm flex-shrink-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Compass className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-gray-800 dark:text-white text-sm">
              Developer GPS
            </span>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/dashboard'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {sidebarOpen && user && (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Navbar */}
        <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, {user?.name?.split(' ')[0]} 👋
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}