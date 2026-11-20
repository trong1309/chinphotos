import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import User from '../models/user.model';
import { setupTestDB } from './setup';

setupTestDB();

describe('Auth API Tests', () => {
  const testAdmin = {
    email: 'admin@example.com',
    password: 'Password@123',
    name: 'Test Admin',
  };

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testAdmin.password, salt);
    await User.create({
      email: testAdmin.email,
      passwordHash,
      name: testAdmin.name,
      role: 'admin',
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully log in with valid credentials and return httpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testAdmin.email, password: testAdmin.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testAdmin.email);
      expect(res.headers['set-cookie']).toBeDefined();
      const cookies = (res.headers['set-cookie'] as unknown as string[]) || [];
      const cookie = cookies[0] || '';
      expect(cookie).toContain('token=');
      expect(cookie).toContain('HttpOnly');
    });

    it('should fail with 401 when given an incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testAdmin.email, password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    it('should fail with 401 when email does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'Password@123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 422 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email-format' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return profile when authenticated with cookie', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testAdmin.email, password: testAdmin.password });

      const cookie = (loginRes.headers['set-cookie'] as unknown as string[]) || [];

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user.email).toBe(testAdmin.email);
    });

    it('should fail with 401 when accessing /auth/me without authentication', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Authentication required/i);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear authentication cookie upon logout', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const cookie = res.headers['set-cookie']?.[0];
      expect(cookie).toContain('token=;');
    });
  });
});
