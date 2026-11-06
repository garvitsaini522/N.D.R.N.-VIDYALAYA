import mongoose from 'mongoose';
import crypto from 'crypto';
import { Fee } from '../models/Fee.js';
import { Student } from '../models/Student.js';
import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.js';

export class FeeService {
  /**
   * Generate sequential, unique official receipt number
   */
  static async generateReceiptNumber() {
    const year = new Date().getFullYear();
    const count = await Fee.countDocuments({
      status: { $in: ['paid', 'partially_paid'] },
      receiptNumber: { $exists: true, $ne: null },
    });
    const seq = String(count + 1).padStart(5, '0');
    let candidate = `REC-${year}-${seq}`;

    // Ensure uniqueness in case of concurrent creations or deleted records
    const exists = await Fee.findOne({ receiptNumber: candidate });
    if (exists) {
      const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
      candidate = `REC-${year}-${seq}-${suffix}`;
    }

    return candidate;
  }

  /**
   * Get payment gateway availability and offline counter instructions
   */
  static getGatewayStatus() {
    return {
      onlinePaymentsEnabled: Boolean(config.paymentGateway?.enabled),
      provider: config.paymentGateway?.provider || null,
      offlineInstructions: {
        campusDesk: 'Daulatyarpur Campus Accounts Counter, Madhoganj',
        timings: 'Monday to Saturday, 8:30 AM to 2:00 PM',
        acceptedModes: ['Cash', 'Cheque', 'Demand Draft', 'Direct NEFT/RTGS Transfer'],
        schoolAccountName: 'N.D.R.N. VIDYALAYA',
        bankName: 'State Bank of India',
        branch: 'Madhoganj (Hardoi)',
        accountNumber: 'Available at Accounts Counter',
        ifscCode: 'SBIN0001234',
        contactPhone: '+91 99368 47120',
        notice: 'Official receipts are generated in-person upon verified fee clearance.',
      },
    };
  }

  /**
   * Record fee payment against an existing invoice (Admin/Staff only)
   */
  static async recordPayment(feeId, { paidAmount, paymentMethod, transactionId, remarks }, staffId) {
    const fee = await Fee.findById(feeId);
    if (!fee) {
      throw ApiError.notFound(`Fee invoice with ID '${feeId}' not found`);
    }

    if (fee.status === 'paid') {
      throw ApiError.badRequest('Fee invoice is already fully paid and settled.');
    }

    const numPaid = Number(paidAmount);
    if (isNaN(numPaid) || numPaid <= 0) {
      throw ApiError.badRequest('Payment amount must be a positive number greater than zero.');
    }

    const currentPaid = Number(fee.paidAmount) || 0;
    const remainingBalance = Math.max(0, fee.amount - currentPaid);

    if (numPaid > remainingBalance) {
      throw ApiError.badRequest(
        `Payment amount of ₹${numPaid} exceeds the outstanding balance of ₹${remainingBalance}. Overpayment is not permitted.`
      );
    }

    // Duplicate transaction check if a transaction reference is provided
    if (transactionId && typeof transactionId === 'string' && transactionId.trim()) {
      const cleanTxnId = transactionId.trim();
      const existingTxn = await Fee.findOne({
        _id: { $ne: fee._id },
        transactionId: cleanTxnId,
      });
      if (existingTxn) {
        throw ApiError.conflict(
          `Transaction reference '${cleanTxnId}' has already been processed for receipt '${existingTxn.receiptNumber || existingTxn._id}'.`
        );
      }
      fee.transactionId = cleanTxnId;
    }

    const newPaidAmount = currentPaid + numPaid;
    fee.paidAmount = newPaidAmount;
    fee.paymentMethod = paymentMethod || fee.paymentMethod || 'Cash';
    fee.paymentDate = new Date();
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
   * Record an offline counter fee transaction (Admin/Staff desk collection)
   */
  static async recordOfflinePayment(
    { studentId, feeType, term, month, academicYear, amount, paidAmount, paymentMethod, transactionId, remarks },
    staffId
  ) {
    let targetStudentId = studentId;
    if (!mongoose.Types.ObjectId.isValid(targetStudentId)) {
      const student = await Student.findOne({ admissionNumber: String(targetStudentId).toUpperCase() });
      if (!student) {
        throw ApiError.notFound(`Student with identifier '${targetStudentId}' not found.`);
      }
      targetStudentId = student._id;
    } else {
      const studentExists = await Student.exists({ _id: targetStudentId });
      if (!studentExists) {
        throw ApiError.notFound(`Student with ID '${targetStudentId}' not found.`);
      }
    }

    const numAmount = Number(amount);
    const numPaid = Number(paidAmount);

    if (isNaN(numAmount) || numAmount <= 0) {
      throw ApiError.badRequest('Fee invoice amount must be a positive number greater than zero.');
    }
    if (isNaN(numPaid) || numPaid <= 0) {
      throw ApiError.badRequest('Paid amount must be a positive number greater than zero.');
    }
    if (numPaid > numAmount) {
      throw ApiError.badRequest('Paid amount cannot exceed total fee amount.');
    }

    if (transactionId && typeof transactionId === 'string' && transactionId.trim()) {
      const cleanTxnId = transactionId.trim();
      const existingTxn = await Fee.findOne({ transactionId: cleanTxnId });
      if (existingTxn) {
        throw ApiError.conflict(
          `Transaction reference '${cleanTxnId}' has already been processed for receipt '${existingTxn.receiptNumber || existingTxn._id}'.`
        );
      }
    }

    const isFullyPaid = numPaid >= numAmount;
    const receiptNumber = isFullyPaid ? await this.generateReceiptNumber() : undefined;

    const feeDoc = await Fee.create({
      student: targetStudentId,
      feeType: feeType || 'Tuition Fee',
      academicYear: academicYear || '2026-2027',
      month: month || 'Term 1',
      term: term || month || 'Quarterly Tuition Fee',
      amount: numAmount,
      paidAmount: numPaid,
      status: isFullyPaid ? 'paid' : 'partially_paid',
      dueDate: new Date(),
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'Cash',
      transactionId: transactionId ? transactionId.trim() : undefined,
      receiptNumber,
      remarks: remarks || 'Accounts counter fee collection',
      receiptGeneratedBy: staffId,
    });

    return feeDoc;
  }

  /**
   * Initiate online payment order (Requires configured payment gateway)
   */
  static async initiateOnlinePayment({ feeId, amount }, user) {
    if (!config.paymentGateway?.enabled) {
      throw ApiError.serviceUnavailable(
        'Online fee payment is currently unavailable because the payment gateway is not configured. Please visit the Daulatyarpur Campus Accounts Counter to remit fees.'
      );
    }

    if (!feeId || !mongoose.Types.ObjectId.isValid(feeId)) {
      throw ApiError.badRequest('A valid fee invoice ID is required to initiate online payment.');
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      throw ApiError.notFound(`Fee invoice with ID '${feeId}' not found.`);
    }

    if (fee.status === 'paid') {
      throw ApiError.badRequest('This fee invoice is already fully paid.');
    }

    const remainingBalance = Math.max(0, fee.amount - (fee.paidAmount || 0));
    const requestedAmount = Number(amount) || remainingBalance;

    if (requestedAmount > remainingBalance) {
      throw ApiError.badRequest(
        `Requested payment amount of ₹${requestedAmount} exceeds remaining balance of ₹${remainingBalance}.`
      );
    }

    // In a live gateway integration, we generate the gateway order here
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    fee.gatewayOrderId = orderId;
    await fee.save();

    return {
      feeId: fee._id,
      orderId,
      amount: requestedAmount,
      currency: 'INR',
      keyId: config.paymentGateway.keyId,
      studentId: fee.student,
    };
  }

  /**
   * Verify online payment cryptographically and mark fee as paid
   */
  static async verifyOnlinePayment({ feeId, orderId, paymentId, signature }, user) {
    if (!config.paymentGateway?.enabled) {
      throw ApiError.serviceUnavailable(
        'Online fee payment is currently unavailable because the payment gateway is not configured.'
      );
    }

    if (!orderId || !paymentId || !signature) {
      throw ApiError.badRequest('Gateway orderId, paymentId, and signature are required for verification.');
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      throw ApiError.notFound('Fee invoice not found.');
    }

    if (user?.role === 'student') {
      if (!user.isLinked || !user.studentId || fee.student.toString() !== user.studentId.toString()) {
        throw ApiError.forbidden('Forbidden: You can only verify payment for your own fee invoice.');
      }
    } else if (user?.role === 'parent') {
      const allowedWards = Array.isArray(user.wardIds) ? user.wardIds.map((id) => id.toString()) : [];
      if (!user.isLinked || !allowedWards.includes(fee.student.toString())) {
        throw ApiError.forbidden('Forbidden: Parents can only verify payment for their linked children.');
      }
    }

    if (fee.status === 'paid') {
      throw ApiError.badRequest('Fee invoice has already been settled.');
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', config.paymentGateway.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw ApiError.badRequest('Invalid payment signature. Transaction verification failed.');
    }

    // Check for duplicate payment transaction
    const duplicate = await Fee.findOne({
      _id: { $ne: fee._id },
      transactionId: paymentId,
    });
    if (duplicate) {
      throw ApiError.conflict(
        `Payment transaction '${paymentId}' has already been processed for receipt '${duplicate.receiptNumber}'.`
      );
    }

    fee.paidAmount = fee.amount;
    fee.status = 'paid';
    fee.paymentDate = new Date();
    fee.paymentMethod = 'Online';
    fee.transactionId = paymentId;
    fee.gatewayOrderId = orderId;
    fee.gatewayPaymentId = paymentId;
    fee.gatewaySignature = signature;
    fee.receiptGeneratedBy = user?.id;

    if (!fee.receiptNumber) {
      fee.receiptNumber = await this.generateReceiptNumber();
    }

    await fee.save();
    return fee;
  }

  /**
   * Get student fee ledger
   */
  static async getStudentLedger(studentId) {
    let targetStudentId = studentId;
    if (studentId && !mongoose.Types.ObjectId.isValid(studentId)) {
      const studentDoc = await Student.findOne({ admissionNumber: String(studentId).toUpperCase() });
      if (studentDoc) {
        targetStudentId = studentDoc._id;
      }
    }

    const fees = await Fee.find({ student: targetStudentId }).sort({ dueDate: 1 }).lean();

    const totalBilled = fees.reduce((acc, f) => acc + (f.amount || 0), 0);
    const totalPaid = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const outstanding = Math.max(0, totalBilled - totalPaid);

    const pendingInvoices = fees.filter((f) => f.status !== 'paid');
    const nextDueDate = pendingInvoices.length > 0 && pendingInvoices[0].dueDate
      ? new Date(pendingInvoices[0].dueDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'All cleared';

    const invoices = fees.map((f) => ({
      id: f._id,
      _id: f._id,
      quarter: f.month || f.feeType || 'Tuition Fee',
      term: f.month || f.feeType || 'Tuition Fee',
      feeType: f.feeType,
      amount: f.amount,
      paidAmount: f.paidAmount || 0,
      pendingAmount: Math.max(0, (f.amount || 0) - (f.paidAmount || 0)),
      status: f.status === 'paid' ? 'Paid' : (f.status === 'partially_paid' ? 'Partially Paid' : 'Due'),
      rawStatus: f.status,
      dueDate: f.dueDate
        ? new Date(f.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'N/A',
      paidDate: f.paymentDate
        ? new Date(f.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : null,
      paymentMode: f.paymentMethod || 'Office Desk',
      receiptNo: f.receiptNumber || null,
      receiptNumber: f.receiptNumber || null,
      transactionId: f.transactionId || null,
      remarks: f.remarks || '',
    }));

    const receipts = fees
      .filter((f) => f.receiptNumber)
      .map((f) => ({
        id: f._id,
        receiptNo: f.receiptNumber,
        receiptNumber: f.receiptNumber,
        amount: f.paidAmount || f.amount,
        paidDate: f.paymentDate
          ? new Date(f.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'N/A',
        paymentMode: f.paymentMethod || 'Office Desk',
        term: f.month || f.feeType,
        transactionId: f.transactionId || '',
      }));

    return {
      studentId: targetStudentId,
      gatewayStatus: this.getGatewayStatus(),
      summary: {
        totalBilled,
        totalPaid,
        outstanding,
        invoicesCount: fees.length,
        nextDueDate,
        status: outstanding === 0 ? 'Paid' : 'Pending',
      },
      invoices,
      receipts,
    };
  }
}
