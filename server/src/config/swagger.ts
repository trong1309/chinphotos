export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Photographer Portfolio API',
    version: '1.0.0',
    description: 'REST API documentation for Photographer Portfolio & CMS',
  },
  servers: [
    {
      url: '/api',
      description: 'API Base URL',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT stored in httpOnly cookie',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string', example: 'Operation completed successfully' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email' },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check endpoint',
        responses: { 200: { description: 'Server healthy' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Admin login',
        responses: { 200: { description: 'Success' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Admin logout',
        responses: { 200: { description: 'Success' } },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Current admin profile',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' }, 401: { description: 'Unauthorized' } },
      },
      put: {
        summary: 'Update admin profile',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/auth/password': {
      patch: {
        summary: 'Change password',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/settings': {
      get: {
        summary: 'Get public site settings',
        responses: { 200: { description: 'Success' } },
      },
      put: {
        summary: 'Update site settings (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/categories': {
      get: {
        summary: 'List categories with galleryCount',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        summary: 'Create category (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 201: { description: 'Created' } },
      },
    },
    '/categories/reorder': {
      patch: {
        summary: 'Reorder categories (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/categories/{id}': {
      get: {
        summary: 'Get category by ID or slug',
        responses: { 200: { description: 'Success' } },
      },
      put: {
        summary: 'Update category (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
      delete: {
        summary: 'Delete category (Admin - blocked if galleries exist)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' }, 400: { description: 'Galleries exist' } },
      },
    },
    '/galleries': {
      get: {
        summary: 'List galleries (search, category, status, featured, sort, pagination)',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        summary: 'Create gallery (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 201: { description: 'Created' } },
      },
    },
    '/galleries/{slug}': {
      get: {
        summary: 'Get gallery details with images and prev/next navigation',
        responses: { 200: { description: 'Success' }, 404: { description: 'Not found or draft' } },
      },
    },
    '/galleries/{id}': {
      put: {
        summary: 'Update gallery (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
      delete: {
        summary: 'Delete gallery and images (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/images': {
      get: {
        summary: 'List images for masonry Work page (featured, gallery, pagination)',
        responses: { 200: { description: 'Success' } },
      },
    },
    '/images/upload': {
      post: {
        summary: 'Upload multiple images with WebP 3-size generation and blurDataUrl (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 201: { description: 'Uploaded' } },
      },
    },
    '/images/reorder': {
      patch: {
        summary: 'Reorder images (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/images/bulk': {
      patch: {
        summary: 'Bulk image actions: delete, feature, unfeature (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/images/{id}': {
      put: {
        summary: 'Update image metadata (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
      delete: {
        summary: 'Delete image and physical files (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/posts': {
      get: {
        summary: 'List blog posts (search, category, tag, status, pagination)',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        summary: 'Create blog post (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 201: { description: 'Created' } },
      },
    },
    '/posts/{slug}': {
      get: {
        summary: 'Get blog post details by slug with related posts',
        responses: { 200: { description: 'Success' }, 404: { description: 'Not found' } },
      },
    },
    '/posts/{id}': {
      put: {
        summary: 'Update blog post (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
      delete: {
        summary: 'Delete blog post (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/services': {
      get: {
        summary: 'List services with inclusions and FAQs',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        summary: 'Create service (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 201: { description: 'Created' } },
      },
    },
    '/services/{slug}': {
      get: {
        summary: 'Get service details by slug',
        responses: { 200: { description: 'Success' } },
      },
    },
    '/services/{id}': {
      put: {
        summary: 'Update service (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
      delete: {
        summary: 'Delete service (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/products': {
      get: {
        summary: 'List products (type, isActive, pagination)',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        summary: 'Create product (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 201: { description: 'Created' } },
      },
    },
    '/products/{id}': {
      get: {
        summary: 'Get product by ID or slug',
        responses: { 200: { description: 'Success' } },
      },
      put: {
        summary: 'Update product (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
      delete: {
        summary: 'Delete product (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/inquiries': {
      post: {
        summary: 'Submit client inquiry (Rate limited to 5/hour, honeypot protected)',
        responses: { 201: { description: 'Received' }, 429: { description: 'Rate limit exceeded' } },
      },
      get: {
        summary: 'List inquiries (Admin - search, status, serviceType, date range, pagination)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/inquiries/bulk': {
      patch: {
        summary: 'Bulk update inquiry status or bulk delete (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/inquiries/{id}': {
      get: {
        summary: 'Get inquiry details and auto-mark as read (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
      patch: {
        summary: 'Update inquiry status or internal note (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
      delete: {
        summary: 'Delete inquiry (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/subscribers': {
      post: {
        summary: 'Subscribe email to newsletter',
        responses: { 201: { description: 'Subscribed' }, 200: { description: 'Already subscribed' } },
      },
      get: {
        summary: 'List subscribers (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/analytics/pageview': {
      post: {
        summary: 'Record client pageview (Rate limited)',
        responses: { 201: { description: 'Recorded' } },
      },
    },
    '/analytics/summary': {
      get: {
        summary: 'Get dashboard/analytics summary by range 7d|30d|3m|12m (Admin)',
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
  },
};

export default swaggerSpec;
