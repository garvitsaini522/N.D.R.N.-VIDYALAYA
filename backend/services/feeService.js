import { Fee } from '../models/Fee.js';
import { ApiError } from '../utils/apiError.js';

export class FeeService {
  /**
   * Generate sequential receipt number
   */
  static async generateReceiptNumber() {
    const year = new Date().getFullYear();
    const count = await Fee.countDocuments({ status: 'paid' });
    const seq = String(count + 1).padStart(5, '0');
    return `REC-${year}-${seq}`;
  }

  /**
   * Record fee payment
   */
  static async recordPayment(feeId, { paidAmount, paymentMethod, transactionId, remarks }, staffId) {
    const fee = await Fee.findById(feeId);
    if (!fee) {
      throw ApiError.notFound(`Fee invoice with ID '${feeId}' not found`);
    }

    const newPaidAmount = (fee.paidAmount || 0) + Number(paidAmount);
    fee.paidAmount = newPaidAmount;
    fee.paymentMethod = paymentMethod;
    fee.paymentDate = new Date();
    fee.transactionId = transactionId || fee.transactionId;
    fee.receiptGeneratedBy = staffId;
    if (remarks) fee.remarks = remarks;

    if (newPaidAmount >= fee.amount) {
      fee.status = 'paid';
      if (!fee.receiptNumber) {
        fee.receiptNumber = await this.generateReceiptNumber();
      }
    } else {
      fee.status = 'partially_paid';
    }

    await fee.save();
    return fee;
  }

  /**
   * Get student fee ledger
   */
  static async getStudentLedger(studentId) {
    const fees = await Fee.find({ student: studentId }).sort({ dueDate: 1 });

    const totalBilled = fees.reduce((acc, f) => acc + (f.amount || 0), 0);
    const totalPaid = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const outstanding = totalBilled - totalPaid;

    return {
      studentId,
      summary: {
        totalBilled,
        totalPaid,
        outstanding: outstanding > 0 ? outstanding : 0,
        invoicesCount: fees.length,
      },
      invoices: fees,
    };
  }
}
