import mongoose from 'mongoose';

const subjectItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    desc: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
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
    stage: {
      type: String,
      trim: true,
      default: 'Primary Level',
    },
    age: {
      type: String,
      trim: true,
      default: '6+ Years',
    },
    medium: {
      type: String,
      trim: true,
      default: 'Bilingual (UP Board curriculum standard)',
    },
    timing: {
      type: String,
      trim: true,
      default: '8:00 AM – 2:00 PM',
    },
    weeklyLoad: {
      type: String,
      trim: true,
      default: '32 Periods / Week',
    },
    overview: {
      type: String,
      trim: true,
      default: '',
    },
    curriculumPoints: {
      type: [String],
      default: [],
    },
    subjectList: {
      type: [subjectItemSchema],
      default: [],
    },
    outcomes: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
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

courseSchema.index({ classGrade: 1, academicSession: 1 });
courseSchema.index({ isPublished: 1, sortOrder: 1 });

export const Course = mongoose.model('Course', courseSchema);
