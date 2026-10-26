import mongoose from 'mongoose';

const admissionNoteSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const admissionSchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      required: [true, 'Enquiry number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    parentName: {
      type: String,
      required: [true, 'Parent/Guardian name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
      match: [/^[0-9+ -]{10,15}$/, 'Please enter a valid phone number (at least 10 digits)'],
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    gradeApplying: {
      type: String,
      required: [true, 'Grade applying for is required'],
      enum: {
        values: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
        message: '{VALUE} is not a valid grade for N.D.R.N. Vidyalaya',
      },
      index: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'documents_pending', 'admitted', 'rejected', 'cancelled'],
      default: 'new',
      index: true,
    },
    notes: {
      type: [admissionNoteSchema],
      default: [],
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

admissionSchema.index({ status: 1, createdAt: -1 });

export const Admission = mongoose.model('Admission', admissionSchema);
