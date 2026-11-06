import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    studentName: {
      type: String,
      trim: true,
    },
    submissionNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'resubmit_required'],
      default: 'submitted',
    },
    feedback: {
      type: String,
      trim: true,
    },
    grade: {
      type: String,
      trim: true,
    },
  },
  { _id: true, timestamps: true }
);

const homeworkSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Homework title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Homework instructions are required'],
      trim: true,
    },
    assignedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Assigning teacher is required'],
    },
    attachments: [
      {
        title: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },
    submissions: {
      type: [submissionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

homeworkSchema.index({ class: 1, dueDate: 1 });

export const Homework = mongoose.model('Homework', homeworkSchema);
