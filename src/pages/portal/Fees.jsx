import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  Receipt,
  ShieldCheck,
  QrCode,
  ArrowRight,
  X,
  Printer,
  Users,
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

export default function Fees() {
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
  const [feeLedger, setFeeLedger] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paySuccess, setPaySuccess] = useState(null);
  const [viewReceipt, setViewReceipt] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFees() {
      if (!currentStudent) return;
      setLoading(true);
      setError(null);

      try {
        const studentId = currentStudent.id || currentStudent.admissionNo || activeWardId;
        const res = await portalApi.getFees(studentId);

        if (isMounted) {
          setFeeLedger(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load fee ledger.');
          setLoading(false);
        }
      }
    }

    loadFees();

    return () => {
      isMounted = false;
    };
  }, [currentStudent, activeWardId]);

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const newTx = await portalApi.payFee({
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        grade: currentStudent.grade,
        term: 'Term II (2026-27)',
        amount: 3200,
        paymentMode:
          payMethod === 'upi'
            ? 'Online UPI (Direct)'
            : payMethod === 'card'
            ? 'Debit Card'
            : 'Net Banking (SBI / HDFC)',
      });

      // Refresh ledger
      const res = await portalApi.getFees(currentStudent.id);
      setFeeLedger(res.data);

      setIsProcessing(false);
      setPaySuccess(newTx.data);
    } catch {
      alert('Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to school fee ledger..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const summary = feeLedger?.summary || {
    totalBilled: 9600,
    totalPaid: 9600,
    outstanding: 0,
    nextDueDate: '10 Dec 2026',
    status: 'Paid',
  };

  const invoices = feeLedger?.invoices || [];
  const receipts = feeLedger?.receipts || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            FINANCIAL DESK • TUITION & DUES
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fee Ledger & Receipts: {currentStudent?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Session 2026-27 • {currentStudent?.grade} • Daulatyarpur Campus • Official payment receipts.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => {
            setPaySuccess(null);
            setShowPayModal(true);
          }}
          leftIcon={<CreditCard className="w-4 h-4" />}
        >
          Pay Upcoming Installment
        </Button>
      </div>

      {/* Multi-Child Switcher for Parent */}
      {hasMultipleChildren && (
        <div className="bg-white rounded-2xl p-4 border border-school-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-school-600" />
            <span>Viewing Fee Ledger For:</span>
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

      {/* 3 Fee Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border-l-4 border-l-school-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Annual Session Billed
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{summary.totalBilled?.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">4 Quarters Tuition + Development Fee</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Paid to Date
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            ₹{summary.totalPaid?.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Verified with receipts</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Outstanding Due
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{summary.outstanding?.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.outstanding === 0 ? 'All dues up to date' : `Next due by ${summary.nextDueDate}`}
          </p>
        </Card>
      </div>

      {/* Installments Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Academic Year Installment Schedule (2026-27)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Class {currentStudent?.grade} Primary Wing Fee Schedule • Daulatyarpur Campus
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Installment</th>
                <th className="py-3 px-4 text-center">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Payment Details</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{inv.quarter}</td>
                  <td className="py-3.5 px-4 text-center font-bold">₹{inv.amount}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : null}
                      <span>{inv.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {inv.status === 'Paid'
                      ? `Paid on ${inv.paidDate} via ${inv.paymentMode}`
                      : `Due on ${inv.dueDate}`}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {inv.status === 'Paid' ? (
                      <button
                        type="button"
                        onClick={() => setViewReceipt(inv)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-school-700 hover:text-school-900 hover:underline"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPaySuccess(null);
                          setShowPayModal(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-school-700 text-white font-bold hover:bg-school-800 text-[11px]"
                      >
                        Pay Online
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Protection Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Fee records are protected accounting transactions generated by the school administration desk.
          </span>
        </div>
      </Card>

      {/* Online Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Online Fee Payment</h3>
            <p className="text-xs text-slate-500 mb-4">
              N.D.R.N. Vidyalaya • Child: <span className="font-bold text-slate-700">{currentStudent?.name}</span> ({currentStudent?.grade})
            </p>

            {paySuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <div className="text-sm font-bold text-emerald-900">Payment Successfully Received!</div>
                <p className="text-xs text-emerald-700">
                  Receipt #{paySuccess.receiptNo} has been generated for ₹{paySuccess.amount}.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setViewReceipt(paySuccess);
                      setShowPayModal(false);
                    }}
                  >
                    View Official Receipt
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSimulatePayment} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Installment Amount</span>
                  <span className="text-lg font-black text-slate-900">₹3,200</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Payment Method</label>
                  <div className="space-y-2">
                    {[
                      { id: 'upi', label: 'UPI / QR Code (Google Pay / PhonePe / Paytm)' },
                      { id: 'card', label: 'Debit / ATM Card' },
                      { id: 'netbanking', label: 'Net Banking (SBI / HDFC / PNB)' },
                    ].map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          payMethod === m.id
                            ? 'border-school-600 bg-school-50/50 text-school-900 font-bold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payMethod"
                          checked={payMethod === m.id}
                          onChange={() => setPayMethod(m.id)}
                          className="accent-school-600"
                        />
                        <span>{m.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="sm" disabled={isProcessing}>
                    {isProcessing ? 'Processing Transaction...' : 'Confirm & Pay ₹3,200'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Official Receipt Modal (Print-Ready) */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-school-700 uppercase tracking-wider">
                Official Tuition Fee Receipt
              </span>
              <button
                type="button"
                onClick={() => setViewReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Fee Receipt */}
            <div className="py-6 border-2 border-slate-200 rounded-2xl p-6 mt-4 bg-slate-50/40">
              <div className="text-center pb-4 border-b border-slate-200">
                <SchoolLogo size="sm" className="justify-center mb-1" />
                <h4 className="text-base font-black text-slate-900">N.D.R.N. VIDYALAYA</h4>
                <p className="text-[11px] text-slate-600">
                  Daulatyarpur, Madhoganj, Uttar Pradesh • Pin: 241302
                </p>
                <div className="mt-2 text-xs font-bold text-school-800">
                  Receipt No: <span className="font-mono">{viewReceipt.receiptNo || 'REC-2026-Q2-0891'}</span>
                </div>
              </div>

              <div className="space-y-2 py-4 text-xs border-b border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-900">{currentStudent?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Admission No:</span>
                  <span className="font-bold text-slate-900">{currentStudent?.admissionNo || currentStudent?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class & Section:</span>
                  <span className="font-bold text-slate-900">{currentStudent?.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Date:</span>
                  <span className="font-bold text-slate-900">{viewReceipt.paidDate || '12 Oct 2026'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-bold text-slate-900">{viewReceipt.paymentMode || 'Online'}</span>
                </div>
              </div>

              <div className="py-4 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-700">Total Amount Paid:</span>
                <span className="text-lg font-black text-emerald-700">₹{viewReceipt.amount || 3200}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                <span>Received by: Administrative Accounts Desk</span>
                <span>Daulatyarpur Seal</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setViewReceipt(null)}>
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
