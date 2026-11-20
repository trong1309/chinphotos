import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IOrderItem {
  product?: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  type: string;
}

export interface IOrderCustomer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: IOrderCustomer;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    type: { type: String, required: true },
  },
  { _id: false },
);

const orderCustomerSchema = new Schema<IOrderCustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: orderCustomerSchema,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

export const Order: Model<IOrder> =
  mongoose.models['Order'] || mongoose.model<IOrder>('Order', orderSchema);
export default Order;
