import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '2026-2027',
      index: true,
    },
    feeType: {
      type: String,
      required: [true, 'Fee type is required'],
      enum: ['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Activity Fee', 'Transport Fee', 'Miscellaneous'],
      default: 'Tuition Fee',
      index: true,
    },
    month: {
      type: String,
      enum: [
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
        'January',
        'February',
        'March',
        'Term 1',
        'Term 2',
        'Annual',
      ],
      default: 'April',
    },
    amount: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'overdue'],
      default: 'pending',
      index: true,
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online'],
      default: 'Cash',
    },
    transactionId: {
      type: String,
      trim: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    receiptGeneratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

feeSchema.index({ student: 1, academicYear: 1, status: 1 });

export const Fee = mongoose.model('Fee', feeSchema);
