import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IImage extends Document {
  gallery?: Types.ObjectId;
  url: string;
  storageKey: string;
  width: number;
  height: number;
  blurDataUrl?: string;
  alt?: string;
  caption?: string;
  isFeatured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<IImage>(
  {
    gallery: {
      type: Schema.Types.ObjectId,
      ref: 'Gallery',
      index: true,
    },
    url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    storageKey: {
      type: String,
      required: [true, 'Storage key is required'],
    },
    width: {
      type: Number,
      required: [true, 'Width is required'],
    },
    height: {
      type: Number,
      required: [true, 'Height is required'],
    },
    blurDataUrl: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
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

export const Image: Model<IImage> =
  mongoose.models['Image'] || mongoose.model<IImage>('Image', imageSchema);
export default Image;
