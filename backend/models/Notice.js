import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Academic', 'Academics', 'Admissions', 'Holidays', 'Examinations', 'General', 'Urgent'],
      default: 'General',
      index: true,
    },
    targetAudience: {
      type: [String],
      enum: ['all', 'students', 'parents', 'teachers'],
      default: ['all'],
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiryDate: {
      type: Date,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attachmentUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

noticeSchema.pre('validate', function (next) {
  if (!this.content && this.summary) {
    this.content = this.summary;
  }
  if (this.category === 'Academics') {
    this.category = 'Academic';
  }
  next();
});

noticeSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

noticeSchema.virtual('pinned').get(function () {
  return Boolean(this.isPinned);
});

noticeSchema.virtual('date').get(function () {
  return this.publishedDate ? this.publishedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
});

noticeSchema.index({ status: 1, isPinned: -1, publishedDate: -1 });

export const Notice = mongoose.model('Notice', noticeSchema);
