import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  Download,
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import SchoolLogo from '../../components/common/SchoolLogo';

export default function StudentAcademics() {
  const { user } = useAuth();
  const [activeTerm, setActiveTerm] = useState('Term I');
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [academicResults, setAcademicResults] = useState(null);

  useEffect(() => {
    if (user?.id) {
      const res = DataService.getStudentResults(user.id);
      setAcademicResults(res);
    } else {
      setAcademicResults(null);
    }
  }, [user]);

  const subjects = academicResults?.subjects || [];
  const hasResults = subjects.length > 0;

  const totalObtained = hasResults ? subjects.reduce((acc, s) => acc + (Number(s.total) || 0), 0) : 0;
  const totalMax = hasResults ? subjects.reduce((acc, s) => acc + (Number(s.maxTheory || 0) + Number(s.maxPractical || 0)), 0) : 0;
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            SCHOLASTIC PERFORMANCE • PRIMARY EVALUATION
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Grades & Examination Report Card
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Session 2026-27 • {user?.grade || 'Primary Wing'} • Daulatyarpur, Madhoganj, Uttar Pradesh
          </p>
        </div>

        {hasResults && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setShowReportCardModal(true)}
            leftIcon={<Download className="w-4 h-4" />}
          >
            View & Print Official Marksheet
          </Button>
        )}
      </div>

      {!hasResults ? (
        <Card className="p-12 text-center bg-white border border-slate-200">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Examination Records Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Scholastic evaluation records and report cards have not been published yet for your profile. Please check back after term examinations or contact the school office.
          </p>
        </Card>
      ) : (
        <>
          {/* Summary Scorecard */}
          <div className="bg-gradient-to-r from-school-950 via-school-900 to-school-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gold-400 text-slate-900 flex items-center justify-center font-black text-2xl shadow-soft-md">
                {academicResults?.overallGrade || '—'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-gold-300">Overall Term Grade</span>
                </div>
                <h3 className="text-3xl font-black mt-1">{percentage}% Aggregate</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Total Score: {totalObtained} / {totalMax} Marks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10">
              {['Term I', 'Unit Tests', 'Final Term'].map((term) => (
                <button
                  key={term}
                  onClick={() => setActiveTerm(term)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTerm === term
                      ? 'bg-white text-school-900 shadow-soft-sm'
                      : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Subject-Wise Detailed Marks Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Subject-Wise Examination Breakdown ({activeTerm})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Continuous & Comprehensive Evaluation (CCE) Standard</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-school-50 text-school-700 border border-school-200">
                {subjects.length} Subjects Registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <th className="py-3.5 px-6">Subject Name</th>
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4 text-center">Theory</th>
                    <th className="py-3.5 px-4 text-center">Internal / Lab</th>
                    <th className="py-3.5 px-4 text-center">Total Marks</th>
                    <th className="py-3.5 px-4 text-center">Grade</th>
                    <th className="py-3.5 px-6 text-right">Faculty Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {subjects.map((sub, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                        {sub.name}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-500">{sub.code || '—'}</td>
                      <td className="py-4 px-4 text-center font-mono">
                        {sub.theory} <span className="text-slate-400">/{sub.maxTheory || 80}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-mono">
                        {sub.practical} <span className="text-slate-400">/{sub.maxPractical || 20}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-900 font-mono text-sm">
                        {sub.total} <span className="text-slate-400 font-normal">/100</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            sub.grade === 'A1' || sub.grade === 'A+'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gold-100 text-gold-800'
                          }`}
                        >
                          {sub.grade || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-600 italic">
                        {sub.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {showReportCardModal && (
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowReportCardModal(false)}
            >
              <div
                className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 relative my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowReportCardModal(false)}
                  className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center pb-6 border-b-2 border-school-900">
                  <div className="flex justify-center mb-2">
                    <SchoolLogo size="md" showSubtitle={false} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                    N.D.R.N. Vidyalaya
                  </h2>
                  <p className="text-xs text-slate-500">
                    Daulatyarpur, Madhoganj, Uttar Pradesh • UP Board (Nursery to Class 5)
                  </p>
                  <div className="mt-3 inline-block px-4 py-1 bg-school-900 text-gold-300 rounded-full text-xs font-bold uppercase tracking-widest">
                    Primary Scholastic Evaluation Record • {activeTerm}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs border-b border-slate-200 bg-slate-50 p-3 rounded-xl mt-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
                    <span className="font-extrabold text-slate-900">{user?.name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission / Roll</span>
                    <span className="font-bold text-slate-900">{user?.id || '—'} / #{user?.rollNo || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Class & Section</span>
                    <span className="font-bold text-slate-900">{user?.grade || 'Class 5'} - {user?.section || 'A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Session</span>
                    <span className="font-bold text-slate-900">2026-27</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="secondary" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                    Print Marksheet
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
