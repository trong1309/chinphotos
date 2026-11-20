import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { z } from 'zod';
import PageView from '../models/pageview.model';
import Inquiry from '../models/inquiry.model';
import Gallery from '../models/gallery.model';
import Post from '../models/post.model';
import asyncHandler from '../utils/asyncHandler';

const pageviewSchema = z.object({
  path: z.string().min(1),
  refType: z.enum(['gallery', 'post', 'page']).default('page'),
  refId: z.string().optional(),
  referrer: z.string().optional(),
});

export const recordPageView = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = pageviewSchema.parse(req.body);

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const ipHash = crypto
      .createHash('sha256')
      .update(clientIp + 'photographer_salt')
      .digest('hex');

    await PageView.create({
      path: body.path,
      refType: body.refType,
      refId: body.refId || null,
      referrer: body.referrer || '',
      ipHash,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: null,
      message: 'Pageview recorded',
    });
  },
);

export const getAnalyticsSummary = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const range = (req.query['range'] as string) || '30d';

    const now = new Date();
    const startDate = new Date();

    if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === '3m') {
      startDate.setMonth(now.getMonth() - 3);
    } else if (range === '12m') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    const dateFilter = { createdAt: { $gte: startDate, $lte: now } };

    // 1. Total views & Unique visitors
    const [totalPageviews, uniqueVisitorsAgg] = await Promise.all([
      PageView.countDocuments(dateFilter),
      PageView.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$ipHash' } },
        { $count: 'uniqueCount' },
      ]),
    ]);
    const uniqueVisitors = uniqueVisitorsAgg[0]?.uniqueCount || 0;

    // 2. Daily Views & Daily Unique Visitors
    const dailyViewsAgg = await PageView.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          views: { $sum: 1 },
          ips: { $addToSet: '$ipHash' },
        },
      },
      {
        $project: {
          date: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$ips' },
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // 3. Inquiries Summary & Daily Inquiries
    const [totalInquiries, dailyInquiriesAgg, serviceBreakdownAgg] = await Promise.all([
      Inquiry.countDocuments(dateFilter),
      Inquiry.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $project: { date: '$_id', count: 1, _id: 0 } },
        { $sort: { date: 1 } },
      ]),
      Inquiry.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $ifNull: ['$serviceType', 'General'] },
            count: { $sum: 1 },
          },
        },
        { $project: { serviceType: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // 4. Conversion rate
    const conversionRate =
      totalPageviews > 0
        ? parseFloat(((totalInquiries / totalPageviews) * 100).toFixed(2))
        : 0;

    // 5. Top Galleries viewed
    const topGalleriesAgg = await PageView.aggregate([
      { $match: { ...dateFilter, refType: 'gallery' } },
      { $group: { _id: '$refId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
    ]);

    const topGalleries = await Promise.all(
      topGalleriesAgg.map(async (item) => {
        let gallery = null;
        if (item._id) {
          if (mongoose.Types.ObjectId.isValid(item._id)) {
            gallery = await Gallery.findById(item._id).select('title slug coverImage');
          }
          if (!gallery) {
            gallery = await Gallery.findOne({ slug: item._id }).select('title slug coverImage');
          }
        }
        return {
          id: item._id || 'unknown',
          title: gallery?.title || item._id || 'Unknown Gallery',
          slug: gallery?.slug || item._id || '',
          coverImage: gallery?.coverImage || '',
          views: item.views,
        };
      }),
    );

    // 6. Top Posts viewed
    const topPostsAgg = await PageView.aggregate([
      { $match: { ...dateFilter, refType: 'post' } },
      { $group: { _id: '$refId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
    ]);

    const topPosts = await Promise.all(
      topPostsAgg.map(async (item) => {
        let post = null;
        if (item._id) {
          if (mongoose.Types.ObjectId.isValid(item._id)) {
            post = await Post.findById(item._id).select('title slug coverImage');
          }
          if (!post) {
            post = await Post.findOne({ slug: item._id }).select('title slug coverImage');
          }
        }
        return {
          id: item._id || 'unknown',
          title: post?.title || item._id || 'Unknown Post',
          slug: post?.slug || item._id || '',
          coverImage: post?.coverImage || '',
          views: item.views,
        };
      }),
    );

    // 7. Top Referrers
    const topReferrersAgg = await PageView.aggregate([
      { $match: { ...dateFilter, referrer: { $nin: ['', null] } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { referrer: '$_id', count: 1, _id: 0 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        range,
        summary: {
          totalPageviews,
          uniqueVisitors,
          totalInquiries,
          conversionRate,
        },
        dailyViews: dailyViewsAgg,
        dailyInquiries: dailyInquiriesAgg,
        serviceBreakdown: serviceBreakdownAgg,
        topGalleries,
        topPosts,
        topReferrers: topReferrersAgg,
      },
      message: 'Analytics summary retrieved successfully',
    });
  },
);
