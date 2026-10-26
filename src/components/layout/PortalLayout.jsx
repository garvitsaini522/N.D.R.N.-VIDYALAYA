import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  CalendarCheck2,
  GraduationCap,
  CreditCard,
  BookOpenCheck,
  CalendarDays,
  Bell,
  LogOut,
  ExternalLink,
  Menu,
  X,
  FileDown,
  Calendar,
  Users,
  ChevronDown,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useAuth, getDashboardRoute } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import SchoolLogo from '../common/SchoolLogo';

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const {
    currentStudent,
    availableWards,
    activeWardId,
    switchWard,
    hasMultipleChildren,
    isParent,
  } = usePortal();

  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [wardDropdownOpen, setWardDropdownOpen] = useState(false);

  const dashboardPath = user ? getDashboardRoute(user.role) : '/portal';

  const portalLinks = [
    { to: dashboardPath, label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
    { to: '/portal/profile', label: isParent ? 'Child Profile' : 'Student Profile', icon: User },
    { to: '/portal/attendance', label: 'Attendance & Leave', icon: CalendarCheck2 },
    { to: '/portal/homework', label: 'Homework & Tasks', icon: BookOpenCheck },
    { to: '/portal/timetable', label: 'Class Timetable', icon: CalendarDays },
    { to: '/portal/results', label: 'Results & Report Card', icon: GraduationCap },
    { to: '/portal/fees', label: 'Fee Desk & Receipts', icon: CreditCard },
    { to: '/portal/notices', label: 'Notices & Circulars', icon: Bell },
    { to: '/portal/events', label: 'School Events', icon: Calendar },
    { to: '/portal/downloads', label: 'Downloads & Syllabi', icon: FileDown },
  ];

  // Mobile Bottom Navigation links (top 4 frequent actions + More)
  const mobileBottomLinks = [
    { to: dashboardPath, label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/portal/attendance', label: 'Attendance', icon: CalendarCheck2 },
    { to: '/portal/homework', label: 'Homework', icon: BookOpenCheck },
    { to: '/portal/results', label: 'Results', icon: GraduationCap },
  ];

  const notifications = [
    { id: 1, title: 'Term II EVS Activity Submission Due Friday', time: '10m ago', unread: true },
    { id: 2, title: 'Term II Evaluation Timetable Released (Classes 1-5)', time: '2h ago', unread: true },
    { id: 3, title: 'Quarter 2 Tuition Fee Receipt Verified', time: '1d ago', unread: false },
    { id: 4, title: 'Bal Mela Annual Fete Scheduled for 14 Nov', time: '2d ago', unread: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <SchoolLogo size="sm" to="/portal" />

        <div className="flex items-center gap-2">
          {/* Multi-Child Switcher for Parent on Mobile Header */}
          {hasMultipleChildren && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setWardDropdownOpen(!wardDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-school-50 text-school-900 border border-school-200 text-xs font-bold"
                aria-label="Switch Child"
              >
                <Users className="w-3.5 h-3.5 text-school-700" />
                <span className="max-w-[90px] truncate">{currentStudent?.name?.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-school-600" />
              </button>

              {wardDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Child Record
                  </div>
                  {availableWards.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        switchWard(w.id);
                        setWardDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                        w.id === activeWardId ? 'bg-school-50 text-school-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{w.name}</div>
                        <div className="text-[10px] text-slate-500">{w.grade} • Roll #{w.rollNo}</div>
                      </div>
                      {w.id === activeWardId && <Check className="w-4 h-4 text-school-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Menu Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Area */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <SchoolLogo size="sm" to="/portal" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge Info & Child Switcher for Parents */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 border border-slate-200/80 shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
                }
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-school-600/30"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate block">
                    {user?.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-school-100 text-school-800 uppercase tracking-wider">
                    {isParent ? 'Parent Portal' : 'Student Portal'}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">
                    {currentStudent?.grade || 'Class 5-A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Parent Child Switcher Dropdown in Sidebar */}
            {hasMultipleChildren && (
              <div className="mt-3 pt-3 border-t border-slate-200/70">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Selected Ward:</span>
                  <span className="text-school-700 font-semibold">{availableWards.length} Enrolled</span>
                </div>
                <div className="space-y-1">
                  {availableWards.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => switchWard(w.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                        w.id === activeWardId
                          ? 'bg-school-800 text-white font-bold shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                    >
                      <span className="truncate">{w.name} ({w.grade})</span>
                      {w.id === activeWardId && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Navigation Links */}
          <nav className="px-3 space-y-1 overflow-y-auto flex-1">
            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Navigation Menu
            </div>
            {portalLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-school-700 text-white shadow-soft-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-100 space-y-2 shrink-0">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public School Website</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-2xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Temporary Demo Evaluation Mode Banner */}
        {user?.isDemo && (
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-school-800 text-white px-4 py-2 text-xs shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-amber-700/30">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-white/20 font-black uppercase text-[10px] tracking-wider shrink-0">
                Demo Evaluation Mode
              </span>
              <span className="font-medium text-amber-100">
                Logged in as <strong className="text-white capitalize">{user.role} Demo Account</strong> ({user.name}). Showing realistic sample data. Offline local mode (no MongoDB required).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/login"
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] transition-colors"
              >
                Switch Demo Role
              </Link>
            </div>
          </div>
        )}

        {/* Top Navbar for Large Screens */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900">
                {isParent ? (
                  <>
                    Parent Portal: <span className="text-school-700">{user?.name}</span>
                  </>
                ) : (
                  <>
                    Student Portal: <span className="text-school-700">{user?.name}</span>
                  </>
                )}
              </h1>

              {currentStudent && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-school-100 text-school-900 border border-school-200">
                  {currentStudent.grade} • Roll #{currentStudent.rollNo}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              N.D.R.N. Vidyalaya • Daulatyarpur, Madhoganj • Primary Section (Nursery to Class 5)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Child Switcher for Parents */}
            {hasMultipleChildren && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setWardDropdownOpen(!wardDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-800 border border-slate-200 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-school-700" />
                  <span>Viewing: {currentStudent?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {wardDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Switch Active Ward
                    </div>
                    {availableWards.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          switchWard(w.id);
                          setWardDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors ${
                          w.id === activeWardId ? 'bg-school-50 text-school-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{w.name}</div>
                          <div className="text-[10px] text-slate-500">{w.grade} • Roll #{w.rollNo} • {w.admissionNo || w.id}</div>
                        </div>
                        {w.id === activeWardId && <Check className="w-4 h-4 text-school-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-in fade-in">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Notifications & Circulars</span>
                    <Link
                      to="/portal/notices"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[10px] font-semibold text-school-600 hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                        <div className="font-semibold text-slate-800">{n.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-school-700 bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Website</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Thumb-Friendly on Phones) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 z-30 shadow-lg flex items-center justify-around">
        {mobileBottomLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-school-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800"
        >
          <Menu className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </div>
  );
}
