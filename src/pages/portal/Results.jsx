import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  Download,
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
  X,
  Users,
  ShieldCheck,
  Building,
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
import SchoolLogo from '../../components/common/SchoolLogo';

export default function Results() {
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
  const [resultsData, setResultsData] = useState(null);
  const [activeTerm, setActiveTerm] = useState('Term I (2026-27)');
  const [showReportCardModal, setShowReportCardModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      if (!currentStudent) return;
      setLoading(true);
      setError(null);

      try {
        const studentId = currentStudent.id || currentStudent.admissionNo || activeWardId;
        const res = await portalApi.getResults(studentId);

        if (isMounted) {
          setResultsData(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load examination report.');
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      isMounted = false;
    };
  }, [currentStudent, activeWardId]);

  if (loading) {
    return <LoadingState message="Loading scholastic marksheet and grades..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const subjects = resultsData?.subjects || [];
  const totalObtained = resultsData?.totalMarks || subjects.reduce((acc, s) => acc + s.total, 0);
  const totalMax = resultsData?.maxMarks || subjects.reduce((acc, s) => acc + (s.maxTheory + s.maxPractical), 0);
  const percentage = resultsData?.percentage || ((totalObtained / totalMax) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            SCHOLASTIC EVALUATION • REPORT CARD
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Performance: {currentStudent?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Session 2026-27 • {currentStudent?.grade} • Roll #{currentStudent?.rollNo} • Daulatyarpur Campus.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => setShowReportCardModal(true)}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Print Official Marksheet
        </Button>
      </div>

      {/* Multi-Child Switcher for Parent */}
      {hasMultipleChildren && (
        <div className="bg-white rounded-2xl p-4 border border-school-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-school-600" />
            <span>Viewing Results For:</span>
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

      {/* Summary Scorecard Banner */}
      <div className="bg-gradient-to-r from-school-950 via-school-900 to-school-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gold-400 text-slate-900 flex items-center justify-center font-black text-2xl shadow-soft-md shrink-0">
            {resultsData?.overallGrade || 'A1'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-gold-300">
                Term I Performance
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white">
                {resultsData?.rank || 'Outstanding Standard'}
              </span>
            </div>
            <h3 className="text-3xl font-black mt-1">{percentage}% Aggregate</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Score: {totalObtained} / {totalMax} Marks • Primary Wing Standard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10">
          {['Term I (2026-27)', 'Term II (Upcoming)'].map((term) => (
            <button
              key={term}
              type="button"
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

      {/* Subject-Wise Marks Breakdown Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Curriculum Subject Assessment ({activeTerm})
            </h3>
            <p className="text-xs text-slate-500">
              Nursery to Class 5 Primary Evaluation Scheme • Theory & Activity/Practical Marks
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-school-50 text-school-800 border border-school-200">
            Grading Scale: A1 (91-100) • A2 (81-90)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4 text-center">Theory (Max)</th>
                <th className="py-3 px-4 text-center">Practical/Act. (Max)</th>
                <th className="py-3 px-4 text-center">Total Marks</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4">Educator Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {subjects.map((sub, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{sub.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{sub.code}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold">{sub.theory}</span>{' '}
                    <span className="text-slate-400">/ {sub.maxTheory}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold">{sub.practical}</span>{' '}
                    <span className="text-slate-400">/ {sub.maxPractical}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-school-900">
                    {sub.total}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {sub.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{sub.remarks}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td className="py-3.5 px-4" colSpan={4}>
                  Grand Total Aggregate
                </td>
                <td className="py-3.5 px-4 text-center text-sm font-black text-school-800">
                  {totalObtained} / {totalMax}
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                  {resultsData?.overallGrade || 'A1'}
                </td>
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                  Aggregate Percentage: {percentage}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Class Teacher Remark Box */}
      <Card className="p-6 bg-gradient-to-br from-school-50 to-white border border-school-200">
        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-school-700" />
          <span>Class Coordinator's Academic Observation</span>
        </h4>
        <blockquote className="text-xs sm:text-sm text-slate-700 italic leading-relaxed bg-white p-4 rounded-2xl border border-school-100 shadow-2xs mb-4">
          "{resultsData?.teacherRemarks}"
        </blockquote>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-school-100">
          <span>Evaluator: {resultsData?.classTeacher || 'Mrs. Priya Sharma'}</span>
          <span>Verified by: Principal & Head of Institution, Daulatyarpur</span>
        </div>
      </Card>

      {/* Official Marksheet Modal (Print-Ready) */}
      {showReportCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-school-700 uppercase tracking-wider">
                Official Marks Statement
              </span>
              <button
                type="button"
                onClick={() => setShowReportCardModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Mark Sheet Container */}
            <div className="py-6 border-2 border-slate-200 rounded-2xl p-6 mt-4 bg-slate-50/30">
              <div className="text-center pb-4 border-b border-slate-200">
                <SchoolLogo size="md" className="justify-center mb-1" />
                <h3 className="text-lg font-black text-slate-900 mt-2">N.D.R.N. VIDYALAYA</h3>
                <p className="text-[11px] text-slate-600 font-medium">
                  Daulatyarpur, Madhoganj, Hardoi, Uttar Pradesh • Pin: 241302
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-school-900 text-white text-[11px] font-extrabold uppercase tracking-widest rounded-full">
                  Primary Progress Report Card (2026-27)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Student Name</span>
                  <span className="font-bold text-slate-900">{currentStudent?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Admission No</span>
                  <span className="font-bold text-slate-900">{currentStudent?.admissionNo || currentStudent?.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Class & Section</span>
                  <span className="font-bold text-slate-900">{currentStudent?.grade}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Roll Number</span>
                  <span className="font-bold text-slate-900">#{currentStudent?.rollNo}</span>
                </div>
              </div>

              <div className="py-4">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="py-2 px-3 text-left">Subject</th>
                      <th className="py-2 px-3 text-center">Marks</th>
                      <th className="py-2 px-3 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.map((sub, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 font-semibold text-slate-800">{sub.name}</td>
                        <td className="py-2 px-3 text-center">{sub.total} / {sub.maxTheory + sub.maxPractical}</td>
                        <td className="py-2 px-3 text-center font-bold text-school-800">{sub.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Aggregate Score</span>
                  <span className="text-base font-black text-slate-900">{percentage}% ({resultsData?.overallGrade || 'A1'})</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Office Stamp / Verification</span>
                  <span className="font-bold text-school-800">Daulatyarpur Campus Seal</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowReportCardModal(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
