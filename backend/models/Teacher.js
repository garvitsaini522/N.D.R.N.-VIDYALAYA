import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Teacher name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      default: 'Primary Educator',
    },
    wing: {
      type: String,
      enum: ['Pre-Primary', 'Primary', 'Activities', 'Administration'],
      default: 'Primary',
      index: true,
    },
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    primarySubjects: {
      type: [String],
      default: [],
    },
    qualification: {
      type: String,
      trim: true,
    },
    experienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'on_leave', 'resigned'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Teacher = mongoose.model('Teacher', teacherSchema);
