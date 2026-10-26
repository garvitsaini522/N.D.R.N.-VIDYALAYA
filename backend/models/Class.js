import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      enum: {
        values: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
        message: '{VALUE} is not a valid class for N.D.R.N. Vidyalaya',
      },
      index: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      default: 'A',
      uppercase: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '2026-2027',
      index: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    capacity: {
      type: Number,
      default: 35,
      min: 1,
      max: 60,
    },
    subjects: {
      type: [String],
      default: ['Hindi', 'English', 'Mathematics', 'Environmental Studies', 'Arts & Craft', 'Physical Play'],
    },
    roomNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: cannot have duplicate section for the same class in an academic year
classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

export const Class = mongoose.model('Class', classSchema);
