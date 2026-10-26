import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  Receipt,
  ShieldCheck,
  Building,
  Info,
  X,
  Printer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import SchoolLogo from '../../components/common/SchoolLogo';

export default function StudentFees() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [viewReceipt, setViewReceipt] = useState(null);

  useEffect(() => {
    if (user?.id) {
      const studentLedger = DataService.getStudentFeeLedger(user.id);
      setLedger(studentLedger);
      setTransactions(studentLedger?.transactions || []);
    } else {
      const allTx = DataService.getFees();
      setTransactions(allTx);
      setLedger(null);
    }
  }, [user]);

  const totalPaid = transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const pendingAmount = user?.pendingFeeAmount || 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            FINANCIAL PORTAL • SECURE FEE DESK
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fee Management & Digital Receipts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tuition fee payment ledger and official institutional receipts for {user?.name || 'Student'}.
          </p>
        </div>

        <Button
          type="button"
          variant="portal"
          size="md"
          onClick={() => setShowPayModal(true)}
          leftIcon={<CreditCard className="w-4 h-4" />}
        >
          Fee Payment Desk Information
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="p-5 bg-white border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Total Amount Paid</span>
          <div className="text-2xl font-extrabold text-emerald-600">
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {transactions.length} verified payment receipt{transactions.length === 1 ? '' : 's'}
          </p>
        </Card>

        <Card className="p-5 bg-white border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Current Balance Due</span>
          <div className="text-2xl font-extrabold text-amber-600">
            ₹{Number(pendingAmount).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Status: {user?.feeStatus || 'Up-to-Date'}
          </p>
        </Card>

        <Card className="p-5 bg-white border-l-4 border-l-school-700">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Enrolled Grade</span>
          <div className="text-2xl font-extrabold text-slate-900">
            {user?.grade || 'Primary Wing'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Session 2026-27 • Section {user?.section || 'A'}
          </p>
        </Card>
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Payment Receipts & Transaction Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Authorized acknowledgments for income tax rebate & verification</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Receipt className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">No fee transaction records available yet.</p>
            <p className="mt-1 max-w-md mx-auto text-slate-500">
              Payment receipts issued by the school administration desk will appear here automatically upon confirmation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3.5 px-6">Receipt Number</th>
                  <th className="py-3.5 px-4">Term / Quarter</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Official Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.map((tx) => (
                  <tr key={tx.receiptNo || tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-school-700">
                      {tx.receiptNo || tx.id}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">{tx.quarter || tx.term || 'Tuition Fee'}</td>
                    <td className="py-4 px-4 font-bold text-slate-900 font-mono">
                      ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-slate-500">{tx.paidDate || tx.date || '—'}</td>
                    <td className="py-4 px-4 text-slate-600">{tx.mode || tx.paymentMode || 'Cash'}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{tx.status || 'Paid'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setViewReceipt(tx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-school-50 hover:bg-school-100 text-school-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Information Modal */}
      {showPayModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowPayModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPayModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-school-50 text-school-700 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Accounts & Cashier Desk</h3>
                <p className="text-xs text-slate-500">N.D.R.N. Vidyalaya • Daulatyarpur</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Direct Counter Clearance</p>
                  <p className="mt-1">
                    Tuition and examination fees are accepted directly at the school office cash counter during official visiting hours (Monday – Saturday: 8:00 AM – 2:00 PM).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Campus Location:</span>
                <span className="font-bold text-slate-900">Daulatyarpur, Madhoganj</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Accepted Modes:</span>
                <span className="font-bold text-slate-900">Cash / Demand Draft / Bank Transfer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Official Receipt:</span>
                <span className="font-bold text-emerald-700">Issued immediately on payment</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setShowPayModal(false)}
              >
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {viewReceipt && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setViewReceipt(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl relative border border-slate-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setViewReceipt(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-5 border-b border-slate-200">
              <div className="flex justify-center mb-2">
                <SchoolLogo size="sm" showSubtitle={false} />
              </div>
              <h2 className="text-lg font-black text-slate-900 uppercase">N.D.R.N. Vidyalaya</h2>
              <p className="text-[11px] text-slate-500">Daulatyarpur, Madhoganj, Uttar Pradesh</p>
              <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-school-900 text-gold-300 text-[10px] font-bold uppercase tracking-wider">
                Official Tuition Fee Receipt
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-100 bg-slate-50 p-3 rounded-xl mt-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Receipt Number</span>
                <span className="font-bold text-slate-900 font-mono">{viewReceipt.receiptNo || viewReceipt.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Payment</span>
                <span className="font-bold text-slate-900">{viewReceipt.paidDate || viewReceipt.date || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                <span className="font-bold text-slate-900">{viewReceipt.studentName || user?.name || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Mode</span>
                <span className="font-bold text-slate-900">{viewReceipt.mode || viewReceipt.paymentMode || 'Cash'}</span>
              </div>
            </div>

            <div className="my-5 p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-center text-sm font-bold">
              <span>Amount Received:</span>
              <span className="text-lg text-emerald-700 font-mono font-black">
                ₹{Number(viewReceipt.amount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
