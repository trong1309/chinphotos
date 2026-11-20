import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  popularSpotsVi: string[];
  popularSpotsEn: string[];
  tipsVi: string;
  tipsEn: string;
  coverImage?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Location slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    titleVi: {
      type: String,
      required: true,
      trim: true,
    },
    titleEn: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionVi: {
      type: String,
      required: true,
    },
    descriptionEn: {
      type: String,
      required: true,
    },
    popularSpotsVi: {
      type: [String],
      default: [],
    },
    popularSpotsEn: {
      type: [String],
      default: [],
    },
    tipsVi: {
      type: String,
      default: '',
    },
    tipsEn: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
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

export const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>('Location', locationSchema);

export default Location;
