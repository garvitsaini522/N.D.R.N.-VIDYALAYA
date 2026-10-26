import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema(
  {
    fatherName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    motherName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    primaryContact: {
      name: { type: String, required: [true, 'Primary contact name is required'], trim: true },
      phone: {
        type: String,
        required: [true, 'Primary contact phone is required'],
        trim: true,
        match: [/^[0-9+ -]{10,15}$/, 'Please enter a valid phone number'],
        index: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      },
      relationship: {
        type: String,
        enum: ['Father', 'Mother', 'Guardian', 'Other'],
        default: 'Father',
      },
    },
    occupation: {
      type: String,
      trim: true,
    },
    annualIncome: {
      type: Number,
      min: 0,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    address: {
      street: { type: String, trim: true },
      village: { type: String, default: 'Daulatyarpur', trim: true },
      district: { type: String, default: 'Hardoi', trim: true },
      state: { type: String, default: 'Uttar Pradesh', trim: true },
      pincode: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

export const Parent = mongoose.model('Parent', parentSchema);
