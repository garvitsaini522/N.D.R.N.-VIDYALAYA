import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class reference is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true,
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: ['present', 'absent', 'late', 'half_day', 'holiday'],
        message: '{VALUE} is not a valid attendance status',
      },
      default: 'present',
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// One attendance record per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
// Fast query for class attendance on a given day
attendanceSchema.index({ class: 1, date: 1, status: 1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
