import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Printer,
  Sparkles,
  Building,
  AlertCircle,
  X,
  Filter,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns current day of the week in Indian Standard Time (Asia/Kolkata)
 */
function getInitialKolkataDay() {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
    });
    const day = formatter.format(new Date());
    return day === 'Sunday' ? 'Monday' : day;
  } catch {
    return 'Monday';
  }
}

export default function TeacherTimetable() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(getInitialKolkataDay);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('All');
  const [periods, setPeriods] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // 1. Fetch assigned classes for the filter dropdown
  useEffect(() => {
    let isMounted = true;
    async function loadAssignedClasses() {
      try {
        const classList = await api.getClasses();
        if (!isMounted) return;
        const all = Array.isArray(classList) ? classList : [];
        if (user?.role === 'teacher' && user?.wing !== 'Administration' && Array.isArray(user?.assignedClasses) && user.assignedClasses.length > 0) {
          const assignedIds = user.assignedClasses.map((c) => c.toString());
          const filtered = all.filter((c) => assignedIds.includes((c._id || c.id)?.toString()));
          setClasses(filtered.length > 0 ? filtered : all);
        } else {
          setClasses(all);
        }
      } catch {
        // non-fatal
      }
    }
    loadAssignedClasses();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Fetch real timetable schedule from MongoDB for the selected day in Asia/Kolkata
  useEffect(() => {
    let isMounted = true;
    async function fetchTeachingRoutine() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const routine = await api.getTeacherTimetable(selectedDay);
        if (isMounted) {
          setPeriods(Array.isArray(routine) ? routine : []);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load official timetable records from server.');
          setPeriods([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTeachingRoutine();
    return () => {
      isMounted = false;
    };
  }, [selectedDay]);

  const filteredPeriods = periods.filter((p) => {
    if (selectedGradeFilter === 'All') return true;
    return (
      (p.grade && p.grade.toLowerCase().includes(selectedGradeFilter.toLowerCase())) ||
      (p.classId && p.classId.toString() === selectedGradeFilter.toString())
    );
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            CLASSROOM TIMETABLE • FACULTY SCHEDULE (IST • ASIA/KOLKATA)
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Teaching Timetable & Periods
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Weekly teaching schedule, period allocations, and subject commitments for Primary Section • Daulatyarpur Campus.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-bold bg-white hover:bg-slate-50 border-slate-300"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print Timetable</span>
          </Button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between animate-in fade-in print:hidden">
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

      {/* Day Selector Tabs (Asia/Kolkata timezone scheduled) */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-1.5 print:hidden">
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedDay === day
                ? 'bg-school-800 text-white shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Grade Filter & Day Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-school-50/70 border border-school-200/90 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-school-800 text-white font-black text-sm flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">{selectedDay} Teaching Roster</h3>
            <span className="text-xs text-slate-500">
              {filteredPeriods.length} instructional periods scheduled • Assembly 08:00 AM • Lunch Recess 11:30 AM (IST)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <span className="text-xs font-bold text-slate-600">Filter Class:</span>
          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-600"
          >
            <option value="All">All Assigned Classes</option>
            {classes.map((c) => (
              <option key={c._id || c.id} value={c.name}>
                {c.name} - Section {c.section || 'A'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Periods Cards */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading {selectedDay}'s routine from MongoDB timetable registry...
          </Card>
        ) : filteredPeriods.length === 0 ? (
          <Card className="p-12 text-center text-xs text-slate-400">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">No periods configured for {selectedDay}.</p>
            <p className="text-slate-500 mt-1 max-w-md mx-auto">
              Period allocations will appear here once officially scheduled in the academic timetable registry.
            </p>
          </Card>
        ) : (
          filteredPeriods.map((p) => (
            <Card
              key={p.id || `${p.period}-${p.time}`}
              className="p-5 hover:border-school-300 transition-all shadow-soft-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 font-black text-sm flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Period</span>
                  <span>{p.period}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">{p.subject}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-school-100 text-school-800">
                      {p.grade}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 font-mono">
                      {p.room || 'Room 101'}
                    </span>
                  </div>

                  {p.notes && <p className="text-xs text-slate-500">{p.notes}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-school-600" />
                  <span>{p.time}</span>
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* School Routine Information Card */}
      <Card className="p-5 bg-slate-50 border border-slate-200/90 text-xs text-slate-600 space-y-2">
        <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-school-700" />
          <span>General School Routine & Bell Timings (Indian Standard Time • Asia/Kolkata)</span>
        </div>
        <p className="leading-relaxed">
          Morning Assembly & Physical Warm-up begins at 08:00 AM sharp in the school central quadrangle. Faculty members on gate duty are requested to be present by 07:45 AM. Mid-day recess is observed between Period 3 and Period 4 (11:30 AM to 12:00 PM).
        </p>
      </Card>
    </div>
  );
}
