import mongoose from 'mongoose';

const periodSchema = new mongoose.Schema(
  {
    periodNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (e.g. 09:00 AM)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (e.g. 09:45 AM)'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    room: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class reference is required'],
      index: true,
    },
    dayOfWeek: {
      type: String,
      required: [true, 'Day of week is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      index: true,
    },
    periods: {
      type: [periodSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// One timetable record per class per day
timetableSchema.index({ class: 1, dayOfWeek: 1 }, { unique: true });

export const Timetable = mongoose.model('Timetable', timetableSchema);
