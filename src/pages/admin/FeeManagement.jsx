import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Plus,
  Printer,
  Receipt,
  FileSpreadsheet,
  Filter,
  Phone,
  Send,
  X
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { useSchoolSettings } from '../../context/SchoolSettingsContext';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import SchoolLogo from '../../components/common/SchoolLogo';

export default function AdminFeeManagement() {
  const { settings } = useSchoolSettings();
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [receiptModal, setReceiptModal] = useState(null);
  const [sentAlert, setSentAlert] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    term: 'Term II (2026-27)',
    amount: 3200,
    paymentMode: 'Cash / Office Desk',
    receivedBy: 'Administrative Cashier Desk',
    notes: 'Quarterly tuition fee',
  });

  const loadData = () => {
    setStudents(DataService.getStudents());
    setFees(DataService.getFees());
  };

  useEffect(() => {
    loadData();
  }, []);

  const overdueList = students.filter((s) => s.feeStatus === 'Due');
  const paidList = students.filter((s) => s.feeStatus === 'Paid');

  const totalCollected = paidList.length * 3200;
  const totalPending = overdueList.reduce((acc, s) => acc + (s.pendingFeeAmount || 3200), 0);

  const filtered = students.filter((s) => {
    const matchStatus = statusFilter === 'All' || s.feeStatus === statusFilter;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.grade.toLowerCase().includes(q) ||
      (s.parentName && s.parentName.toLowerCase().includes(q));

    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedStudents = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenRecordModal = (student) => {
    setPaymentForm({
      studentId: student ? student.id : students[0]?.id || '',
      term: 'Term II (2026-27)',
      amount: student?.pendingFeeAmount || 3200,
      paymentMode: 'Cash / Office Desk',
      receivedBy: 'Accounts Desk',
      notes: 'Term II Primary Tuition Fee',
    });
    setRecordModalOpen(true);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const student = students.find((s) => s.id === paymentForm.studentId);
    if (!student) return;

    const newFee = DataService.recordFeePayment({
      studentId: student.id,
      studentName: student.name,
      grade: `${student.grade}-${student.section || 'A'}`,
      term: paymentForm.term,
      amount: Number(paymentForm.amount),
      paymentMode: paymentForm.paymentMode,
      receivedBy: paymentForm.receivedBy,
    });

    loadData();
    setRecordModalOpen(false);
    setReceiptModal(newFee);
  };

  const handleSendReminder = (student) => {
    setSentAlert(`Digital payment reminder dispatched via SMS to ${student.parentPhone} (${student.parentName}).`);
    setTimeout(() => setSentAlert(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            FINANCE & REVENUE • RECONCILIATION
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Fee Collection Desk & Dues Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record tuition collections, issue printable receipts, and review pending balances for Daulatyarpur campus.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => handleOpenRecordModal(null)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Record Fee Payment
        </Button>
      </div>

      {/* Fee Desk Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <span className="px-4 py-2 font-bold text-sm text-school-700 border-b-2 border-school-600 bg-white rounded-t-lg">
          Student Dues & Collections
        </span>
        <Link
          to="/admin/fee-structure"
          className="px-4 py-2 font-medium text-sm text-slate-600 hover:text-school-700 hover:bg-slate-100 rounded-t-lg transition-colors flex items-center gap-2"
        >
          <Receipt className="w-4 h-4 text-slate-400" />
          <span>Public Fee Structure Schedule</span>
        </Link>
      </div>

      {/* Reminder Alert Banner */}
      {sentAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{sentAlert}</span>
          </div>
          <button type="button" onClick={() => setSentAlert(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Collected (Term II)
          </span>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            {paidList.length} Students cleared
          </div>
        </Card>

        <Card className="p-5 bg-white border-l-4 border-l-rose-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Pending Dues
          </span>
          <div className="text-2xl font-black text-rose-600">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {overdueList.length} Outstanding accounts
          </div>
        </Card>

        <Card className="p-5 bg-white border-l-4 border-l-school-700">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Primary Term Fee Rate
          </span>
          <div className="text-2xl font-black text-slate-900">₹3,200</div>
          <div className="text-xs text-slate-500 mt-1">Per quarter tuition standard</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search student or parent..."
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-600"
            >
              <option value="All">All Fee Statuses</option>
              <option value="Paid">Paid Only</option>
              <option value="Due">Due / Overdue Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Students Fee Roster Table */}
      <Card className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-6">Student Information</th>
                <th className="p-3.5">Class / Sec</th>
                <th className="p-3.5">Guardian Phone</th>
                <th className="p-3.5">Fee Status</th>
                <th className="p-3.5">Balance Due</th>
                <th className="p-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No fee records matching search criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-6">
                      <div className="font-extrabold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {s.id}</div>
                    </td>

                    <td className="p-3.5 font-bold text-slate-800">
                      {s.grade}-{s.section || 'A'}
                    </td>

                    <td className="p-3.5 text-slate-600">
                      <div>{s.parentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.parentPhone}</div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.feeStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {s.feeStatus === 'Paid' ? 'Paid' : 'Due'}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold">
                      {s.feeStatus === 'Paid' ? (
                        <span className="text-emerald-700">₹0 (Cleared)</span>
                      ) : (
                        <span className="text-rose-600">₹{(s.pendingFeeAmount || 3200).toLocaleString('en-IN')}</span>
                      )}
                    </td>

                    <td className="p-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.feeStatus === 'Due' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenRecordModal(s)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-school-700 text-white hover:bg-school-800 transition-colors"
                            >
                              Collect Fee
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendReminder(s)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-slate-100"
                              title="Send SMS Reminder"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const existingFee = fees.find((f) => f.studentId === s.id) || {
                                receiptNo: `REC-2026-Q2-${s.rollNo || '101'}`,
                                studentName: s.name,
                                studentId: s.id,
                                grade: `${s.grade}-${s.section || 'A'}`,
                                term: 'Term II (2026-27)',
                                amount: 3200,
                                paidDate: '2026-10-12',
                                paymentMode: 'Cash / Bank Transfer',
                                receivedBy: 'Accounts Secretariat',
                              };
                              setReceiptModal(existingFee);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-school-700 hover:bg-slate-100 border border-slate-200"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-white border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* Record Fee Payment Modal */}
      <Modal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        title="Record Fee Collection"
        subtitle="Daulatyarpur, Madhoganj Campus • Primary Term II"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRecordModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <Button type="submit" form="payment-form" variant="primary" size="sm">
              Generate Receipt & Record
            </Button>
          </>
        }
      >
        <form id="payment-form" onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Student *</label>
            <select
              required
              value={paymentForm.studentId}
              onChange={(e) => {
                const std = students.find((s) => s.id === e.target.value);
                setPaymentForm({
                  ...paymentForm,
                  studentId: e.target.value,
                  amount: std?.pendingFeeAmount || 3200,
                });
              }}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grade}-{s.section || 'A'}) - Status: {s.feeStatus}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fee Term *</label>
              <input
                type="text"
                required
                value={paymentForm.term}
                onChange={(e) => setPaymentForm({ ...paymentForm, term: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Mode *</label>
              <select
                value={paymentForm.paymentMode}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              >
                <option value="Cash / Office Desk">Cash / Office Desk</option>
                <option value="UPI (PhonePe / GooglePay)">UPI (PhonePe / GooglePay)</option>
                <option value="Net Banking / NEFT">Net Banking / NEFT</option>
                <option value="Cheque / DD">Cheque / Demand Draft</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Received By</label>
              <input
                type="text"
                value={paymentForm.receivedBy}
                onChange={(e) => setPaymentForm({ ...paymentForm, receivedBy: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Official Receipt Modal */}
      {receiptModal && (
        <Modal
          isOpen={!!receiptModal}
          onClose={() => setReceiptModal(null)}
          title="Official Fee Receipt"
          maxWidth="max-w-lg"
          footer={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Receipt
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setReceiptModal(null)}
              >
                Done
              </Button>
            </div>
          }
        >
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs font-sans">
            {/* Receipt Header */}
            <div className="text-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900 uppercase">
                {settings.schoolName || 'N.D.R.N. Vidyalaya'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {settings.village}, {settings.postOffice}, {settings.district} (U.P.)
              </p>
              <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-school-900 text-gold-300 text-[10px] font-bold">
                TUITION FEE RECEIPT • SESSION {settings.academicSession || '2026-27'}
              </div>
            </div>

            {/* Receipt Meta */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-slate-200">
              <div>
                <span className="text-slate-400 block">Receipt Number:</span>
                <strong className="text-slate-900 font-mono">{receiptModal.receiptNo}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Date of Payment:</span>
                <strong className="text-slate-900">{receiptModal.paidDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Student Name:</span>
                <strong className="text-slate-900">{receiptModal.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Class:</span>
                <strong className="text-slate-900">{receiptModal.grade}</strong>
              </div>
            </div>

            {/* Amount line */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-800">{receiptModal.term} Tuition Fee</span>
              <span className="text-base font-black text-slate-900">₹{receiptModal.amount?.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Mode: <strong className="text-slate-800">{receiptModal.paymentMode}</strong></span>
              <span>Authorized: <strong className="text-slate-800">{receiptModal.receivedBy}</strong></span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
