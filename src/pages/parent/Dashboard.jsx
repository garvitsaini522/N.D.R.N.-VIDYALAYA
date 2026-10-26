import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck2,
  GraduationCap,
  CreditCard,
  BookOpenCheck,
  Clock,
  ArrowRight,
  AlertCircle,
  FileText,
  Bus,
  Award,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  UserCheck,
  Calendar,
  MessageSquareQuote,
  ShieldCheck,
  Users,
  FileDown,
  RefreshCw,
  Bell,
  Check,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { portalApi } from '../../services/portalApi';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function ParentDashboard() {
  const { user } = useAuth();
  const {
    currentStudent,
    availableWards,
    activeWardId,
    switchWard,
    hasMultipleChildren,
  } = usePortal();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [homework, setHomework] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [results, setResults] = useState(null);
  const [fees, setFees] = useState(null);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [downloads, setDownloads] = useState([]);

  // Leave modal state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    category: 'Medical / Health',
    reason: '',
  });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // Fetch all dashboard data reactive to active ward
  useEffect(() => {
    let isMounted = true;

    async function loadWardData() {
      if (!currentStudent) {
        if (isMounted) setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const studentId = currentStudent.id || currentStudent.admissionNo || activeWardId;
        const grade = currentStudent.grade || 'Class 5-A';

        const [
          attRes,
          hwRes,
          ttRes,
          resRes,
          feeRes,
          noticesRes,
          eventsRes,
        ] = await Promise.all([
          portalApi.getAttendance(studentId),
          portalApi.getHomework(grade),
          portalApi.getTimetable(grade),
          portalApi.getResults(studentId),
          portalApi.getFees(studentId),
          portalApi.getNotices('parents'),
          portalApi.getEvents(),
        ]);

        if (isMounted) {
          setAttendance(attRes.data);
          setHomework(hwRes.data || []);
          setTimetable(ttRes.data);
          setResults(resRes.data);
          setFees(feeRes.data);
          setNotices((noticesRes.data || []).slice(0, 3));
          setEvents((eventsRes.data || []).slice(0, 3));
          setDownloads(portalApi.getDownloads().slice(0, 4));
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load child dashboard data. Please try again.');
          setLoading(false);
        }
      }
    }

    loadWardData();

    return () => {
      isMounted = false;
    };
  }, [currentStudent, activeWardId]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) return;

    setLeaveSubmitting(true);
    try {
      await portalApi.submitLeave({
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        category: leaveForm.category,
        reason: leaveForm.reason,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        appliedBy: user.name,
      });

      setLeaveSuccess(true);
      setTimeout(() => {
        setLeaveSuccess(false);
        setLeaveModalOpen(false);
        setLeaveForm({
          fromDate: new Date().toISOString().split('T')[0],
          toDate: new Date().toISOString().split('T')[0],
          category: 'Medical / Health',
          reason: '',
        });
      }, 1500);
    } catch {
      alert('Could not submit leave. Please contact the school office.');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading child records from Daulatyarpur campus database..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!currentStudent) {
    return (
      <EmptyState
        title="No Student Records Found"
        description="No ward profiles are linked to your parent account yet. Please contact the school office in Daulatyarpur to link your ward."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Multi-Child Switcher Banner (if Parent has multiple children) */}
      {hasMultipleChildren && (
        <div className="bg-white rounded-2xl p-4 border border-school-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-school-100 text-school-800 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5 text-school-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Your Enrolled Children</div>
              <p className="text-[11px] text-slate-500">Tap to switch dashboard view between siblings</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {availableWards.map((ward) => {
              const isSelected = ward.id === activeWardId;
              return (
                <button
                  key={ward.id}
                  type="button"
                  onClick={() => switchWard(ward.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-school-800 text-white shadow-soft-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{ward.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {ward.grade}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Welcome & Child Profile Banner */}
      <div className="bg-gradient-to-r from-school-900 via-school-800 to-school-700 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-xs text-gold-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>N.D.R.N. Vidyalaya • Parent Portal</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>Ward Present Today</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
            Viewing records for <span className="font-bold text-white">{currentStudent?.name}</span> (
            <span className="text-gold-200 font-semibold">{currentStudent?.grade}</span> • Roll #{currentStudent?.rollNo} • Admission #{currentStudent?.admissionNo || currentStudent?.id}).
            Campus: Daulatyarpur, Madhoganj, Uttar Pradesh.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setLeaveModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-school-900 hover:bg-slate-100 transition-colors shadow-soft-sm"
            >
              <Calendar className="w-4 h-4 text-school-700" />
              <span>Submit Leave Request</span>
            </button>

            <Link
              to="/portal/profile"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/15 text-white hover:bg-white/20 border border-white/20 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-gold-300" />
              <span>Child Profile</span>
            </Link>

            <Link
              to="/portal/results"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/15 text-white hover:bg-white/20 border border-white/20 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-gold-300" />
              <span>Report Card</span>
            </Link>

            <Link
              to="/portal/fees"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/15 text-white hover:bg-white/20 border border-white/20 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-emerald-300" />
              <span>Fees Desk</span>
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none hidden md:block"></div>
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-school-600/30 blur-2xl pointer-events-none"></div>
      </div>

      {/* 4 Key Real-Time Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Attendance Summary */}
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {attendance?.summary?.attendancePercentage !== undefined ? `${attendance.summary.attendancePercentage}%` : '—'}
            </span>
            {attendance?.summary?.attendancePercentage !== undefined && (
              <span className="text-xs font-semibold text-emerald-600">Logged</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {attendance?.summary
              ? `${attendance.summary.presentDays || 0} Days Present • ${attendance.summary.approvedLeaves || 0} Leaves`
              : 'No attendance records logged yet'}
          </p>
        </Card>

        {/* Academic Results Summary */}
        <Card className="p-5 border-l-4 border-l-school-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluation</span>
            <div className="w-8 h-8 rounded-lg bg-school-50 text-school-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {results?.overallGrade || '—'}
            </span>
            {results?.percentage !== undefined && (
              <span className="text-xs font-semibold text-school-600">
                {results.percentage}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {results ? `${results.rank || 'Scholastic Standard'} • Primary Wing` : 'No evaluation report card published yet'}
          </p>
        </Card>

        {/* Fees Status */}
        <Card className="p-5 border-l-4 border-l-gold-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Account</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {fees?.receipts?.length > 0
                ? (fees.summary?.outstanding === 0 ? 'All Clear' : `₹${fees.summary?.outstanding || 0} Due`)
                : 'No records'}
            </span>
            {fees?.receipts?.length > 0 && (
              <span className="text-xs font-semibold text-emerald-600">
                {fees?.summary?.status || 'Active'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {fees?.receipts?.length > 0
              ? (fees.summary?.outstanding === 0 ? 'Receipts verified • No pending dues' : `Next due: ${fees?.summary?.nextDueDate || 'Contact office'}`)
              : 'Fee payments recorded at the school accounts desk'}
          </p>
        </Card>

        {/* Transport & Location */}
        <Card className="p-5 border-l-4 border-l-saffron-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bus Route</span>
            <div className="w-8 h-8 rounded-lg bg-cream-200 text-saffron-600 flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900 truncate">
              {currentStudent?.busRoute ? currentStudent.busRoute.split('-')[0] : 'Not Assigned'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {currentStudent?.busRoute || 'Contact school office for bus stop details'}
          </p>
        </Card>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Classroom Schedule & Homework */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Timetable */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-school-600" />
                  <span>Classroom Timetable ({currentStudent?.grade})</span>
                </h3>
                <p className="text-xs text-slate-500">Teacher Incharge: {timetable?.teacher || 'Primary Lead Faculty'}</p>
              </div>
              <Link
                to="/portal/timetable"
                className="text-xs font-bold text-school-700 hover:underline flex items-center gap-1"
              >
                <span>Full Week</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {timetable?.schedule && timetable.schedule.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {timetable.schedule.map((item) => (
                  <div key={item.period} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        P{item.period}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          {item.subject}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.teacher} • <span className="font-semibold text-slate-700">{item.room}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-600">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No classes scheduled" message="Timetable has not yet been published for this standard." />
            )}
          </Card>

          {/* Pending Homework */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpenCheck className="w-4 h-4 text-amber-600" />
                  <span>Assignments & Home Tasks ({currentStudent?.grade})</span>
                </h3>
                <p className="text-xs text-slate-500">Requires daily parent inspection & signature</p>
              </div>
              <Link
                to="/portal/homework"
                className="text-xs font-bold text-school-700 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {homework.length > 0 ? (
              <div className="space-y-3">
                {homework.slice(0, 3).map((hw) => (
                  <div
                    key={hw.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-school-200 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-school-100 text-school-800">
                          {hw.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{hw.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Assigned by {hw.teacher} • <span className="font-semibold text-rose-600">Due: {hw.dueDate}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full w-fit ${
                        hw.status === 'Graded'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {hw.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No active homework" message="There are no pending assignments for this class today." />
            )}
          </Card>

          {/* School Notices Preview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-school-600" />
                <span>Recent Circulars & Notices</span>
              </h3>
              <Link
                to="/portal/notices"
                className="text-xs font-bold text-school-700 hover:underline flex items-center gap-1"
              >
                <span>All Circulars</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {notices.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{n.content}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Teacher Feedback, Events & Downloads */}
        <div className="space-y-6">
          {/* Class Teacher Remark Box */}
          <Card className="p-6 bg-gradient-to-br from-school-50 to-white border border-school-200">
            <div className="flex items-center gap-2 text-school-900 font-bold text-sm mb-3">
              <MessageSquareQuote className="w-5 h-5 text-school-600 shrink-0" />
              <span>Teacher's Progress Note</span>
            </div>

            <blockquote className="text-xs sm:text-sm text-slate-700 italic leading-relaxed bg-white p-3.5 rounded-xl border border-school-100 mb-4 shadow-2xs">
              "{results?.teacherRemarks || 'No formal evaluation remarks recorded for the current term.'}"
            </blockquote>

            <div className="flex items-center gap-2.5 pt-2 border-t border-school-100">
              <div className="w-9 h-9 rounded-full bg-school-100 text-school-800 font-bold flex items-center justify-center text-xs border border-school-300">
                {(results?.classTeacher || currentStudent?.classTeacher || 'CI').charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {results?.classTeacher || currentStudent?.classTeacher || 'Class Incharge'}
                </div>
                <div className="text-[10px] text-slate-500">Daulatyarpur Campus</div>
              </div>
            </div>
          </Card>

          {/* Upcoming School Events */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-school-600" />
                <span>Upcoming School Events</span>
              </h3>
              <Link to="/portal/events" className="text-xs font-bold text-school-700 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {events.map((evt) => (
                <div key={evt.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-school-100 text-school-800 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-extrabold uppercase">{evt.date?.split(' ')[1] || 'OCT'}</span>
                    <span className="text-xs font-black">{evt.date?.split(' ')[0] || '28'}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{evt.venue || 'Campus Grounds, Daulatyarpur'}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Download Resources Quick Box */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileDown className="w-4 h-4 text-school-600" />
                <span>Academic Downloads</span>
              </h3>
              <Link to="/portal/downloads" className="text-xs font-bold text-school-700 hover:underline">
                Hub
              </Link>
            </div>

            <div className="space-y-2">
              {downloads.map((dl) => (
                <div key={dl.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-800 truncate">{dl.title}</div>
                    <div className="text-[10px] text-slate-400">{dl.fileSize} • {dl.format}</div>
                  </div>
                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading: ${dl.title}`);
                    }}
                    className="p-1.5 rounded-lg bg-school-50 text-school-700 hover:bg-school-100 shrink-0"
                    title="Download document"
                  >
                    <FileDown className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </Card>

          {/* School Office Help Desk */}
          <Card className="p-5 bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
              <ShieldCheck className="w-4 h-4 text-school-700" />
              <span>Campus Office Contact</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              For bus inquiries or administrative help, contact Daulatyarpur reception during school hours (08:00 AM - 02:00 PM).
            </p>
            <a
              href="tel:+918429231617"
              className="text-xs font-bold text-school-800 bg-white p-2.5 rounded-xl border border-slate-200 text-center block hover:text-saffron-600 transition-colors"
            >
              📞 +91 8429231617
            </a>
          </Card>
        </div>
      </div>

      {/* Submit Leave Application Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Apply for Ward Leave
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit an official leave application for <span className="font-bold text-slate-700">{currentStudent?.name}</span> to the class teacher.
            </p>

            {leaveSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-xs font-bold text-emerald-800">Leave Request Submitted</div>
                <p className="text-[11px] text-emerald-600">
                  Application has been forwarded to the primary class coordinator. You will receive SMS notification once sanctioned.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">From Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.fromDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">To Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.toDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Leave Category</label>
                  <select
                    value={leaveForm.category}
                    onChange={(e) => setLeaveForm({ ...leaveForm, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                  >
                    <option value="Medical / Health">Medical / Health (Fever, Checkup)</option>
                    <option value="Family Function">Family Event / Function</option>
                    <option value="Urgent Domestic">Urgent Domestic Work</option>
                    <option value="Out of Town Travel">Out of Town Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Absence</label>
                  <textarea
                    rows={3}
                    required
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Brief explanation for class teacher..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600 resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setLeaveModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="sm" disabled={leaveSubmitting}>
                    {leaveSubmitting ? 'Submitting...' : 'Submit to School'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
