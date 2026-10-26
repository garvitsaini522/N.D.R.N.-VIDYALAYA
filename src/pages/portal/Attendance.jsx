import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Send,
  FileCheck2,
  Sparkles,
  Users,
  ShieldAlert,
  ChevronRight,
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

export default function Attendance() {
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
  const [attendanceData, setAttendanceData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('log'); // 'log' | 'leave'

  const [leaveForm, setLeaveForm] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    category: 'Medical / Health',
    reason: '',
  });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAttendance() {
      if (!currentStudent) return;
      setLoading(true);
      setError(null);

      try {
        const studentId = currentStudent.id || currentStudent.admissionNo || activeWardId;
        const res = await portalApi.getAttendance(studentId);

        if (isMounted) {
          setAttendanceData(res.data);
          setLeaveRequests(res.data.leaveRequests || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load attendance log.');
          setLoading(false);
        }
      }
    }

    loadAttendance();

    return () => {
      isMounted = false;
    };
  }, [currentStudent, activeWardId]);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) return;

    setLeaveSubmitting(true);
    try {
      const d1 = new Date(leaveForm.fromDate);
      const d2 = new Date(leaveForm.toDate);
      const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);

      const newReq = await portalApi.submitLeave({
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        category: leaveForm.category,
        reason: `${leaveForm.category}: ${leaveForm.reason}`,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        days: diffDays,
        appliedBy: user.name,
      });

      setLeaveRequests([newReq.data, ...leaveRequests]);
      setLeaveForm({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        category: 'Medical / Health',
        reason: '',
      });
      setSubmittedMessage(true);
      setTimeout(() => setSubmittedMessage(false), 5000);
    } catch {
      alert('Could not submit leave application.');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Fetching attendance history & biometric log..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const summary = attendanceData?.summary || {
    totalDays: 110,
    presentDays: 104,
    absentDays: 2,
    approvedLeaves: 4,
    attendancePercentage: 94.5,
  };

  const records = attendanceData?.records || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div>
        <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
          STUDENT ATTENDANCE & LEAVE REGISTER
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Attendance Record for {currentStudent?.name}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Daily morning attendance records, biometric timestamps, and sanctioned leave management for Class {currentStudent?.grade}.
        </p>
      </div>

      {/* Multi-Child Switcher for Parent */}
      {hasMultipleChildren && (
        <div className="bg-white rounded-2xl p-4 border border-school-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-school-600" />
            <span>Viewing Attendance For:</span>
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

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.attendancePercentage}%</div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Meets School Criteria (&gt;75%)</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-school-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Working Days Attended</span>
            <div className="w-8 h-8 rounded-lg bg-school-50 text-school-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.presentDays} Days</div>
          <p className="text-xs text-slate-500 mt-1">Out of {summary.totalDays} academic sessions</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Leaves</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.approvedLeaves} Days</div>
          <p className="text-xs text-slate-500 mt-1">Sanctioned by class coordinator</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unexcused Absences</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.absentDays} Days</div>
          <p className="text-xs text-slate-500 mt-1">Needs regular monitoring</p>
        </Card>
      </div>

      {/* Tabs: Daily Log vs Leave Application */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('log')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'log'
              ? 'border-school-700 text-school-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Daily Attendance Log
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leave')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'leave'
              ? 'border-school-700 text-school-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Apply for Leave</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-school-100 text-school-800">
            {leaveRequests.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Daily Log Table */}
      {activeTab === 'log' && (
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Recent Daily Check-In History
              </h3>
              <p className="text-xs text-slate-500">
                Official register records verified by Mrs. Priya Sharma • Daulatyarpur campus
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              October 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Arrival Check-In</th>
                  <th className="py-3 px-4">Teacher Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold">{r.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          r.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'late'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-cream-200 text-saffron-700 border border-gold-300'
                        }`}
                      >
                        {r.status === 'present' ? <CheckCircle2 className="w-3 h-3" /> : null}
                        <span className="capitalize">{r.status?.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{r.checkIn}</td>
                    <td className="py-3 px-4 text-slate-500">{r.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Read-Only Academic Records Note */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Daily attendance registers are protected official academic records recorded by classroom teachers. In case of any discrepancy, contact your class teacher.
            </span>
          </div>
        </Card>
      )}

      {/* Tab 2: Leave Application & History */}
      {activeTab === 'leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">Submit Leave Application</h3>
              <p className="text-xs text-slate-500 mb-4">
                Submit an advance notification of absence for <span className="font-bold text-slate-700">{currentStudent?.name}</span> to the class teacher.
              </p>

              {submittedMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Leave application has been submitted to the school desk.</span>
                </div>
              )}

              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">From Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.fromDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">To Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.toDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={leaveForm.category}
                    onChange={(e) => setLeaveForm({ ...leaveForm, category: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                  >
                    <option value="Medical / Health">Medical / Health</option>
                    <option value="Family Function">Family Event</option>
                    <option value="Urgent Domestic Work">Urgent Domestic Work</option>
                    <option value="Out of Station">Out of Station Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Absence</label>
                  <textarea
                    rows={3}
                    required
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Brief explanation for class teacher..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600 resize-none"
                  ></textarea>
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full" disabled={leaveSubmitting}>
                  <Send className="w-4 h-4 mr-1.5" />
                  <span>{leaveSubmitting ? 'Submitting...' : 'Submit Leave Request'}</span>
                </Button>
              </form>
            </Card>
          </div>

          {/* Right History (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Sanctioned Leave History
              </h3>

              {leaveRequests.length > 0 ? (
                <div className="space-y-3">
                  {leaveRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{req.reason}</span>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Duration: <span className="font-semibold text-slate-700">{req.fromDate}</span> to{' '}
                            <span className="font-semibold text-slate-700">{req.toDate}</span> ({req.days} Day{req.days > 1 ? 's' : ''})
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                            req.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span>Applied on {req.appliedOn}</span>
                        <span>{req.approvedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No leaves recorded"
                  message="No past leave requests submitted for this academic term."
                />
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
