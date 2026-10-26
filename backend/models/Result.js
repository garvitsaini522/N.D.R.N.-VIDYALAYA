import mongoose from 'mongoose';

const subjectScoreSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
      min: 1,
    },
    obtainedMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    grade: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
      index: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
      index: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '2026-2027',
      index: true,
    },
    term: {
      type: String,
      required: [true, 'Examination term is required'],
      enum: ['Term 1', 'Term 2', 'Final', 'Unit Test 1', 'Unit Test 2', 'Monthly Evaluation'],
      index: true,
    },
    subjects: {
      type: [subjectScoreSchema],
      required: [true, 'At least one subject score is required'],
      validate: [(val) => val.length > 0, 'Must include at least one subject score'],
    },
    totalMaxMarks: {
      type: Number,
      default: 0,
    },
    totalObtainedMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    overallGrade: {
      type: String,
      trim: true,
    },
    teacherRemarks: {
      type: String,
      trim: true,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals and percentage automatically before saving
resultSchema.pre('save', function (next) {
  if (this.subjects && this.subjects.length > 0) {
    let max = 0;
    let obtained = 0;

    this.subjects.forEach((subj) => {
      max += subj.maxMarks || 0;
      obtained += subj.obtainedMarks || 0;
    });

    this.totalMaxMarks = max;
    this.totalObtainedMarks = obtained;
    this.percentage = max > 0 ? parseFloat(((obtained / max) * 100).toFixed(2)) : 0;

    // Simple grading scale
    if (this.percentage >= 90) this.overallGrade = 'A+';
    else if (this.percentage >= 80) this.overallGrade = 'A';
    else if (this.percentage >= 70) this.overallGrade = 'B+';
    else if (this.percentage >= 60) this.overallGrade = 'B';
    else if (this.percentage >= 50) this.overallGrade = 'C';
    else if (this.percentage >= 33) this.overallGrade = 'D';
    else this.overallGrade = 'E (Needs Improvement)';
  }
  next();
});

resultSchema.index({ student: 1, term: 1, academicYear: 1 }, { unique: true });

export const Result = mongoose.model('Result', resultSchema);
