import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileCheck2,
  BellRing,
  CreditCard,
  CalendarCheck2,
  Mail,
  Shield,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  BookOpen,
  Calendar,
  Image,
  Settings,
  HeartHandshake,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolSettings } from '../../context/SchoolSettingsContext';
import { DataService } from '../../services/dataService';
import SchoolLogo from '../common/SchoolLogo';

const ADMIN_NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard Control', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Rosters & Faculty',
    items: [
      { to: '/admin/students', label: 'Student Directory', icon: GraduationCap },
      { to: '/admin/parents', label: 'Parent Records', icon: HeartHandshake },
      { to: '/admin/teachers', label: 'Teacher Management', icon: Users },
      { to: '/admin/academics', label: 'Classes & Course Details', icon: BookOpen },
    ],
  },
  {
    title: 'Daily Operations',
    items: [
      { to: '/admin/attendance', label: 'Class Attendance Desk', icon: CalendarCheck2 },
      { to: '/admin/fees', label: 'Fee Collections & Dues', icon: CreditCard },
      { to: '/admin/fee-structure', label: 'Public Fee Structure', icon: Receipt },
      { to: '/admin/admissions', label: 'Admissions Desk', icon: FileCheck2, badgeKey: 'admissions' },
    ],
  },
  {
    title: 'Content & Media',
    items: [
      { to: '/admin/notices', label: 'Circulars & Notices', icon: BellRing },
      { to: '/admin/events', label: 'School Events', icon: Calendar },
      { to: '/admin/gallery', label: 'Gallery Media', icon: Image },
      { to: '/admin/messages', label: 'Public Enquiries', icon: Mail, badgeKey: 'messages' },
    ],
  },
  {
    title: 'System & Branding',
    items: [
      { to: '/admin/settings', label: 'Website Settings', icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSchoolSettings();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newAdmissionsCount, setNewAdmissionsCount] = useState(0);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  useEffect(() => {
    const updateCounters = () => {
      try {
        const admissions = DataService.getAdmissions();
        setNewAdmissionsCount(admissions.filter((a) => a.status === 'New').length);

        const contacts = DataService.getContacts();
        setNewMessagesCount(contacts.filter((c) => c.status === 'Open').length);
      } catch {
        // Fallback
      }
    };

    updateCounters();
    window.addEventListener('ndrn:admissions-updated', updateCounters);
    window.addEventListener('ndrn:contacts-updated', updateCounters);
    window.addEventListener('storage', updateCounters);

    return () => {
      window.removeEventListener('ndrn:admissions-updated', updateCounters);
      window.removeEventListener('ndrn:contacts-updated', updateCounters);
      window.removeEventListener('storage', updateCounters);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <SchoolLogo size="sm" to="/admin/dashboard" />
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gold-100 text-gold-900 border border-gold-300">
            Admin
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Modern Premium Light Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto flex-1">
          {/* Institutional Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <SchoolLogo size="sm" to="/admin/dashboard" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Profile Strip */}
          <div className="p-3.5 mx-4 my-3.5 rounded-2xl bg-gradient-to-br from-school-50 to-slate-50 border border-school-200/70 flex items-center gap-3">
            <img
              src={user?.avatar || '/images/principal-portrait.jpg'}
              alt={user?.name || 'Principal D.K. Saini'}
              className="w-10 h-10 rounded-xl object-cover border-2 border-school-600/30"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {user?.name || settings.principalName}
              </span>
              <span className="text-[10px] text-school-700 font-semibold block truncate">
                {user?.designation || 'Head of Institution'}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 mt-0.5">
                <Shield className="w-2.5 h-2.5" />
                <span>Authorized Admin</span>
              </span>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="px-3 pb-4 space-y-4">
            {ADMIN_NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-school-700 text-white shadow-soft-sm font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>

                      {item.badgeKey === 'admissions' && newAdmissionsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-900">
                          {newAdmissionsCount}
                        </span>
                      )}

                      {item.badgeKey === 'messages' && newMessagesCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-school-100 text-school-800">
                          {newMessagesCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2 shrink-0 bg-white">
          <Link
            to="/"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-school-700 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Public School Website</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Temporary Demo Evaluation Mode Banner */}
        {user?.isDemo && (
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-school-800 text-white px-4 py-2 text-xs shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-amber-700/30">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-white/20 font-black uppercase text-[10px] tracking-wider shrink-0">
                Demo Admin Evaluation Mode
              </span>
              <span className="font-medium text-amber-100">
                Offline simulation desk • No MongoDB database server required. Changes and records are temporary evaluation data only.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/admin/login"
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] transition-colors"
              >
                Exit Demo Admin
              </Link>
            </div>
          </div>
        )}

        {/* Top Navbar Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                {settings.schoolName || 'N.D.R.N. Vidyalaya'} • Administration Desk
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Session {settings.academicSession || '2026-27'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {settings.village}, {settings.postOffice}, {settings.district}, {settings.state} • UP Board (Nursery to Class 5)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/settings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-school-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Website Settings</span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-school-700 hover:text-school-800 bg-school-50 hover:bg-school-100 px-3 py-1.5 rounded-xl transition-colors border border-school-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Portal</span>
            </Link>

            <div className="h-5 w-px bg-slate-200"></div>

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
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
