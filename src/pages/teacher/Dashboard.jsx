import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  CalendarCheck2,
  CalendarDays,
  Sparkles,
  Users,
  Clock,
  ArrowRight,
  School,
  User,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('Class 5');

  useEffect(() => {
    const clsList = DataService.getClasses();
    const stList = DataService.getStudents();

    setClasses(clsList);
    setStudents(stList);

    if (clsList.length > 0) {
      setSelectedClass(clsList[0].name);
    }
  }, []);

  const totalStudents = students.length;

  // Educator's daily periods schedule for today
  const todayPeriods = [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-school-900 via-school-800 to-school-700 p-5 sm:p-7 lg:p-8 text-white shadow-soft-lg border border-white/10">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 sm:mb-3.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-white/15 backdrop-blur-xs text-gold-300 border border-white/20 shadow-soft-xs max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-gold-300 shrink-0" />
              <span className="break-words">Faculty & Academic Console • Primary Wing</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold !text-white tracking-tight leading-snug drop-shadow-xs">
            Welcome, {user?.name || 'Faculty Member'}!
          </h1>

          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-cream-100/90 leading-relaxed max-w-2xl">
            {user?.designation || 'Primary Section Faculty'} at N.D.R.N. Vidyalaya, Daulatyarpur, Madhoganj.
            Manage daily class registers, student evaluation, syllabus coverage, and academic timetable.
          </p>

          <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              to="/teacher/attendance"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-school-900 hover:bg-school-50 border border-white/30 transition-all shadow-soft-sm active:scale-98 shrink-0"
            >
              <CalendarCheck2 className="w-4 h-4 text-school-700 shrink-0" />
              <span>Mark Today's Attendance</span>
            </Link>
            <Link
              to="/teacher/timetable"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-xs transition-all shadow-soft-xs active:scale-98 shrink-0"
            >
              <CalendarDays className="w-4 h-4 text-gold-300 shrink-0" />
              <span>Teaching Timetable</span>
            </Link>
            <Link
              to="/teacher/students"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-xs transition-all shadow-soft-xs active:scale-98 shrink-0"
            >
              <Users className="w-4 h-4 text-gold-300 shrink-0" />
              <span>Student Roster</span>
            </Link>
          </div>
        </div>

        {/* Decorative background accents for visual balance */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none hidden md:block"></div>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-saffron-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Classes</span>
            <Users className="w-5 h-5 text-school-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{classes.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Nursery to Class 5 Wing</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <GraduationCap className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across primary grades</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Periods</span>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{todayPeriods.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Scheduled for today</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Wing</span>
            <School className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">Primary</div>
          <p className="text-[11px] text-slate-500 mt-1">Session 2026-27</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule and Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Cohorts */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">Primary Class Cohorts</h2>
                <p className="text-xs text-slate-500 mt-0.5">Click any class cohort to inspect attendance & roster</p>
              </div>
              <Link to="/teacher/classes" className="text-xs font-bold text-school-700 hover:underline flex items-center">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {classes.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No classes registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {classes.map((cls) => {
                  const enrolledCount = students.filter((s) => s.grade === cls.name).length;
                  const isSelected = selectedClass === cls.name;
                  return (
                    <button
                      key={cls.id || cls.name}
                      type="button"
                      onClick={() => setSelectedClass(cls.name)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-school-600 bg-school-50 ring-2 ring-school-600/20 shadow-soft-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-slate-900">{cls.name}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                          {enrolledCount} Enrolled
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">Teacher: {cls.classTeacher || 'Assigned Staff'}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                        <span className="text-[11px] text-slate-400 font-mono">{cls.room || 'Primary Wing'}</span>
                        <Link
                          to={`/teacher/attendance?class=${encodeURIComponent(cls.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-bold text-school-700 hover:underline"
                        >
                          Register →
                        </Link>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Today's Teaching Schedule */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-school-600" />
                  <span>Today's Teaching Schedule</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Session 2026-27 • Primary Section • Daulatyarpur Campus</p>
              </div>
              <Link to="/teacher/timetable" className="text-xs font-bold text-school-700 hover:underline flex items-center">
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {todayPeriods.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                No instructional periods scheduled for today.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden bg-white">
                {todayPeriods.map((p) => {
                  const statusBadge =
                    p.status === 'Completed'
                      ? 'bg-slate-100 text-slate-600'
                      : p.status === 'Ongoing'
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : 'bg-school-50 text-school-700 font-medium';

                  return (
                    <div key={p.period} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-school-100 text-school-800 font-black text-xs flex items-center justify-center shrink-0">
                          P{p.period}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                            <span>{p.subject}</span>
                            <span className="text-[11px] font-semibold text-slate-500">({p.grade})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {p.time}
                            </span>
                            <span>•</span>
                            <span>{p.room}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto ${statusBadge}`}>
                        {p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Quick Shortcuts & Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-black text-slate-900 mb-3">Academic Management</h2>
            <div className="space-y-2">
              <Link
                to="/teacher/attendance"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-school-50 text-slate-700 hover:text-school-900 text-xs font-bold transition-all border border-slate-200/80"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck2 className="w-4 h-4 text-school-600" />
                  <span>Daily Class Attendance Register</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/teacher/students"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-school-50 text-slate-700 hover:text-school-900 text-xs font-bold transition-all border border-slate-200/80"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Student Roster & Particulars</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/teacher/classes"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-school-50 text-slate-700 hover:text-school-900 text-xs font-bold transition-all border border-slate-200/80"
              >
                <div className="flex items-center gap-2.5">
                  <School className="w-4 h-4 text-amber-600" />
                  <span>Class Cohorts & Incharges</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/teacher/timetable"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-school-50 text-slate-700 hover:text-school-900 text-xs font-bold transition-all border border-slate-200/80"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span>Weekly Teaching Timetable</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/teacher/profile"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-school-50 text-slate-700 hover:text-school-900 text-xs font-bold transition-all border border-slate-200/80"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>Faculty Official Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
