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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [form, setForm] = useState({
    reason: '',
    category: 'Medical / Health',
    fromDate: '',
    toDate: '',
  });
  const [submittedMessage, setSubmittedMessage] = useState(false);

  useEffect(() => {
    setLeaveRequests(DataService.getLeaveRequests());
    if (user?.id) {
      setAttendanceRecords(DataService.getAttendanceRecords(user.id));
    } else {
      setAttendanceRecords([]);
    }
  }, [user]);

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!form.reason || !form.fromDate || !form.toDate) return;

    const d1 = new Date(form.fromDate);
    const d2 = new Date(form.toDate);
    const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);

    const newReq = DataService.addLeaveRequest({
      studentId: user?.id || 'STUDENT',
      reason: `${form.category}: ${form.reason}`,
      fromDate: form.fromDate,
      toDate: form.toDate,
      days: diffDays,
    });

    setLeaveRequests([newReq, ...leaveRequests]);
    setForm({ reason: '', category: 'Medical / Health', fromDate: '', toDate: '' });
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 5000);
  };

  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter((r) => r.status === 'Present').length;
  const absentDays = attendanceRecords.filter((r) => r.status === 'Absent').length;
  const lateDays = attendanceRecords.filter((r) => r.status === 'Late').length;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
          STUDENT RECORD • ATTENDANCE & LEAVE
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Attendance Summary & Leave Management
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor morning check-ins, monthly attendance trends, and apply for sanctioned leaves.
        </p>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 bg-white border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalDays > 0 ? `${attendanceRate}%` : '—'}</div>
          <p className="text-xs text-slate-500 mt-1">
            {totalDays > 0 ? `${presentDays} days attended` : 'No records recorded yet'}
          </p>
        </Card>

        <Card className="p-5 bg-white border-l-4 border-l-school-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Days Attended</span>
            <div className="w-8 h-8 rounded-lg bg-school-50 text-school-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{presentDays}</div>
          <p className="text-xs text-slate-500 mt-1">Out of {totalDays} recorded sessions</p>
        </Card>

        <Card className="p-5 bg-white border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Absences</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{absentDays} Days</div>
          <p className="text-xs text-slate-500 mt-1">Sanctioned and unsanctioned</p>
        </Card>

        <Card className="p-5 bg-white border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Late Arrivals</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{lateDays}</div>
          <p className="text-xs text-slate-500 mt-1">Recorded this academic session</p>
        </Card>
      </div>

      {/* Two Columns: Recent Log & Apply for Leave Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Attendance Log (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-school-600" />
            <span>Daily Attendance Register Log</span>
          </h3>
          <p className="text-xs text-slate-500 mb-5">Classroom roll call & gate attendance records</p>

          {attendanceRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CalendarCheck2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No attendance entries recorded yet.</p>
              <p className="mt-1">Daily records will appear here as roll calls are marked by the faculty.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {attendanceRecords.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-semibold text-slate-800">{log.date}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'Late'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status === 'Present' && <CheckCircle2 className="w-3 h-3" />}
                          {log.status === 'Absent' && <XCircle className="w-3 h-3" />}
                          {log.status === 'Late' && <Clock className="w-3 h-3" />}
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-500">{log.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Apply for Leave Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-school-600" />
            <span>Apply for Student Leave</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">Submit advance leave sanction request to class teacher</p>

          {submittedMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Leave request submitted successfully for administrative review.</span>
            </div>
          )}

          <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Leave Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-semibold"
              >
                <option value="Medical / Health">Medical / Health</option>
                <option value="Family Function">Family Event / Function</option>
                <option value="Urgent Domestic Work">Urgent Domestic Work</option>
                <option value="Religious Observance">Religious Observance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">From Date</label>
                <input
                  type="date"
                  required
                  value={form.fromDate}
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">To Date</label>
                <input
                  type="date"
                  required
                  value={form.toDate}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason / Explanation</label>
              <textarea
                required
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="State the reason clearly for school records..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full" leftIcon={<Send className="w-4 h-4" />}>
              Submit Leave Request
            </Button>
          </form>

          {/* Past Leave Requests */}
          {leaveRequests.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Submitted Applications ({leaveRequests.length})
              </h4>
              <div className="space-y-2">
                {leaveRequests.map((req) => (
                  <div key={req.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">{req.fromDate} to {req.toDate}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{req.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
