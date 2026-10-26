import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Celebrations', 'Celebration', 'Sports & Play', 'Sports & Cultural', 'Creative Arts', 'Academic', 'Community', 'General'],
      default: 'General',
      index: true,
    },
    type: {
      type: String,
      enum: ['upcoming', 'past'],
      default: 'upcoming',
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
    },
    time: {
      type: String,
      trim: true,
      default: '09:00 AM – 01:00 PM',
    },
    venue: {
      type: String,
      default: 'School Campus, Daulatyarpur, Madhoganj',
      trim: true,
    },
    imagePlaceholder: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'upcoming', 'past', 'Upcoming', 'Completed', 'Past'],
      default: 'scheduled',
      index: true,
    },
    customId: {
      type: String,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.pre('validate', function (next) {
  if (!this.startDate && this.get('date')) {
    const parsed = new Date(this.get('date'));
    if (!isNaN(parsed.getTime())) {
      this.startDate = parsed;
    }
  }
  if (!this.description && this.get('summary')) {
    this.description = this.get('summary');
  }
  if (this.category === 'Celebration') {
    this.category = 'Celebrations';
  }
  const currentStatus = String(this.status || '').toLowerCase();
  if (currentStatus === 'upcoming' || currentStatus === 'scheduled') {
    this.status = 'scheduled';
    this.type = 'upcoming';
  } else if (currentStatus === 'completed' || currentStatus === 'past') {
    this.status = 'completed';
    this.type = 'past';
  }
  next();
});

eventSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

eventSchema.virtual('date').get(function () {
  return this.startDate ? this.startDate.toISOString().split('T')[0] : '';
});

eventSchema.index({ type: 1, startDate: -1 });

export const Event = mongoose.model('Event', eventSchema);
