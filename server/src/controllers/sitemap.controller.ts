import { Request, Response } from 'express';
import Gallery from '../models/gallery.model';
import Service from '../models/service.model';
import Category from '../models/category.model';
import Location from '../models/location.model';
import env from '../config/env';
import asyncHandler from '../utils/asyncHandler';

export const getSitemapXml = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const baseUrl = env.CLIENT_URL.replace(/\/+$/, '');

    const staticRoutes = [
      '',
      '/work',
      '/portfolio',
      '/about',
      '/details',
      '/contact',
    ];

    const [categories, galleries, services, locations] = await Promise.all([
      Category.find({ isVisible: true }).select('slug updatedAt'),
      Gallery.find({ status: 'published', isUnlisted: { $ne: true } }).select('slug updatedAt'),
      Service.find().select('slug updatedAt'),
      Location.find().select('slug updatedAt'),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    // Helper to generate url node with hreflang links
    const renderUrlNode = (
      path: string,
      changefreq: string,
      priority: string,
      lastmod?: Date,
    ) => {
      const fullUrl = `${baseUrl}${path}`;
      const hasQuery = path.includes('?');
      const viUrl = `${fullUrl}${hasQuery ? '&' : '?'}lng=vi`;
      const enUrl = `${fullUrl}${hasQuery ? '&' : '?'}lng=en`;

      let node = `  <url>\n`;
      node += `    <loc>${fullUrl}</loc>\n`;
      node += `    <xhtml:link rel="alternate" hreflang="vi" href="${viUrl}" />\n`;
      node += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />\n`;
      node += `    <xhtml:link rel="alternate" hreflang="x-default" href="${fullUrl}" />\n`;
      if (lastmod) {
        node += `    <lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>\n`;
      }
      node += `    <changefreq>${changefreq}</changefreq>\n`;
      node += `    <priority>${priority}</priority>\n`;
      node += `  </url>\n`;
      return node;
    };

    // Static pages
    for (const route of staticRoutes) {
      xml += renderUrlNode(
        route,
        route === '' ? 'daily' : 'weekly',
        route === '' ? '1.0' : '0.8',
      );
    }

    // Categories
    for (const cat of categories) {
      xml += renderUrlNode(
        `/portfolio/${cat.slug}`,
        'weekly',
        '0.8',
        cat.updatedAt || new Date(),
      );
    }

    // Galleries
    for (const gal of galleries) {
      xml += renderUrlNode(
        `/gallery/${gal.slug}`,
        'monthly',
        '0.7',
        gal.updatedAt || new Date(),
      );
    }

    // Services
    for (const serv of services) {
      xml += renderUrlNode(
        `/services/${serv.slug}`,
        'monthly',
        '0.7',
        serv.updatedAt || new Date(),
      );
    }

    // Locations (HCMC Local SEO)
    for (const loc of locations) {
      xml += renderUrlNode(
        `/locations/${loc.slug}`,
        'monthly',
        '0.8',
        loc.updatedAt || new Date(),
      );
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  },
);
