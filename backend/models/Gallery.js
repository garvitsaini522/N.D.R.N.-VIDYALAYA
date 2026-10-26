import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Gallery item title is required'],
      trim: true,
      maxlength: 150,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Campus', 'Classroom', 'Sports & Play', 'Arts & Craft', 'Celebrations', 'Other'],
      default: 'Campus',
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL or placeholder path is required'],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'hidden'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

gallerySchema.index({ category: 1, status: 1, createdAt: -1 });

export const Gallery = mongoose.model('Gallery', gallerySchema);
