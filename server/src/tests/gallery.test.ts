import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import User from '../models/user.model';
import Category from '../models/category.model';
import Gallery from '../models/gallery.model';
import { setupTestDB } from './setup';

setupTestDB();

describe('Gallery & Category API Tests', () => {
  let adminCookie: string[];
  let categoryId: string;
  let publishedGallerySlug: string;
  let draftGallerySlug: string;

  beforeEach(async () => {
    // 1. Create admin user & login
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

    // 2. Create Category
    const category = await Category.create({
      name: 'Weddings',
      slug: 'weddings',
      order: 1,
      isVisible: true,
    });
    categoryId = category._id.toString();

    // 3. Create Published Gallery
    const pubGal = await Gallery.create({
      title: 'Romantic Summer Wedding',
      slug: 'romantic-summer-wedding',
      category: category._id,
      status: 'published',
      isFeatured: true,
      description: 'A beautiful outdoor summer wedding.',
    });
    publishedGallerySlug = pubGal.slug;

    // 4. Create Draft Gallery
    const draftGal = await Gallery.create({
      title: 'Secret Draft Gallery',
      slug: 'secret-draft-gallery',
      category: category._id,
      status: 'draft',
      isFeatured: false,
    });
    draftGallerySlug = draftGal.slug;
  });

  describe('GET /api/galleries', () => {
    it('should return only published galleries for unauthenticated visitors', async () => {
      const res = await request(app).get('/api/galleries');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].slug).toBe(publishedGallerySlug);
    });

    it('should filter galleries by search query', async () => {
      const res = await request(app).get('/api/galleries?search=summer');

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].title).toContain('Summer');
    });

    it('should filter galleries by category', async () => {
      const res = await request(app).get(`/api/galleries?category=weddings`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
    });
  });

  describe('GET /api/galleries/:slug', () => {
    it('should return published gallery with navigation', async () => {
      const res = await request(app).get(`/api/galleries/${publishedGallerySlug}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.gallery.slug).toBe(publishedGallerySlug);
      expect(res.body.data.navigation).toBeDefined();
    });

    it('should return 404 for unauthenticated visitor trying to access draft gallery', async () => {
      const res = await request(app).get(`/api/galleries/${draftGallerySlug}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should allow logged-in admin to view draft gallery', async () => {
      const res = await request(app)
        .get(`/api/galleries/${draftGallerySlug}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.gallery.status).toBe('draft');
    });
  });

  describe('POST /api/galleries', () => {
    it('should allow admin to create a new gallery', async () => {
      const res = await request(app)
        .post('/api/galleries')
        .set('Cookie', adminCookie)
        .send({
          title: 'Coastal Elopement',
          category: categoryId,
          status: 'published',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('coastal-elopement');
    });

    it('should reject unauthenticated gallery creation with 401', async () => {
      const res = await request(app)
        .post('/api/galleries')
        .send({
          title: 'Unauthorized Gallery',
          category: categoryId,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should block deleting category when associated galleries exist (400)', async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Cannot delete category/i);
    });
  });
});
