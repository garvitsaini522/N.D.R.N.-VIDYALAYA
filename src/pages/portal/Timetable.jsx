import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Printer,
  Sparkles,
  Users,
  Building,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { portalApi } from '../../services/portalApi';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function Timetable() {
  const { user } = useAuth();
  const {
    currentStudent,
    availableWards,
    activeWardId,
    switchWard,
    hasMultipleChildren,
    isParent,
  } = usePortal();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Friday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    let isMounted = true;

    async function loadTimetable() {
      if (!currentStudent) return;
      setLoading(true);
      setError(null);

      try {
        const grade = currentStudent.grade || 'Class 5-A';
        const res = await portalApi.getTimetable(grade);

        if (isMounted) {
          setTimetableData(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load class timetable.');
          setLoading(false);
        }
      }
    }

    loadTimetable();

    return () => {
      isMounted = false;
    };
  }, [currentStudent, activeWardId]);

  if (loading) {
    return <LoadingState message="Loading class schedule from timetable desk..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const schedule = timetableData?.schedule || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            CLASSROOM SCHEDULE • DAILY PERIODS
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Class Timetable: {currentStudent?.grade}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Primary Section • School hours: 08:00 AM - 02:00 PM • Room: {timetableData?.room || 'Room 108'} • Daulatyarpur Campus.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => window.print()}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print Timetable
        </Button>
      </div>

      {/* Multi-Child Switcher for Parent */}
      {hasMultipleChildren && (
        <div className="bg-white rounded-2xl p-4 border border-school-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-school-600" />
            <span>Viewing Timetable For:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableWards.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => switchWard(w.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  w.id === activeWardId
                    ? 'bg-school-800 text-white shadow-soft-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {w.name} ({w.grade})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {days.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              selectedDay === d
                ? 'bg-school-800 text-white shadow-soft-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Periods Grid */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{selectedDay} Academic Routine</h3>
            <p className="text-xs text-slate-500">
              Morning Assembly begins at 08:00 AM • Bell rings at 08:30 AM
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            6 Instructional Periods
          </span>
        </div>

        {/* Schedule List */}
        <div className="space-y-3">
          {/* Morning Assembly */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-school-100 text-school-800 font-bold flex items-center justify-center shrink-0">
                08:00
              </span>
              <div>
                <span className="font-bold text-slate-900">Morning Assembly, Prayer & National Anthem</span>
                <p className="text-[11px] text-slate-500">All primary standards assemble in the main central courtyard</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">08:00 - 08:30 AM</span>
          </div>

          {/* Periods 1 to 3 */}
          {schedule.slice(0, 3).map((item) => (
            <div
              key={item.period}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-school-200 hover:bg-slate-50/70 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                  P{item.period}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.subject}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Educator: {item.teacher} • <span className="font-semibold text-slate-700">{item.room}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">{item.time}</span>
            </div>
          ))}

          {/* Recess Break */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0">
                Break
              </span>
              <div>
                <span className="font-bold text-amber-950">Nutritious Mid-Day Lunch & Refreshment Break</span>
                <p className="text-[11px] text-amber-800">Clean drinking water & supervised dining in classrooms</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-900">10:45 - 11:15 AM</span>
          </div>

          {/* Periods 4 to 6 */}
          {schedule.slice(3).map((item) => (
            <div
              key={item.period}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-school-200 hover:bg-slate-50/70 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                  P{item.period}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.subject}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Educator: {item.teacher} • <span className="font-semibold text-slate-700">{item.room}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">{item.time}</span>
            </div>
          ))}

          {/* Dispersal */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">
                02:00
              </span>
              <div>
                <span className="font-bold text-slate-900">School Dispersal & Bus Boarding</span>
                <p className="text-[11px] text-slate-500">Supervised departure by class teachers and bus attendants</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">01:30 - 02:00 PM</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
