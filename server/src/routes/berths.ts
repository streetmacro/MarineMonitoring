/**
 * Berth Routes - REST API for Port Berth Management
 * 
 * Business Logic:
 * - initializeBerths(): Seeds database with 20 predefined berth locations
 * - GET /: Lists all berths sorted by ID with current status
 * - GET /stats/overview: Aggregates berth counts by status for dashboard
 * - PATCH /:id: Updates berth status (FREE/REPAIR/AWAITING) with validation
 * 
 * Status transitions are controlled by the Berth model's enum validation.
 * The BerthMarker pre-update hook automatically tracks lastUpdated timestamps.
 */

import { Router, Request, Response } from 'express';
import { Berth } from '../models/Berth';
import { BerthStatus } from '../types';

const router = Router();

const berthCoordinates: [number, number][] = [
  [59.462066, 24.647843],
  [59.463053, 24.647516],
  [59.464350, 24.647655],
  [59.465364, 24.647763],
  [59.465538, 24.648889],
  [59.464993, 24.650649],
  [59.464203, 24.650810],
  [59.463532, 24.649941],
  [59.462388, 24.650166],
  [59.461008, 24.652258],
  [59.460403, 24.651453],
  [59.459662, 24.651389],
  [59.459040, 24.652483],
  [59.458419, 24.653760],
  [59.457797, 24.655133],
  [59.457094, 24.656196],
  [59.46090, 24.65450],
  [59.46039, 24.65605],
  [59.45974, 24.65813],
  [59.45924, 24.65935],
  [59.45881, 24.66023]
];

/**
 * Database seeding function - runs on server startup
 * Creates 20 berths at predefined GPS coordinates if database is empty
 * Coordinates cover the Kopli 103 port area in Tallinn
 */
export const initializeBerths = async (): Promise<void> => {
  try {
    const count = await Berth.countDocuments();
    if (count === 0) {
      const berths = berthCoordinates.map((coords, index) => ({
        id: index + 1,
        coords,
        status: 'FREE' as BerthStatus,
        name: `Berth ${index + 1}`
      }));
      
      await Berth.insertMany(berths);
      console.log(`Initialized ${berths.length} berths`);
    } else {
      console.log(`${count} berths already exist`);
    }
  } catch (error) {
    console.error('Error initializing berths:', error);
  }
};

/**
 * GET /api/berths
 * Returns all berths sorted by ID (1, 2, 3...)
 * Used by frontend to render berth markers on map and list in sidebar
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const berths = await Berth.find().sort({ id: 1 });
    res.json(berths);
  } catch (error) {
    console.error('Error fetching berths:', error);
    res.status(500).json({ error: 'Failed to fetch berths' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const berthId = parseInt(req.params.id, 10);
    const berth = await Berth.findOne({ id: berthId });
    
    if (!berth) {
      res.status(404).json({ error: 'Berth not found' });
      return;
    }
    
    res.json(berth);
  } catch (error) {
    console.error('Error fetching berth:', error);
    res.status(500).json({ error: 'Failed to fetch berth' });
  }
});

/**
 * PATCH /api/berths/:id
 * Core business logic: Updates berth status with validation
 * 
 * Valid transitions: Any status -> FREE, REPAIR, or AWAITING
 * - FREE: Berth becomes available for docking
 * - REPAIR: Marks berth as under maintenance (blocks docking)
 * - AWAITING: Vessel assigned but not yet docked
 * 
 * The model's runValidators ensures only valid enum values are accepted.
 * lastUpdated timestamp is auto-updated by the Berth model pre-hook.
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const berthId = parseInt(req.params.id, 10);
    const { status } = req.body;
    
    // Validate status against allowed enum values
    if (!status || !['FREE', 'REPAIR', 'AWAITING'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be FREE, REPAIR, or AWAITING' });
      return;
    }
    
    // Update berth status and trigger pre-hook for lastUpdated
    const berth = await Berth.findOneAndUpdate(
      { id: berthId },
      { status },
      { new: true, runValidators: true }
    );
    
    if (!berth) {
      res.status(404).json({ error: 'Berth not found' });
      return;
    }
    
    res.json(berth);
  } catch (error) {
    console.error('Error updating berth:', error);
    res.status(500).json({ error: 'Failed to update berth' });
  }
});

/**
 * GET /api/berths/stats/overview
 * Aggregation endpoint for dashboard statistics
 * Returns counts: total, free, repair, awaiting
 * Used by frontend to display status summary cards
 */
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    // MongoDB aggregation: group by status and count documents
    const stats = await Berth.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const overview = {
      total: await Berth.countDocuments(),
      free: stats.find(s => s._id === 'FREE')?.count || 0,
      repair: stats.find(s => s._id === 'REPAIR')?.count || 0,
      awaiting: stats.find(s => s._id === 'AWAITING')?.count || 0
    };
    
    res.json(overview);
  } catch (error) {
    console.error('Error fetching berth stats:', error);
    res.status(500).json({ error: 'Failed to fetch berth statistics' });
  }
});

export default router;
