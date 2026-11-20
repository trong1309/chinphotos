import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type PageViewRefType = 'gallery' | 'post' | 'page';

export interface IPageView extends Document {
  path: string;
  refType: PageViewRefType;
  refId?: Types.ObjectId | string;
  referrer?: string;
  ipHash?: string;
  createdAt: Date;
}

const pageViewSchema = new Schema<IPageView>(
  {
    path: {
      type: String,
      required: true,
      index: true,
    },
    refType: {
      type: String,
      enum: ['gallery', 'post', 'page'],
      default: 'page',
      index: true,
    },
    refId: {
      type: Schema.Types.Mixed,
      default: null,
    },
    referrer: {
      type: String,
      default: '',
    },
    ipHash: {
      type: String,
      default: '',
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 34560000, // 400 days in seconds (TTL Index)
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export const PageView: Model<IPageView> =
  mongoose.models['PageView'] || mongoose.model<IPageView>('PageView', pageViewSchema);
export default PageView;
