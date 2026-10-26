import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  CalendarCheck2,
  CreditCard,
  FileCheck2,
  BellRing,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Calendar,
  Image,
  Settings,
  Mail,
  UserPlus,
  BookOpen
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { useSchoolSettings } from '../../context/SchoolSettingsContext';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function AdminDashboard() {
  const { settings } = useSchoolSettings();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const refreshDashboard = () => {
      setStudents(DataService.getStudents());
      setTeachers(DataService.getTeachers());
      setNotices(DataService.getNotices());
      setEvents(DataService.getEvents());
      setAdmissions(DataService.getAdmissions());
      setMessages(DataService.getContacts());
      setActivities(DataService.getActivities());
      setClasses(DataService.getClasses());
    };

    refreshDashboard();

    window.addEventListener('ndrn:admissions-updated', refreshDashboard);
    window.addEventListener('ndrn:notices-updated', refreshDashboard);
    window.addEventListener('ndrn:events-updated', refreshDashboard);
    window.addEventListener('ndrn:contacts-updated', refreshDashboard);
    window.addEventListener('storage', refreshDashboard);

    return () => {
      window.removeEventListener('ndrn:admissions-updated', refreshDashboard);
      window.removeEventListener('ndrn:notices-updated', refreshDashboard);
      window.removeEventListener('ndrn:events-updated', refreshDashboard);
      window.removeEventListener('ndrn:contacts-updated', refreshDashboard);
      window.removeEventListener('storage', refreshDashboard);
    };
  }, []);

  const pendingAdmissions = admissions.filter((a) => a.status === 'New');
  const upcomingEvents = events.filter((e) => e.status === 'Upcoming');
  const openMessages = messages.filter((m) => m.status === 'Open');

  return (
    <div className="space-y-8">
      {/* Executive Welcome Bar */}
      <div className="bg-gradient-to-r from-school-900 via-school-800 to-school-700 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/15 backdrop-blur-xs text-gold-300 border border-white/10 tracking-wider">
              Control Center • {settings.academicSession || 'Session 2026-27'}
            </span>
            <span className="text-xs text-slate-200">
              {settings.village}, {settings.postOffice}, {settings.district} (U.P.)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Administration Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
            Welcome to the centralized management desk for <strong className="text-white">{settings.schoolName || 'N.D.R.N. Vidyalaya'}</strong>.
            Review primary admissions, academic cohorts, fee collections, faculty assignments, and published notices.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              to="/admin/admissions"
              variant="secondary"
              size="sm"
              className="bg-white text-school-900 hover:bg-slate-100 font-bold"
              leftIcon={<FileCheck2 className="w-4 h-4 text-school-700" />}
            >
              Admissions Desk ({pendingAdmissions.length} New)
            </Button>
            <Button
              to="/admin/students"
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 font-bold"
              leftIcon={<UserPlus className="w-4 h-4 text-gold-300" />}
            >
              Enroll Student
            </Button>
            <Button
              to="/admin/settings"
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 font-bold"
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Website Settings
            </Button>
          </div>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none hidden md:block"></div>
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-school-600/30 blur-2xl pointer-events-none"></div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <Card className="p-5 bg-white border-l-4 border-l-school-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students</span>
            <div className="w-8 h-8 rounded-lg bg-school-50 text-school-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{students.length}</div>
          <p className="text-xs text-slate-500 mt-1">Nursery to Class 5</p>
        </Card>

        {/* Total Teachers */}
        <Card className="p-5 bg-white border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teachers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{teachers.length}</div>
          <p className="text-xs text-slate-500 mt-1">Active Faculty Staff</p>
        </Card>

        {/* Active Notices */}
        <Card className="p-5 bg-white border-l-4 border-l-gold-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Notices</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{notices.length}</div>
          <p className="text-xs text-slate-500 mt-1">Live on Website</p>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-5 bg-white border-l-4 border-l-saffron-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Events</span>
            <div className="w-8 h-8 rounded-lg bg-cream-200 text-saffron-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{upcomingEvents.length}</div>
          <p className="text-xs text-slate-500 mt-1">Scheduled Ahead</p>
        </Card>

        {/* Admission Enquiries */}
        <Card className="p-5 bg-white border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admissions</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{admissions.length}</span>
            {pendingAdmissions.length > 0 && (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                {pendingAdmissions.length} new
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">Online Enquiries</p>
        </Card>
      </div>

      {/* Main Grid: Class Cohorts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Class Cohorts Overview & Pending Admissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Cohorts Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Primary Cohorts & Class Teachers
                </h3>
                <p className="text-xs text-slate-500">
                  Nursery to Class 5 enrollment capacity at Daulatyarpur campus
                </p>
              </div>
              <Link
                to="/admin/academics"
                className="text-xs font-bold text-school-700 hover:text-school-800 flex items-center gap-1"
              >
                <span>Manage Classes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {classes.map((cls) => {
                const enrolled = students.filter((s) => s.grade === cls.name).length;
                return (
                  <div
                    key={cls.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-school-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900">{cls.name}</span>
                      <span className="text-[10px] font-bold text-school-700 bg-school-100 px-1.5 py-0.2 rounded">
                        Sec {cls.section}
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-slate-800">
                      {enrolled} <span className="text-xs font-normal text-slate-500">/ {cls.capacity}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-1">
                      {cls.classTeacher}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Pending Admission Enquiries Table Preview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Latest Admission Enquiries
                </h3>
                <p className="text-xs text-slate-500">
                  Prospective primary admissions awaiting verification
                </p>
              </div>
              <Link
                to="/admin/admissions"
                className="text-xs font-bold text-school-700 hover:text-school-800 flex items-center gap-1"
              >
                <span>View All ({admissions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {admissions.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No admission inquiries recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5 rounded-l-lg">Applicant</th>
                      <th className="p-2.5">Class Applying</th>
                      <th className="p-2.5">Guardian Contact</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 rounded-r-lg text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admissions.slice(0, 4).map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-2.5 font-bold text-slate-900">{adm.studentName}</td>
                        <td className="p-2.5 font-semibold text-school-700">{adm.gradeApplying}</td>
                        <td className="p-2.5 text-slate-600">
                          <div>{adm.parentName}</div>
                          <div className="text-[11px] text-slate-400">{adm.phone}</div>
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              adm.status === 'New'
                                ? 'bg-amber-100 text-amber-800'
                                : adm.status === 'Admitted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {adm.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <Link
                            to="/admin/admissions"
                            className="text-school-700 hover:text-school-800 font-bold text-xs"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Recent Activities & Shortcuts */}
        <div className="space-y-6">
          {/* Quick Admin Actions Box */}
          <Card className="p-5 bg-gradient-to-br from-school-50 to-white border border-school-200/80">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span>Administrative Shortcuts</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/admin/students"
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-school-100 text-slate-800 font-semibold shadow-2xs flex flex-col items-center text-center gap-1.5 transition-all"
              >
                <GraduationCap className="w-4 h-4 text-school-600" />
                <span>Add Student</span>
              </Link>

              <Link
                to="/admin/teachers"
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-school-100 text-slate-800 font-semibold shadow-2xs flex flex-col items-center text-center gap-1.5 transition-all"
              >
                <Users className="w-4 h-4 text-school-600" />
                <span>Add Teacher</span>
              </Link>

              <Link
                to="/admin/notices"
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-school-100 text-slate-800 font-semibold shadow-2xs flex flex-col items-center text-center gap-1.5 transition-all"
              >
                <BellRing className="w-4 h-4 text-school-600" />
                <span>Issue Notice</span>
              </Link>

              <Link
                to="/admin/fees"
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-school-100 text-slate-800 font-semibold shadow-2xs flex flex-col items-center text-center gap-1.5 transition-all"
              >
                <CreditCard className="w-4 h-4 text-school-600" />
                <span>Record Fee</span>
              </Link>
            </div>
          </Card>

          {/* Institutional Activity Log */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-school-700" />
                <span>Audit & Activity Log</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Live</span>
            </div>

            {activities.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No recent administrative activity recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-school-600 mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 truncate">{act.action}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{act.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* School Contact Verification Card */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-2">School Contact Parameter</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Active contact details configured on the public website:
            </p>
            <div className="text-xs space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-bold text-slate-800">{settings.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-800 truncate max-w-[150px]">{settings.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WhatsApp:</span>
                <span className="font-bold text-emerald-700">{settings.whatsapp}</span>
              </div>
            </div>
            <div className="mt-3 text-right">
              <Link to="/admin/settings" className="text-xs font-bold text-school-700 hover:underline">
                Edit website contact info &rarr;
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
