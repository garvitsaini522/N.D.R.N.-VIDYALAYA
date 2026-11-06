import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  CheckCheck,
  Search,
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function AdminAttendanceTracker() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // 1. Fetch available class cohorts from MongoDB
  useEffect(() => {
    let isMounted = true;
    async function loadClasses() {
      setIsLoadingClasses(true);
      try {
        const classList = await api.getClasses();
        if (!isMounted) return;
        const all = Array.isArray(classList) ? classList : [];
        setClasses(all);
        if (all.length > 0) {
          setSelectedClassId((all[0]._id || all[0].id)?.toString());
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load class cohorts.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingClasses(false);
        }
      }
    }
    loadClasses();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch student roster and existing records for selected class cohort and date
  useEffect(() => {
    if (!selectedClassId) return;
    let isMounted = true;
    async function fetchRoster() {
      setIsLoadingRoster(true);
      try {
        const rosterRes = await api.getStudents({ classId: selectedClassId, limit: 100 });
        if (!isMounted) return;

        const rosterList = Array.isArray(rosterRes) ? rosterRes : (rosterRes.items || []);
        setStudents(rosterList);

        // Fetch existing attendance if recorded
        let existingMap = {};
        try {
          const existing = await api.getClassAttendance(selectedClassId, selectedDate);
          if (Array.isArray(existing)) {
            existing.forEach((rec) => {
              const sid = (rec.student?._id || rec.student?.id || rec.student)?.toString();
              if (sid && rec.status) {
                existingMap[sid] = rec.status.charAt(0).toUpperCase() + rec.status.slice(1);
              }
            });
          }
        } catch {
          // ignore
        }

        const initialMap = {};
        rosterList.forEach((s) => {
          const sid = (s._id || s.id)?.toString();
          initialMap[sid] = existingMap[sid] || 'Present';
        });
        setAttendanceMap(initialMap);
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch student roster.');
          setStudents([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingRoster(false);
        }
      }
    }

    fetchRoster();
    return () => {
      isMounted = false;
    };
  }, [selectedClassId, selectedDate]);

  const toggleStudentStatus = (id) => {
    const current = attendanceMap[id] || 'Present';
    const next = current === 'Present' ? 'Absent' : current === 'Absent' ? 'Late' : 'Present';
    setAttendanceMap((prev) => ({ ...prev, [id]: next }));
  };

  const markAllPresent = () => {
    const newMap = {};
    students.forEach((s) => {
      const sid = (s._id || s.id)?.toString();
      newMap[sid] = 'Present';
    });
    setAttendanceMap(newMap);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId) {
      setErrorMessage('Please select a valid class cohort before saving.');
      return;
    }
    if (students.length === 0) {
      setErrorMessage('No enrolled students to record attendance for.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const payload = {
      classId: selectedClassId,
      date: selectedDate,
      records: students.map((s) => {
        const sid = (s._id || s.id)?.toString();
        const rawStatus = (attendanceMap[sid] || 'Present').toLowerCase();
        return {
          studentId: sid,
          status: rawStatus === 'half day' ? 'half_day' : rawStatus,
        };
      }),
    };

    try {
      await api.markClassAttendance(payload);
      setAttendanceSaved(true);
      setTimeout(() => setAttendanceSaved(false), 3500);
    } catch (err) {
      setAttendanceSaved(false);
      setErrorMessage(err.message || 'Failed to save attendance in database.');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedClassObj = classes.find((c) => (c._id || c.id)?.toString() === selectedClassId?.toString());
  const selectedClassName = selectedClassObj
    ? `${selectedClassObj.name} - Section ${selectedClassObj.section || 'A'}`
    : 'Primary Cohort';

  const presentCount = students.filter((s) => {
    const sid = (s._id || s.id)?.toString();
    return (attendanceMap[sid] || 'Present') === 'Present';
  }).length;

  const absentCount = students.filter((s) => {
    const sid = (s._id || s.id)?.toString();
    return attendanceMap[sid] === 'Absent';
  }).length;

  const lateCount = students.filter((s) => {
    const sid = (s._id || s.id)?.toString();
    return attendanceMap[sid] === 'Late';
  }).length;

  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (s.fullName || s.name || '').toLowerCase();
    const roll = (s.rollNumber || s.rollNo || '').toString().toLowerCase();
    return name.includes(q) || roll.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            CAMPUS ATTENDANCE REGISTER • ACADEMIC DESK
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Institutional Attendance Tracker
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
            disabled={isSaving || students.length === 0}
            leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
          >
            Mark All Present
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveAttendance}
            disabled={isSaving || students.length === 0}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isSaving ? 'Saving...' : 'Save Attendance'}
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
              {isLoadingClasses ? (
                <div className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-semibold animate-pulse">
                  Loading cohorts...
                </div>
              ) : (
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-600"
                >
                  {classes.map((c) => {
                    const cid = (c._id || c.id)?.toString();
                    return (
                      <option key={cid} value={cid}>
                        {c.name} - Section {c.section || 'A'}
                      </option>
                    );
                  })}
                </select>
              )}
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
                max={new Date().toISOString().split('T')[0]}
                className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-64">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Filter Student Name
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name / roll..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Save Banner */}
      {attendanceSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Attendance successfully saved and archived for {selectedClassName} ({selectedDate}).</span>
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
              {isLoadingRoster ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 animate-pulse">
                    Loading student roster from database...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No students currently enrolled in {selectedClassName}. Enroll new students via the Student Directory.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const sid = (s._id || s.id)?.toString();
                  const status = attendanceMap[sid] || 'Present';
                  return (
                    <tr key={sid} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 pl-6 font-bold text-slate-900 font-mono">
                        #{s.rollNumber || s.rollNo || '—'}
                      </td>

                      <td className="p-3.5 font-bold text-slate-900">
                        <div>{s.fullName || s.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono font-normal">
                          Admission: {s.admissionNumber || s.admissionNo || sid}
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-600">
                        <div>{s.parent?.fatherName || s.parent?.primaryContact?.name || s.parentName || 'Guardian'}</div>
                        <div className="text-[11px] text-slate-400">
                          {s.parent?.primaryContact?.phone || s.parentPhone || '—'}
                        </div>
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
                          onClick={() => toggleStudentStatus(sid)}
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
