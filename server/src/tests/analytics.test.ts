import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import User from '../models/user.model';
import PageView from '../models/pageview.model';
import { setupTestDB } from './setup';

setupTestDB();

describe('Analytics API Tests', () => {
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

  describe('POST /api/analytics/pageview', () => {
    it('should successfully record a valid pageview', async () => {
      const res = await request(app)
        .post('/api/analytics/pageview')
        .send({
          path: '/portfolio',
          refType: 'page',
          referrer: 'https://instagram.com',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const count = await PageView.countDocuments({ path: '/portfolio' });
      expect(count).toBe(1);
    });

    it('should reject invalid pageview with missing path (422)', async () => {
      const res = await request(app)
        .post('/api/analytics/pageview')
        .send({
          referrer: 'https://google.com',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/analytics/summary (Admin)', () => {
    beforeEach(async () => {
      await PageView.create([
        { path: '/', refType: 'page', ipHash: 'hash-1' },
        { path: '/work', refType: 'page', ipHash: 'hash-2' },
        { path: '/', refType: 'page', ipHash: 'hash-1' },
      ]);
    });

    it('should calculate analytics summary metrics for admin', async () => {
      const res = await request(app)
        .get('/api/analytics/summary?range=30d')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalPageviews).toBe(3);
      expect(res.body.data.summary.uniqueVisitors).toBe(2);
      expect(res.body.data.dailyViews).toBeDefined();
    });

    it('should reject unauthenticated request to summary with 401', async () => {
      const res = await request(app).get('/api/analytics/summary');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
