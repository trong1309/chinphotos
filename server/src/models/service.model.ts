import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IFAQ {
  q: string;
  a: string;
}

export interface IService extends Document {
  title: string;
  slug: string;
  summary?: string;
  heroImage?: string;
  content: string;
  priceFrom?: number;
  inclusions: string[];
  faqs: IFAQ[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFAQ>(
  {
    q: { type: String, required: true, trim: true },
    a: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const serviceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Service slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      default: '',
    },
    heroImage: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    priceFrom: {
      type: Number,
      default: 0,
    },
    inclusions: {
      type: [String],
      default: [],
    },
    faqs: {
      type: [faqSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Service: Model<IService> =
  mongoose.models['Service'] || mongoose.model<IService>('Service', serviceSchema);
export default Service;
