import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Printer,
  Sparkles,
  Building,
  CheckCircle2,
  Calendar,
  Filter,
  Check
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WEEKLY_SCHEDULE = {};

export default function TeacherTimetable() {
  const [selectedDay, setSelectedDay] = useState(() => {
    const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    return dayIndex === 0 ? 'Monday' : DAYS[dayIndex - 1] || 'Friday';
  });

  const [selectedGradeFilter, setSelectedGradeFilter] = useState('All');

  const daySchedule = WEEKLY_SCHEDULE[selectedDay] || [];

  const filteredPeriods = daySchedule.filter((p) => {
    if (selectedGradeFilter === 'All') return true;
    return p.grade && p.grade.includes(selectedGradeFilter);
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
            CLASSROOM TIMETABLE • FACULTY SCHEDULE
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

      {/* Day Selector Tabs */}
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
              {filteredPeriods.length} instructional periods scheduled • Assembly 08:00 AM • Lunch Recess 11:30 AM
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
            <option value="Class 5">Class 5</option>
            <option value="Class 4">Class 4</option>
          </select>
        </div>
      </div>

      {/* Schedule Periods Cards */}
      <div className="space-y-3">
        {filteredPeriods.length === 0 ? (
          <Card className="p-12 text-center text-xs text-slate-400">
            No periods published for {selectedDay}. The academic timetable will appear here once officially scheduled.
          </Card>
        ) : (
          filteredPeriods.map((p) => (
            <Card key={p.period} className="p-5 hover:border-school-300 transition-all shadow-soft-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                      {p.room}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">{p.notes}</p>
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
          <span>General School Routine & bell timing guidelines</span>
        </div>
        <p className="leading-relaxed">
          Morning Prayer & Physical Warm-up begins at 08:00 AM sharp in the school central quadrangle. Teachers on morning gate duty are requested to be present by 07:45 AM. Recess interval is observed between Period 3 and Period 4 (11:30 AM to 12:00 PM).
        </p>
      </Card>
    </div>
  );
}

