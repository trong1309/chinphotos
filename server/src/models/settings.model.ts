import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  x?: string;
  threads?: string;
}

export interface IMenuItem {
  label: string;
  path: string;
  order: number;
  isVisible: boolean;
}

export interface IDefaultSEO {
  title: string;
  description: string;
  ogImage?: string;
}

export interface INotifications {
  emailOnInquiry: boolean;
}

export interface ISettings extends Document {
  siteName: string;
  logo?: string;
  tagline?: string;
  bio?: string;
  heroImages: string[];
  social: ISocialLinks;
  contactEmail: string;
  serviceAreas: string[];
  menu: IMenuItem[];
  shopEnabled: boolean;
  defaultSeo: IDefaultSEO;
  notifications: INotifications;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    label: { type: String, required: true },
    path: { type: String, required: true },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false },
);

const settingsSchema = new Schema<ISettings>(
  {
    siteName: {
      type: String,
      default: 'Your Name Photography',
    },
    logo: {
      type: String,
      default: '',
    },
    tagline: {
      type: String,
      default: 'Editorial & Storytelling Photographer',
    },
    bio: {
      type: String,
      default: 'Capturing intimate moments, timeless portraits, and heartfelt visual narratives.',
    },
    heroImages: {
      type: [String],
      default: [],
    },
    social: {
      instagram: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      youtube: { type: String, default: '' },
      facebook: { type: String, default: '' },
      x: { type: String, default: '' },
      threads: { type: String, default: '' },
    },
    contactEmail: {
      type: String,
      default: 'hello@example.com',
    },
    serviceAreas: {
      type: [String],
      default: ['Da Nang', 'Hoi An', 'Worldwide'],
    },
    menu: {
      type: [menuItemSchema],
      default: [
        { label: 'Work', path: '/work', order: 1, isVisible: true },
        { label: 'Portfolio', path: '/portfolio', order: 2, isVisible: true },
        { label: 'About', path: '/about', order: 3, isVisible: true },
        { label: 'Details', path: '/details', order: 4, isVisible: true },
        { label: 'Journal', path: '/journal', order: 5, isVisible: true },
        { label: 'Shop', path: '/shop', order: 6, isVisible: true },
        { label: 'Contact', path: '/contact', order: 7, isVisible: true },
      ],
    },
    shopEnabled: {
      type: Boolean,
      default: false,
    },
    defaultSeo: {
      title: { type: String, default: 'Editorial & Wedding Photographer' },
      description: {
        type: String,
        default: 'Editorial & documentary wedding and lifestyle photography based worldwide.',
      },
      ogImage: { type: String, default: '' },
    },
    notifications: {
      emailOnInquiry: { type: Boolean, default: true },
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  },
);

export const Settings: Model<ISettings> =
  mongoose.models['Settings'] || mongoose.model<ISettings>('Settings', settingsSchema);
export default Settings;
