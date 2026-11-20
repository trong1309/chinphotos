import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IVendor {
  role: string;
  name: string;
  url?: string;
}

export interface IGallery extends Document {
  title: string;
  slug: string;
  category: Types.ObjectId;
  location?: string;
  eventDate?: Date;
  description?: string;
  vendors: IVendor[];
  coverImage?: string;
  status: 'draft' | 'published';
  isUnlisted: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    role: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, default: '', trim: true },
  },
  { _id: false },
);

const gallerySchema = new Schema<IGallery>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
      index: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    eventDate: {
      type: Date,
    },
    description: {
      type: String,
      default: '',
    },
    vendors: {
      type: [vendorSchema],
      default: [],
    },
    coverImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    isUnlisted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    seoTitle: {
      type: String,
      default: '',
    },
    seoDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

export const Gallery: Model<IGallery> =
  mongoose.models['Gallery'] || mongoose.model<IGallery>('Gallery', gallerySchema);
export default Gallery;
