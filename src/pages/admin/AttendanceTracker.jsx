import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Filter,
  Check,
  Calendar,
  Sparkles,
  Search,
  CheckCheck
} from 'lucide-react';
import { DataService } from '../../services/dataService';
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

export default function AdminAttendanceTracker() {
  const [selectedClass, setSelectedClass] = useState('Class 5');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  useEffect(() => {
    const allStudents = DataService.getStudents();
    const classStudents = allStudents.filter((s) => s.grade === selectedClass);
    setStudents(classStudents);

    // Initialize attendance status (default 'Present')
    const initialMap = {};
    classStudents.forEach((s) => {
      initialMap[s.id] = 'Present';
    });
    setAttendanceMap(initialMap);
  }, [selectedClass]);

  const toggleStudentStatus = (id) => {
    const current = attendanceMap[id] || 'Present';
    const next = current === 'Present' ? 'Absent' : current === 'Absent' ? 'Late' : 'Present';
    setAttendanceMap({ ...attendanceMap, [id]: next });
  };

  const markAllPresent = () => {
    const newMap = {};
    students.forEach((s) => {
      newMap[s.id] = 'Present';
    });
    setAttendanceMap(newMap);
  };

  const handleSaveAttendance = () => {
    const presentCount = Object.values(attendanceMap).filter((st) => st === 'Present').length;
    const absentCount = Object.values(attendanceMap).filter((st) => st === 'Absent').length;

    DataService.markClassAttendance({
      date: selectedDate,
      className: selectedClass,
      section: 'A',
      total: students.length,
      present: presentCount,
      absent: absentCount,
      markedBy: 'School Administrator',
    });

    setAttendanceSaved(true);
    setTimeout(() => setAttendanceSaved(false), 3500);
  };

  const presentCount = Object.values(attendanceMap).filter((st) => st === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter((st) => st === 'Absent').length;
  const lateCount = Object.values(attendanceMap).filter((st) => st === 'Late').length;

  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.rollNo && s.rollNo.toString().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            DAILY REGISTRY • DAULATYARPUR CAMPUS
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Class Attendance Management Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record, update, and monitor daily attendance rosters for Nursery to Class 5 cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={markAllPresent}
            leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
          >
            Mark All Present
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveAttendance}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Filter and Date Selection Card */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Class Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Select Primary Cohort
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-600"
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
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Attendance Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-64">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Filter Student Name
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name / roll..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
            />
          </div>
        </div>
      </Card>

      {/* Success Save Banner */}
      {attendanceSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Attendance successfully saved and archived for {selectedClass} ({selectedDate}).</span>
          </div>
          <span className="text-[10px] text-emerald-600">Saved to Audit Log</span>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-l-4 border-l-emerald-600 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Present</span>
            <span className="text-2xl font-black text-slate-900">{presentCount}</span>
            <span className="text-xs text-slate-400 ml-1">/ {students.length} students</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-rose-600 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Absent</span>
            <span className="text-2xl font-black text-slate-900">{absentCount}</span>
            <span className="text-xs text-slate-400 ml-1">students</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Late Arrival</span>
            <span className="text-2xl font-black text-slate-900">{lateCount}</span>
            <span className="text-xs text-slate-400 ml-1">students</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Students Attendance List */}
      <Card className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-6">Roll #</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Guardian Contact</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5 pr-6 text-right">Quick Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No students currently enrolled in {selectedClass}. Enroll new students via the Student Directory.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const status = attendanceMap[s.id] || 'Present';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 pl-6 font-bold text-slate-900 font-mono">
                        #{s.rollNo}
                      </td>

                      <td className="p-3.5 font-bold text-slate-900">
                        <div>{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono font-normal">ID: {s.id}</div>
                      </td>

                      <td className="p-3.5 text-slate-600">
                        <div>{s.parentName}</div>
                        <div className="text-[11px] text-slate-400">{s.parentPhone}</div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : status === 'Absent'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="p-3.5 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(s.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                        >
                          Change Status
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
