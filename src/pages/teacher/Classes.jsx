import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  School,
  Users,
  CalendarCheck2,
  BookOpenCheck,
  Building,
  Sparkles,
  ArrowRight,
  Eye,
  X,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeClassModal, setActiveClassModal] = useState(null);

  useEffect(() => {
    const cls = DataService.getClasses();
    const st = DataService.getStudents();
    setClasses(cls);
    setStudents(st);
  }, []);

  const totalEnrolled = students.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            ACADEMIC COHORTS • PRIMARY WING
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Class Cohorts & Incharges
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Section allotments, classroom mentor assignments, and enrolment capacities for Session 2026-27 • Daulatyarpur Campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            Total Sections: <strong className="text-slate-900">{classes.length}</strong>
          </span>
        </div>
      </div>

      {/* Class Cohorts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const classStudents = students.filter((s) => s.grade === cls.name);
          const enrolledCount = classStudents.length;
          const capacity = cls.capacity || 35;
          const occupancy = Math.round((enrolledCount / capacity) * 100);

          return (
            <Card key={cls.id || cls.name} className="p-6 flex flex-col justify-between hover:border-school-300 transition-all shadow-soft-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-2xl bg-school-100 text-school-800 font-black text-sm flex items-center justify-center shrink-0">
                      {cls.name.replace('Class ', 'C')}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{cls.name}</h3>
                      <span className="text-[11px] font-bold text-slate-500">Section A • Morning Shift</span>
                    </div>
                  </div>

                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {enrolledCount} / {capacity}
                  </span>
                </div>

                <div className="space-y-2 text-xs py-3 border-y border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Class Mentor / Teacher:</span>
                    <span className="font-bold text-slate-800">{cls.classTeacher || 'Assigned Primary Educator'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Room Location:</span>
                    <span className="font-mono text-slate-700">{cls.room || 'Primary Wing 1st Floor'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Curriculum:</span>
                    <span className="font-semibold text-slate-700">UP Board Hindi & English</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-400">Enrolment Capacity</span>
                    <span className="text-school-700">{occupancy}% Full</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${occupancy > 90 ? 'bg-amber-500' : 'bg-school-700'}`}
                      style={{ width: `${Math.min(100, occupancy)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveClassModal({ ...cls, students: classStudents })}
                  className="flex-1 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>Roster</span>
                </Button>

                <Button
                  to={`/teacher/attendance?class=${encodeURIComponent(cls.name)}`}
                  variant="primary"
                  size="sm"
                  className="flex-1 text-xs font-bold bg-school-800 hover:bg-school-900 text-white"
                >
                  <CalendarCheck2 className="w-3.5 h-3.5 mr-1" />
                  <span>Attendance</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Class Roster Detail Modal */}
      {activeClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">{activeClassModal.name} Cohort Roster</h3>
                <p className="text-xs text-slate-500">
                  Classroom Mentor: {activeClassModal.classTeacher || 'Educator'} • Room: {activeClassModal.room || 'Primary Wing'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveClassModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 rounded-2xl border border-slate-200">
              {activeClassModal.students?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No students currently enrolled in this class.
                </div>
              ) : (
                activeClassModal.students.map((st) => (
                  <div key={st.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-school-100 text-school-800 font-mono font-bold flex items-center justify-center text-xs">
                        #{st.rollNo || '1'}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{st.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{st.admissionNo || st.id}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {st.attendancePercent || 94.5}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-500">
                Enrolled: {activeClassModal.students?.length} of {activeClassModal.capacity || 35}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  to={`/teacher/attendance?class=${encodeURIComponent(activeClassModal.name)}`}
                  variant="primary"
                  size="sm"
                  className="text-xs font-bold"
                >
                  Mark Attendance Now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveClassModal(null)}
                  className="text-xs font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

