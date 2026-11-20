import mongoose, { Document, Schema, Model } from 'mongoose';

export type ProductType = 'print' | 'photobook' | 'preset' | 'gear';
export type ProductLinkType = 'internal' | 'external';

export interface IProduct extends Document {
  name: string;
  slug: string;
  type: ProductType;
  price: number;
  inventory: number;
  linkType: ProductLinkType;
  externalUrl?: string;
  description?: string;
  coverImage?: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['print', 'photobook', 'preset', 'gear'],
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    inventory: {
      type: Number,
      default: 0,
      min: 0,
    },
    linkType: {
      type: String,
      enum: ['internal', 'external'],
      default: 'internal',
    },
    externalUrl: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Product: Model<IProduct> =
  mongoose.models['Product'] || mongoose.model<IProduct>('Product', productSchema);
export default Product;
