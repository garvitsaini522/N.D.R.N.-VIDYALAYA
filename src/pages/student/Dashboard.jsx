import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck2,
  GraduationCap,
  CreditCard,
  Clock,
  ArrowRight,
  FileText,
  Bus,
  Award,
  CheckCircle2,
  Sparkles,
  Calendar,
  FileDown,
  User,
  ShieldCheck,
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
import TeacherDashboard from '../teacher/Dashboard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { currentStudent } = usePortal();

  // Redirect if logged in user is teacher
  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [results, setResults] = useState(null);
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadStudentData() {
      if (!currentStudent) {
        if (isMounted) setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const studentId = currentStudent.id || currentStudent.admissionNo || user.id;
        const grade = currentStudent.grade || '';

        const [attRes, ttRes, resRes] = await Promise.all([
          portalApi.getAttendance(studentId),
          portalApi.getTimetable(grade),
          portalApi.getResults(studentId),
        ]);

        if (isMounted) {
          setAttendance(attRes.data);
          setTimetable(ttRes.data);
          setResults(resRes.data);
          setDownloads(portalApi.getDownloads().slice(0, 4));
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load student records from server.');
          setLoading(false);
        }
      }
    }

    loadStudentData();

    return () => {
      isMounted = false;
    };
  }, [currentStudent, user]);

  if (loading) {
    return <LoadingState message="Loading student records from Daulatyarpur campus database..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!currentStudent) {
    return (
      <EmptyState
        title="No Student Records Found"
        description="No active student profile is linked to this account. Please contact the school office to register your student details."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 border border-slate-200/90 shadow-soft-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          {/* Academic Session Badge */}
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-school-950 via-school-900 to-school-800 border border-white/15 shadow-soft-sm hover:shadow-soft-md hover:border-gold-400/30 transition-all duration-200 select-none">
              <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" aria-hidden="true" />
              <span className="tracking-wide text-cream-50">Academic Session 2026–27</span>
            </span>
          </div>

          {/* Welcome Heading */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Welcome, {currentStudent?.name || 'Student'}!
          </h2>

          {/* Information Row: Class, Roll Number & Campus */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-slate-600 leading-normal">
            <span className="inline-flex items-center gap-1 font-medium">
              <span>Enrolled in</span>
              <span className="font-bold text-slate-900">{currentStudent?.grade || 'Class'}</span>
              {currentStudent?.rollNo && (
                <span className="font-semibold text-slate-700">(Roll #{currentStudent.rollNo})</span>
              )}
            </span>
            <span className="text-slate-300 select-none hidden sm:inline" aria-hidden="true">•</span>
            <span className="font-medium text-slate-600">
              Daulatyarpur, Madhoganj campus.
            </span>
          </div>

          {/* Action Buttons: Horizontally aligned on desktop, responsive on mobile */}
          <div className="mt-5 flex flex-wrap sm:flex-nowrap items-center gap-3">
            <Button
              to="/portal/results"
              variant="secondary"
              size="sm"
              className="bg-gradient-to-r from-school-900 via-school-800 to-school-700 text-white hover:from-school-950 hover:to-school-800 font-bold shadow-soft-sm shrink-0"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              My Report Card
            </Button>
            <Button
              to="/portal/profile"
              variant="outline"
              size="sm"
              className="border-school-800/30 text-school-900 hover:bg-school-50 font-bold shrink-0"
            >
              My Profile
            </Button>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-school-50/50 to-transparent pointer-events-none hidden md:block"></div>
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-school-600/10 blur-2xl pointer-events-none"></div>
      </div>

      {/* 3 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {attendance?.summary?.attendancePercentage !== undefined ? `${attendance.summary.attendancePercentage}%` : '—'}
            </span>
            {attendance?.summary?.attendancePercentage !== undefined && (
              <span className="text-xs font-semibold text-emerald-600">Active</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {attendance?.summary
              ? `${attendance.summary.presentDays || 0} Days Present • ${attendance.summary.absentDays || 0} Absences`
              : 'No attendance records logged yet'}
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-school-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scholastic Grade</span>
            <div className="w-8 h-8 rounded-lg bg-school-50 text-school-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {results?.overallGrade || '—'}
            </span>
            {results?.percentage !== undefined && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gold-100 text-gold-800">
                {results.percentage}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {results ? 'Scholastic Assessment Result' : 'No report card published yet'}
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-saffron-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transport Route</span>
            <div className="w-8 h-8 rounded-lg bg-cream-200 text-saffron-600 flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-slate-900 truncate">
              {currentStudent?.busRoute ? currentStudent.busRoute.split('-')[0] : 'Not Assigned'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {currentStudent?.busRoute || 'Contact school office for bus stop details'}
          </p>
        </Card>
      </div>

      {/* Schedule */}
      <div className="w-full">
        {/* Class Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-school-600" />
                <span>Today's Class Schedule ({currentStudent?.grade || 'Class'})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {timetable ? `Room: ${timetable.room || 'Primary Wing'} • Incharge: ${timetable.teacher || 'Class Incharge'}` : 'Schedule details'}
              </p>
            </div>
            <Link
              to="/portal/timetable"
              className="text-xs font-bold text-school-600 hover:text-school-700 hover:underline flex items-center gap-1"
            >
              <span>Weekly Grid</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {timetable?.schedule && timetable.schedule.length > 0 ? (
            <div className="space-y-3">
              {timetable.schedule.map((item, idx) => (
                <div
                  key={item.period}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    idx === 1
                      ? 'bg-school-50/80 border-school-300 ring-1 ring-school-400'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center ${
                        idx === 1
                          ? 'bg-school-700 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      P{item.period}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{item.subject}</h4>
                        {idx === 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-school-600 text-white">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.teacher} • <span className="font-semibold text-slate-700">{item.room}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold text-slate-600 block">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              Class timetable is currently unavailable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
