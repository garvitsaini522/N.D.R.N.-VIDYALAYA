import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  CalendarCheck2,
  BookOpenCheck,
  CalendarDays,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ClipboardList,
  Award,
  Bell,
  School,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [homework, setHomework] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    const clsList = DataService.getClasses();
    const stList = DataService.getStudents();
    const hwList = DataService.getHomeworkTasks();
    setClasses(clsList);
    setStudents(stList);
    setHomework(hwList);
    if (clsList.length > 0) {
      setSelectedClass(clsList[0].name);
    }
  }, []);

  const totalStudents = students.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-school-900 via-school-800 to-school-700 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-xs text-gold-300 border border-white/10 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Faculty & Academic Console • Primary Wing</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Educator'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
            {user?.designation || 'Primary Lead Educator'} at N.D.R.N. Vidyalaya, Daulatyarpur, Madhoganj.
            Manage daily class registers, student evaluation, assignments, and curriculum progress.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button to="/portal/attendance" variant="secondary" size="sm">
              <CalendarCheck2 className="w-4 h-4 mr-1.5" />
              <span>Mark Today's Attendance</span>
            </Button>
            <Button to="/portal/homework" variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <BookOpenCheck className="w-4 h-4 mr-1.5" />
              <span>Assign Homework</span>
            </Button>
          </div>
        </div>
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Homework</span>
            <BookOpenCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{homework.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Tasks currently active</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institution</span>
            <School className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">UP Board</div>
          <p className="text-[11px] text-slate-500 mt-1">Daulatyarpur, Madhoganj</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule and Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Cohorts */}
          <Card className="p-6">
            <h2 className="text-base font-black text-slate-900 mb-4 flex items-center justify-between">
              <span>Primary Class Cohorts</span>
              <span className="text-xs font-semibold text-school-700">Academic Year 2026-2027</span>
            </h2>
            {classes.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No classes registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {classes.map((cls) => {
                  const enrolledCount = students.filter((s) => s.grade === cls.name).length;
                  return (
                    <button
                      key={cls.id || cls.name}
                      type="button"
                      onClick={() => setSelectedClass(cls.name)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedClass === cls.name
                          ? 'border-school-600 bg-school-50 ring-2 ring-school-600/20'
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
                      <p className="text-[11px] text-slate-400 mt-2 font-mono">{cls.room || 'Primary Wing'}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Today's Schedule */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-school-600" />
                <span>Today's Teaching Schedule</span>
              </h2>
              <Link to="/portal/timetable" className="text-xs font-bold text-school-700 hover:underline flex items-center">
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
              <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No scheduled periods configured for today.</p>
              <p className="text-slate-500 mt-0.5">Follow the classroom timetable announced in morning assembly.</p>
            </div>
          </Card>
        </div>

        {/* Right Col: Quick Shortcuts */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-black text-slate-900 mb-3">Academic Shortcuts</h2>
            <div className="space-y-2">
              <Link
                to="/portal/attendance"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-school-50 text-slate-700 hover:text-school-900 text-xs font-bold transition-all border border-slate-200/80"
              >
                <div className="flex items-center gap-2">
                  <CalendarCheck2 className="w-4 h-4 text-school-600" />
                  <span>Daily Class Attendance Register</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/portal/homework"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-school-50 text-slate-700 hover:text-school-900 text-xs font-bold transition-all border border-slate-200/80"
              >
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="w-4 h-4 text-school-600" />
                  <span>Assignments & Homework Tracker</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/portal/academics"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-school-50 text-slate-700 hover:text-school-900 text-xs font-bold transition-all border border-slate-200/80"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-school-600" />
                  <span>Examinations & Report Cards</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
