import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10)),
  MONGODB_URI: z.string({
    required_error: 'MONGODB_URI is required to connect to the database.',
  }).min(1, 'MONGODB_URI cannot be empty.'),
  STORAGE_DRIVER: z.enum(['local', 'cloudinary']).default('local'),
  UPLOAD_DIR: z.string().default('./uploads'),
  PUBLIC_UPLOAD_URL: z.string().default('http://localhost:5000/uploads'),
  JWT_SECRET: z.string({
    required_error: 'JWT_SECRET is required for authentication tokens.',
  }).min(16, 'JWT_SECRET must be at least 16 characters long for security.'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  ADMIN_URL: z.string().default('http://localhost:5174'),
  // Optional Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  // Optional SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 587)),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('Photographer <hello@example.com>'),
  // Optional default admin seed
  ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  ADMIN_PASSWORD: z.string().default('Admin@123456'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ FATAL: Environment variable validation failed:');
    result.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    });
    console.error('Please configure your .env file according to .env.example.\n');
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
export default env;
