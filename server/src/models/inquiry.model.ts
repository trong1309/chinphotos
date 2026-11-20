import mongoose, { Document, Schema, Model } from 'mongoose';

export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived';

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  serviceType?: string;
  eventDate?: Date;
  location?: string;
  adultsCount?: number;
  childrenInfo?: string;
  message: string;
  source?: string;
  status: InquiryStatus;
  internalNote?: string;
  lang?: 'vi' | 'en';
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new Schema<IInquiry>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    serviceType: {
      type: String,
      default: '',
      index: true,
    },
    eventDate: {
      type: Date,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    adultsCount: {
      type: Number,
      default: 2,
    },
    childrenInfo: {
      type: String,
      default: '',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    source: {
      type: String,
      default: 'website',
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
      index: true,
    },
    internalNote: {
      type: String,
      default: '',
    },
    lang: {
      type: String,
      enum: ['vi', 'en'],
      default: 'vi',
    },
  },
  {
    timestamps: true,
  },
);

export const Inquiry: Model<IInquiry> =
  mongoose.models['Inquiry'] || mongoose.model<IInquiry>('Inquiry', inquirySchema);
export default Inquiry;
