import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  Receipt,
  ShieldCheck,
  Building,
  Calendar,
  Users,
  Printer,
  X,
  Clock,
  Phone,
  Landmark,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { portalApi } from '../../services/portalApi';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import SchoolLogo from '../../components/common/SchoolLogo';

export default function Fees() {
  const { user } = useAuth();

  if (user?.role === 'teacher') {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  const {
    currentStudent,
    availableWards,
    activeWardId,
    switchWard,
    hasMultipleChildren,
  } = usePortal();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feeLedger, setFeeLedger] = useState(null);
  const [gatewayStatus, setGatewayStatus] = useState({ onlinePaymentsEnabled: false });
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payMethod, setPayMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
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
        const [ledgerRes, gwStatus] = await Promise.all([
          portalApi.getFees(studentId),
          portalApi.getPaymentGatewayStatus(),
        ]);

        if (isMounted) {
          setFeeLedger(ledgerRes.data);
          setGatewayStatus(gwStatus || { onlinePaymentsEnabled: false });
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

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!gatewayStatus.onlinePaymentsEnabled) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const res = await portalApi.payFee({
        feeId: selectedInvoice?.id || selectedInvoice?._id,
        studentId: currentStudent.id,
        amount: selectedInvoice?.pendingAmount || selectedInvoice?.amount || 3200,
        paymentMode:
          payMethod === 'upi'
            ? 'Online UPI'
            : payMethod === 'card'
            ? 'Debit Card'
            : 'Net Banking',
      });

      if (!res.success) {
        setPaymentError(res.message || 'Payment initiation failed.');
        setIsProcessing(false);
        return;
      }

      // If gateway returns order details for checkout
      setIsProcessing(false);
      setPaySuccess(res.data);
    } catch (err) {
      setPaymentError(err.message || 'Online payment processing could not be initiated.');
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
    totalBilled: 0,
    totalPaid: 0,
    outstanding: 0,
    nextDueDate: 'All cleared',
    status: 'Pending',
  };

  const invoices = feeLedger?.invoices || [];
  const receipts = feeLedger?.receipts || [];
  const offlineInfo = gatewayStatus?.offlineInstructions || {
    campusDesk: 'Daulatyarpur Campus Accounts Counter, Madhoganj',
    timings: 'Monday to Saturday, 8:30 AM to 2:00 PM',
    acceptedModes: ['Cash', 'Cheque', 'Demand Draft', 'Direct NEFT/RTGS Transfer'],
    schoolAccountName: 'N.D.R.N. VIDYALAYA',
    bankName: 'State Bank of India',
    branch: 'Madhoganj (Hardoi)',
    ifscCode: 'SBIN0001234',
    contactPhone: '+91 99368 47120',
  };

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
            Session 2026-27 • {currentStudent?.grade} • Daulatyarpur Campus • Official payment records.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => {
            setPaySuccess(null);
            setPaymentError(null);
            setSelectedInvoice(invoices.find((inv) => inv.status !== 'Paid') || invoices[0]);
            setShowPayModal(true);
          }}
          leftIcon={<CreditCard className="w-4 h-4" />}
        >
          {gatewayStatus.onlinePaymentsEnabled ? 'Pay Upcoming Installment' : 'Fee Payment & Counter Details'}
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
          <p className="text-xs text-slate-500 mt-1">Official Academic Tuition & Development Charges</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Paid to Date
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            ₹{summary.totalPaid?.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Verified with official receipts</p>
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
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Academic Year Installment Schedule (2026-27)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Class {currentStudent?.grade} • Daulatyarpur Campus • Official ledger records
            </p>
          </div>
          {!gatewayStatus.onlinePaymentsEnabled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Building className="w-3.5 h-3.5 text-amber-600" />
              <span>Campus Accounts Counter Payments Active</span>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Installment / Fee Type</th>
                <th className="py-3 px-4 text-center">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Payment Details</th>
                <th className="py-3 px-4 text-right">Receipt / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No fee installments currently billed for this academic session.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id || inv._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {inv.quarter || inv.term || inv.feeType || 'Tuition Fee'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">₹{inv.amount}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'Partially Paid'
                            ? 'bg-blue-100 text-blue-800'
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
                        : inv.status === 'Partially Paid'
                        ? `₹${inv.paidAmount} paid, balance ₹${inv.pendingAmount} due by ${inv.dueDate}`
                        : `Due on ${inv.dueDate}`}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {inv.status === 'Paid' && (inv.receiptNo || inv.receiptNumber) ? (
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
                            setPaymentError(null);
                            setSelectedInvoice(inv);
                            setShowPayModal(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-school-700 text-white font-bold hover:bg-school-800 text-[11px]"
                        >
                          {gatewayStatus.onlinePaymentsEnabled ? 'Pay Online' : 'Payment Details'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Protection Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Fee records are protected accounting transactions generated and reconciled by the school administration desk.
          </span>
        </div>
      </Card>

      {/* Payment / Counter Instructions Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-school-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {gatewayStatus.onlinePaymentsEnabled ? 'Online Fee Payment' : 'School Fee Payment Information'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              N.D.R.N. Vidyalaya • Child: <span className="font-bold text-slate-700">{currentStudent?.name}</span> ({currentStudent?.grade})
            </p>

            {/* Offline Counter Payment Instructions (When Online Gateway is not enabled) */}
            {!gatewayStatus.onlinePaymentsEnabled ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        Online Payment Gateway Not Configured
                      </h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Online electronic payments are currently unavailable on this portal. To ensure strict accounting accuracy, tuition fees are received directly through the school accounts counter or official bank transfer.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campus Counter Details */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-school-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Fee Collection Counter:</span>
                      <span className="text-slate-600">{offlineInfo.campusDesk}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-school-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Office Working Hours:</span>
                      <span className="text-slate-600">{offlineInfo.timings}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Landmark className="w-4 h-4 text-school-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Official Banking Remittance (NEFT / RTGS):</span>
                      <div className="text-slate-600 space-y-0.5 mt-1">
                        <div>Account Name: <span className="font-semibold text-slate-800">{offlineInfo.schoolAccountName}</span></div>
                        <div>Bank & Branch: <span className="font-semibold text-slate-800">{offlineInfo.bankName}, {offlineInfo.branch}</span></div>
                        <div>IFSC Code: <span className="font-mono font-bold text-slate-800">{offlineInfo.ifscCode}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-school-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Accounts Desk Support:</span>
                      <span className="text-slate-600">{offlineInfo.contactPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900">
                  <span className="font-bold">Official Note:</span> Receipts are generated in-person at the counter immediately upon payment clearance and will instantly reflect in this portal.
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="button" variant="primary" size="sm" onClick={() => setShowPayModal(false)}>
                    Understood & Close
                  </Button>
                </div>
              </div>
            ) : (
              /* Online Gateway Form (When configured) */
              <form onSubmit={handleInitiatePayment} className="space-y-4">
                {paymentError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    {selectedInvoice?.quarter || 'Upcoming Installment'}
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    ₹{selectedInvoice?.pendingAmount || selectedInvoice?.amount || 3200}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Payment Method</label>
                  <div className="space-y-2">
                    {[
                      { id: 'upi', label: 'UPI / QR Code (Google Pay / PhonePe / Paytm)' },
                      { id: 'card', label: 'Debit / ATM Card' },
                      { id: 'netbanking', label: 'Net Banking' },
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
                    {isProcessing ? 'Connecting to Payment Gateway...' : 'Proceed to Pay'}
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
                  Receipt No: <span className="font-mono">{viewReceipt.receiptNumber || viewReceipt.receiptNo}</span>
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
                  <span className="text-slate-500">Installment / Period:</span>
                  <span className="font-bold text-slate-900">{viewReceipt.quarter || viewReceipt.term || 'Tuition Fee'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Date:</span>
                  <span className="font-bold text-slate-900">{viewReceipt.paidDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-bold text-slate-900">{viewReceipt.paymentMode || 'Office Desk'}</span>
                </div>
                {viewReceipt.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reference / UTR:</span>
                    <span className="font-mono text-slate-900">{viewReceipt.transactionId}</span>
                  </div>
                )}
              </div>

              <div className="py-4 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-700">Total Amount Paid:</span>
                <span className="text-lg font-black text-emerald-700">₹{viewReceipt.paidAmount || viewReceipt.amount}</span>
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
