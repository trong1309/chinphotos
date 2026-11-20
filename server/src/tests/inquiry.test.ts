import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import User from '../models/user.model';
import Inquiry from '../models/inquiry.model';
import { setupTestDB } from './setup';

setupTestDB();

describe('Inquiry API Tests', () => {
  let adminCookie: string[];

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password@123', salt);
    await User.create({
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin',
      role: 'admin',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'Password@123' });
    adminCookie = (loginRes.headers['set-cookie'] as unknown as string[]) || [];
  });

  describe('POST /api/inquiries', () => {
    it('should submit valid inquiry and save in database', async () => {
      const payload = {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        phone: '0901234567',
        serviceType: 'Wedding Collection',
        message: 'Looking forward to working with you for our wedding in Hoi An!',
      };

      const res = await request(app).post('/api/inquiries').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const dbInquiry = await Inquiry.findOne({ email: payload.email });
      expect(dbInquiry).not.toBeNull();
      expect(dbInquiry?.name).toBe(payload.name);
      expect(dbInquiry?.status).toBe('new');
    });

    it('should ignore spam when honeypot field is filled (silent success without DB record)', async () => {
      const payload = {
        name: 'Spam Bot',
        email: 'spambot@example.com',
        message: 'Cheap crypto loans and SEO services here!',
        website_url_hp: 'http://spamsite.com', // Honeypot filled!
      };

      const res = await request(app).post('/api/inquiries').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify it was NOT saved to the database
      const dbInquiry = await Inquiry.findOne({ email: payload.email });
      expect(dbInquiry).toBeNull();
    });

    it('should fail with 422 when email is invalid', async () => {
      const payload = {
        name: 'John Doe',
        email: 'not-an-email',
        message: 'Hello there, valid message content',
      };

      const res = await request(app).post('/api/inquiries').send(payload);

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/inquiries (Admin)', () => {
    beforeEach(async () => {
      await Inquiry.create([
        {
          name: 'Client A',
          email: 'clienta@example.com',
          message: 'Inquiry message A',
          status: 'new',
        },
        {
          name: 'Client B',
          email: 'clientb@example.com',
          message: 'Inquiry message B',
          status: 'replied',
        },
      ]);
    });

    it('should allow admin to list all inquiries with pagination', async () => {
      const res = await request(app)
        .get('/api/inquiries')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(2);
    });

    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/inquiries');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
