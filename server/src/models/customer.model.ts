import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

export const Customer: Model<ICustomer> =
  mongoose.models['Customer'] || mongoose.model<ICustomer>('Customer', customerSchema);
export default Customer;
