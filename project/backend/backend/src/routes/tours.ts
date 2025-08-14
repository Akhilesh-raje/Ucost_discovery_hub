import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create a new tour
router.post('/', async (req, res) => {
  try {
    const { name, userId, exhibitIds } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ error: 'Tour name and user ID are required' });
    }

    // Create the tour
    const tour = await prisma.tour.create({
      data: {
        name,
        userId
      }
    });

    // Add exhibits to tour if provided
    if (exhibitIds && Array.isArray(exhibitIds) && exhibitIds.length > 0) {
      const tourExhibits = exhibitIds.map((exhibitId: string, index: number) => ({
        tourId: tour.id,
        exhibitId,
        orderIndex: index
      }));

      await prisma.tourExhibit.createMany({
        data: tourExhibits.map((item: any) => ({
          tourId: item.tourId,
          exhibitId: item.exhibitId,
          order: item.orderIndex
        }))
      });
    }

    // Get the complete tour with exhibits
    const completeTour = await prisma.tour.findUnique({
      where: { id: tour.id },
      include: {
        tourExhibits: {
          include: {
            exhibit: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    res.status(201).json({
      message: 'Tour created successfully',
      tour: completeTour
    });
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tour by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        tourExhibits: {
          include: {
            exhibit: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    res.json({ tour });
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update tour
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, exhibitIds } = req.body;

    // Check if tour exists
    const existingTour = await prisma.tour.findUnique({
      where: { id }
    });

    if (!existingTour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Update tour name if provided
    if (name) {
      await prisma.tour.update({
        where: { id },
        data: { name }
      });
    }

    // Update tour exhibits if provided
    if (exhibitIds && Array.isArray(exhibitIds)) {
      // Remove existing exhibits
      await prisma.tourExhibit.deleteMany({
        where: { tourId: id }
      });

      // Add new exhibits
      if (exhibitIds.length > 0) {
        const tourExhibits = exhibitIds.map((exhibitId: string, index: number) => ({
          tourId: id,
          exhibitId,
          order: index
        }));

        await prisma.tourExhibit.createMany({
          data: tourExhibits
        });
      }
    }

    // Get the updated tour
    const updatedTour = await prisma.tour.findUnique({
      where: { id },
      include: {
        tourExhibits: {
          include: {
            exhibit: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    res.json({
      message: 'Tour updated successfully',
      tour: updatedTour
    });
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete tour
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tour exists
    const tour = await prisma.tour.findUnique({
      where: { id }
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Delete tour (cascade will delete tour exhibits)
    await prisma.tour.delete({
      where: { id }
    });

    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add exhibit to tour
router.post('/:id/exhibits', async (req, res) => {
  try {
    const { id } = req.params;
    const { exhibitId } = req.body;

    if (!exhibitId) {
      return res.status(400).json({ error: 'Exhibit ID is required' });
    }

    // Check if tour exists
    const tour = await prisma.tour.findUnique({
      where: { id }
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Get current order index
    const currentExhibits = await prisma.tourExhibit.findMany({
      where: { tourId: id },
      orderBy: { order: 'desc' },
      take: 1
    });

    const orderIndex = currentExhibits.length > 0 ? currentExhibits[0].order + 1 : 0;

    // Add exhibit to tour
    await prisma.tourExhibit.create({
      data: {
        tourId: id,
        exhibitId,
        order: orderIndex
      }
    });

    res.json({ message: 'Exhibit added to tour successfully' });
  } catch (error) {
    console.error('Add exhibit to tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove exhibit from tour
router.delete('/:id/exhibits/:exhibitId', async (req, res) => {
  try {
    const { id, exhibitId } = req.params;

    // Check if tour exhibit exists
    const tourExhibit = await prisma.tourExhibit.findUnique({
      where: {
        tourId_exhibitId: {
          tourId: id,
          exhibitId
        }
      }
    });

    if (!tourExhibit) {
      return res.status(404).json({ error: 'Exhibit not found in tour' });
    }

    // Remove exhibit from tour
    await prisma.tourExhibit.delete({
      where: {
        tourId_exhibitId: {
          tourId: id,
          exhibitId
        }
      }
    });

    res.json({ message: 'Exhibit removed from tour successfully' });
  } catch (error) {
    console.error('Remove exhibit from tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 