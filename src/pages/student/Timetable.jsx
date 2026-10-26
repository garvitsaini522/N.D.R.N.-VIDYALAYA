import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Printer,
  Download,
  BookOpen,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function StudentTimetable() {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState('Monday');
  const [timetableData, setTimetableData] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const data = DataService.getTimetableByClass(user?.grade);
    setTimetableData(data);
  }, [user]);

  const daySchedule = timetableData ? timetableData[activeDay] || [] : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            ACADEMIC SCHEDULE • DAILY CLASS ROUTINE
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Class Timetable & Period Allocation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Session 2026-27 • {user?.grade || 'Primary Wing'} • Daulatyarpur Campus
          </p>
        </div>

        {daySchedule.length > 0 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Timetable
          </Button>
        )}
      </div>

      {!timetableData || daySchedule.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Class Routine Schedule Published Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            The daily period routine for {user?.grade || 'your class'} is currently being compiled by the academic administration. Please follow the classroom bell schedule announced during morning assembly.
          </p>
        </Card>
      ) : (
        <>
          {/* Day Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeDay === day
                    ? 'bg-school-900 text-white shadow-soft-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Periods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daySchedule.map((p, idx) => (
              <Card key={idx} className="p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-school-700 bg-school-50 px-2 py-0.5 rounded">
                    Period {p.period}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{p.time}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{p.subject}</h4>
                <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                  <span>{p.teacher}</span>
                  <span className="text-slate-400">{p.room}</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
