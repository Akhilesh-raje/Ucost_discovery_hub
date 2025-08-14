import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Track visitor activity
router.post('/track', async (req, res) => {
  try {
    const { sessionId, userId, pageVisited, timeSpent } = req.body;

    if (!sessionId || !pageVisited) {
      return res.status(400).json({ error: 'Session ID and page visited are required' });
    }

    const analytics = await prisma.visitorAnalytics.create({
      data: {
        sessionId,
        userId: userId || null,
        pageVisited,
        timeSpent: timeSpent || 0
      }
    });

    res.status(201).json({
      message: 'Activity tracked successfully',
      analytics
    });
  } catch (error) {
    console.error('Track activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visitor statistics
router.get('/visitors', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    // Get total visitors
    const totalVisitors = await prisma.visitorAnalytics.groupBy({
      by: ['sessionId'],
      where: whereClause
    }).then((groups: any[]) => groups.length);

    // Get unique users
    const uniqueUsers = await prisma.visitorAnalytics.groupBy({
      by: ['userId'],
      where: {
        ...whereClause,
        userId: { not: null }
      }
    }).then((groups: any[]) => groups.length);

    // Get total page views
    const totalPageViews = await prisma.visitorAnalytics.count({
      where: whereClause
    });

    // Get average time spent
    const avgTimeSpent = await prisma.visitorAnalytics.aggregate({
      where: whereClause,
      _avg: {
        timeSpent: true
      }
    });

    res.json({
      totalVisitors,
      uniqueUsers,
      totalPageViews,
      averageTimeSpent: avgTimeSpent._avg.timeSpent || 0
    });
  } catch (error) {
    console.error('Get visitor statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get popular exhibits
router.get('/popular-exhibits', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // This would require additional tracking of exhibit views
    // For now, return a placeholder response
    const popularExhibits = await prisma.exhibit.findMany({
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      popularExhibits: popularExhibits.map((exhibit: any) => ({
        id: exhibit.id,
        name: exhibit.name,
        category: exhibit.category,
        views: 0 // Placeholder - would need additional tracking
      }))
    });
  } catch (error) {
    console.error('Get popular exhibits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get page visit statistics
router.get('/page-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    // Get page visit counts
    const pageStats = await prisma.visitorAnalytics.groupBy({
      by: ['pageVisited'],
      where: whereClause,
      _count: {
        pageVisited: true
      },
      _avg: {
        timeSpent: true
      },
      orderBy: {
        _count: {
          pageVisited: 'desc'
        }
      }
    });

    res.json({
      pageStats: pageStats.map((stat: any) => ({
        page: stat.pageVisited,
        visits: stat._count.pageVisited,
        averageTimeSpent: stat._avg.timeSpent || 0
      }))
    });
  } catch (error) {
    console.error('Get page stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get daily visitor trends
router.get('/daily-trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

    const dailyStats = await prisma.visitorAnalytics.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: daysAgo
        }
      },
      _count: {
        sessionId: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json({
      dailyTrends: dailyStats.map((stat: any) => ({
        date: stat.createdAt.toISOString().split('T')[0],
        visitors: stat._count.sessionId
      }))
    });
  } catch (error) {
    console.error('Get daily trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 