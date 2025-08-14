import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Save user profile (onboarding data)
router.post('/profile', async (req, res) => {
  try {
    const { email, name, preferences } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { email },
        data: {
          name: name || user.name
        }
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || '',
          password: '', // No password for kiosk users
          role: 'user'
        }
      });
    }

    res.json({
      message: 'User profile saved successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Save user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user tours
router.get('/:userId/tours', async (req, res) => {
  try {
    const { userId } = req.params;

    const tours = await prisma.tour.findMany({
      where: { userId },
      include: {
        tourExhibits: {
          include: {
            exhibit: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ tours });
  } catch (error) {
    console.error('Get user tours error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 