import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema(
  {
    classGrade: {
      type: String,
      required: [true, 'Class / Grade is required'],
      trim: true,
      index: true,
    },
    academicSession: {
      type: String,
      required: [true, 'Academic session is required'],
      default: '2026-27',
      trim: true,
      index: true,
    },
    admissionFee: {
      type: Number,
      required: [true, 'Admission fee is required'],
      min: [0, 'Admission fee cannot be negative'],
      default: 0,
    },
    monthlyTuitionFee: {
      type: Number,
      required: [true, 'Monthly tuition fee is required'],
      min: [0, 'Monthly tuition fee cannot be negative'],
      default: 0,
    },
    annualCharges: {
      type: Number,
      required: [true, 'Annual charges are required'],
      min: [0, 'Annual charges cannot be negative'],
      default: 0,
    },
    otherCharges: {
      type: Number,
      default: 0,
      min: [0, 'Other charges cannot be negative'],
    },
    busFee: {
      type: Number,
      default: 0,
      min: [0, 'Bus fee cannot be negative'],
    },
    totalEstimatedAnnualFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      default: 'Indicative fee schedule. Subject to official administration confirmation.',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate total estimated annual fee accurately
feeStructureSchema.pre('save', function (next) {
  this.totalEstimatedAnnualFee =
    Number(this.admissionFee || 0) +
    Number(this.monthlyTuitionFee || 0) * 12 +
    Number(this.annualCharges || 0) +
    Number(this.otherCharges || 0);
  next();
});

feeStructureSchema.index({ classGrade: 1, academicSession: 1 });
feeStructureSchema.index({ isPublished: 1, sortOrder: 1 });

export const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
