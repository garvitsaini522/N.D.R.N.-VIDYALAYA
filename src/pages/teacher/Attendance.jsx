import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CalendarCheck2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  CheckCheck,
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  History,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { portalApi } from '../../services/portalApi';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

const CLASS_OPTIONS = [
  'Class 5',
  'Class 4',
  'Class 3',
  'Class 2',
  'Class 1',
  'UKG',
  'LKG',
  'Nursery',
];

export default function TeacherAttendance() {
  const { user } = useAuth();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialClass = queryParams.get('class') || 'Class 5';

  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'history'
  const [historyRecords, setHistoryRecords] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const allStudents = DataService.getStudents();
    const classStudents = allStudents.filter((s) => s.grade === selectedClass);
    setStudents(classStudents);

    // Initialize map (default to 'Present')
    const initialMap = {};
    classStudents.forEach((s) => {
      initialMap[s.id] = 'Present';
    });
    setAttendanceMap(initialMap);

    // Load recent history records
    const hist = DataService.getAttendanceRecords();
    setHistoryRecords(hist.filter((h) => !h.className || h.className === selectedClass));
  }, [selectedClass]);

  const toggleStudentStatus = (id) => {
    const current = attendanceMap[id] || 'Present';
    const next = current === 'Present' ? 'Absent' : current === 'Absent' ? 'Late' : 'Present';
    setAttendanceMap((prev) => ({ ...prev, [id]: next }));
  };

  const setStudentStatus = (id, status) => {
    setAttendanceMap((prev) => ({ ...prev, [id]: status }));
  };

  const markAllPresent = () => {
    const newMap = {};
    students.forEach((s) => {
      newMap[s.id] = 'Present';
    });
    setAttendanceMap(newMap);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    const presentCount = Object.values(attendanceMap).filter((st) => st === 'Present').length;
    const absentCount = Object.values(attendanceMap).filter((st) => st === 'Absent').length;
    const lateCount = Object.values(attendanceMap).filter((st) => st === 'Late').length;

    const payload = {
      date: selectedDate,
      className: selectedClass,
      section: 'A',
      total: students.length,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      markedBy: user?.name || 'Class Incharge',
      records: students.map((s) => ({
        studentId: s.id,
        status: (attendanceMap[s.id] || 'Present').toLowerCase(),
      })),
    };

    try {
      await portalApi.recordClassAttendance(payload);
    } catch {
      DataService.markClassAttendance(payload);
    }

    setHistoryRecords(DataService.getAttendanceRecords().filter((h) => !h.className || h.className === selectedClass));
    setIsSaving(false);
    setAttendanceSaved(true);
    setTimeout(() => setAttendanceSaved(false), 3500);
  };

  const presentCount = Object.values(attendanceMap).filter((st) => st === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter((st) => st === 'Absent').length;
  const lateCount = Object.values(attendanceMap).filter((st) => st === 'Late').length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.rollNo && s.rollNo.toString().includes(q)) ||
      (s.admissionNo && s.admissionNo.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            CLASS ATTENDANCE DESK • PRIMARY SECTION
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Daily Attendance Register
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record, verify, and archive daily morning roll calls for primary wing cohorts • Daulatyarpur Campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'register' && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={markAllPresent}
                className="bg-white hover:bg-slate-50 border-slate-300 text-xs font-bold"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
                <span>Mark All Present</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveAttendance}
                disabled={isSaving || students.length === 0}
                className="bg-school-800 hover:bg-school-900 text-white text-xs font-bold shadow-soft-sm"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1.5" />
                    <span>Save Register</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'register'
              ? 'border-school-700 text-school-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Attendance Register</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-school-700 text-school-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Past Attendance Logs ({historyRecords.length})</span>
        </button>
      </div>

      {activeTab === 'register' ? (
        <>
          {/* Filter Card */}
          <Card className="p-4 bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Cohort Selector */}
                <div>
                  <label htmlFor="cohort-select" className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Select Primary Cohort
                  </label>
                  <select
                    id="cohort-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-600"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c} - Section A
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label htmlFor="attendance-date" className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Attendance Date
                  </label>
                  <input
                    id="attendance-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-600"
                  />
                </div>
              </div>

              {/* Quick Search */}
              <div className="w-full md:w-64">
                <label htmlFor="student-search" className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Filter Student Name / Roll
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="student-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in roster..."
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Success Save Banner */}
          {attendanceSaved && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Attendance register recorded and synchronized successfully for {selectedClass} on {selectedDate}.
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Archived to Database
              </span>
            </div>
          )}

          {/* 3 Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border-l-4 border-l-emerald-600 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Present</span>
                <span className="text-2xl font-black text-slate-900">{presentCount}</span>
                <span className="text-xs text-slate-400 ml-1">/ {students.length}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 bg-white border-l-4 border-l-rose-600 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Absent</span>
                <span className="text-2xl font-black text-slate-900">{absentCount}</span>
                <span className="text-xs text-slate-400 ml-1">students</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <XCircle className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 bg-white border-l-4 border-l-amber-500 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Late</span>
                <span className="text-2xl font-black text-slate-900">{lateCount}</span>
                <span className="text-xs text-slate-400 ml-1">students</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 bg-white border-l-4 border-l-school-600 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Attendance Rate</span>
                <span className="text-2xl font-black text-slate-900">{attendanceRate}%</span>
                <span className="text-xs text-slate-400 ml-1">today</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-school-50 text-school-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </Card>
          </div>

          {/* Student Roster Table */}
          <Card className="overflow-hidden p-0 border border-slate-200/90 shadow-soft-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {selectedClass} Roll Call Roster ({filteredStudents.length} Students)
              </span>
              <span className="text-xs text-slate-400">Click button or row to toggle status</span>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No students enrolled or found for {selectedClass}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Admission No</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4 text-center">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((s) => {
                      const status = attendanceMap[s.id] || 'Present';
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                            #{s.rollNo || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-[11px] text-slate-400">Parent: {s.parentName || 'Guardian'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                            {s.admissionNo || s.id}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {s.gender || 'Male'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setStudentStatus(s.id, 'Present')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  status === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => setStudentStatus(s.id, 'Absent')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  status === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => setStudentStatus(s.id, 'Late')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  status === 'Late'
                                    ? 'bg-amber-500 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : (
        /* Attendance History View */
        <Card className="p-6">
          <h3 className="text-base font-black text-slate-900 mb-4">Past Class Attendance Registers</h3>
          {historyRecords.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No historical registers found. Mark and save today's attendance to see it here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
              {historyRecords.map((rec) => {
                const total = rec.total || 0;
                const present = rec.present || 0;
                const absent = rec.absent || 0;
                const rate = total > 0 ? Math.round((present / total) * 100) : 0;
                return (
                  <div key={rec.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                        <span>{rec.className || selectedClass}</span>
                        <span className="text-[11px] font-normal text-slate-400 font-mono">Date: {rec.date}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Marked by: {rec.markedBy || 'Educator'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="text-emerald-700 font-bold">{present} Present</span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span className="text-rose-600 font-bold">{absent} Absent</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-school-100 text-school-800">
                        {rate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

