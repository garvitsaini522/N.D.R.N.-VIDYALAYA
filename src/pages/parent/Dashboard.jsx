import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck2,
  GraduationCap,
  CreditCard,
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
  MessageSquareQuote,
  ShieldCheck,
  Users,
  FileDown,
  RefreshCw,
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
  const [timetable, setTimetable] = useState(null);
  const [results, setResults] = useState(null);
  const [fees, setFees] = useState(null);
  const [downloads, setDownloads] = useState([]);

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
          ttRes,
          resRes,
          feeRes,
        ] = await Promise.all([
          portalApi.getAttendance(studentId),
          portalApi.getTimetable(grade),
          portalApi.getResults(studentId),
          portalApi.getFees(studentId),
        ]);

        if (isMounted) {
          setAttendance(attRes.data);
          setTimetable(ttRes.data);
          setResults(resRes.data);
          setFees(feeRes.data);
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-school-900 via-school-800 to-school-700 p-6 sm:p-8 text-white shadow-soft-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-3 sm:mb-3.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-xs text-gold-300 border border-white/15 shadow-soft-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold-300 shrink-0" />
              <span>N.D.R.N. Vidyalaya • Parent Portal</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Ward Present Today</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold !text-white tracking-tight leading-snug drop-shadow-xs">
            Welcome, {user?.name || 'Parent'}
          </h1>

          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-cream-100/90 leading-relaxed max-w-2xl">
            Viewing records for <strong className="font-bold text-white">{currentStudent?.name || 'Child'}</strong>{' '}
            <span className="font-semibold text-gold-200">
              ({currentStudent?.grade || 'Class 5'} • Roll #{currentStudent?.rollNo || '—'} • Admission #{currentStudent?.admissionNo || currentStudent?.id || '—'})
            </span>.
            <span className="block sm:inline sm:ml-1 text-cream-200/80">Campus: Daulatyarpur, Madhoganj, Uttar Pradesh.</span>
          </p>

          <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              to="/portal/profile"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-xs transition-all shadow-soft-xs active:scale-98 shrink-0"
            >
              <UserCheck className="w-4 h-4 text-gold-300 shrink-0" />
              <span>Child Profile</span>
            </Link>

            <Link
              to="/portal/results"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-xs transition-all shadow-soft-xs active:scale-98 shrink-0"
            >
              <GraduationCap className="w-4 h-4 text-gold-300 shrink-0" />
              <span>Report Card</span>
            </Link>

            <Link
              to="/portal/fees"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-xs transition-all shadow-soft-xs active:scale-98 shrink-0"
            >
              <CreditCard className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Fees Desk</span>
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none hidden md:block"></div>
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-school-600/25 blur-2xl pointer-events-none"></div>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Classroom Schedule */}
        <div className="lg:col-span-2">
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
        </div>

        {/* Right Column (1 Col): Teacher Feedback & Downloads */}
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
    </div>
  );
}
