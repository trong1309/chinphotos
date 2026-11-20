import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Subscriber: Model<ISubscriber> =
  mongoose.models['Subscriber'] || mongoose.model<ISubscriber>('Subscriber', subscriberSchema);
export default Subscriber;
