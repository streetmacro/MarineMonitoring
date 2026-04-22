import { Router, Request, Response } from 'express';
import { Ship } from '../models/Ship';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '100', active = 'true' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    
    let query = {};
    if (active === 'true') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      query = { lastUpdate: { $gte: fiveMinutesAgo } };
    }
    
    const ships = await Ship.find(query)
      .sort({ lastUpdate: -1 })
      .limit(limitNum);
    
    res.json(ships);
  } catch (error) {
    console.error('Error fetching ships:', error);
    res.status(500).json({ error: 'Failed to fetch ships' });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const [totalActive, shipTypes] = await Promise.all([
      Ship.countDocuments({ lastUpdate: { $gte: fiveMinutesAgo } }),
      Ship.aggregate([
        { $match: { lastUpdate: { $gte: fiveMinutesAgo } } },
        { $group: { _id: '$shipType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    res.json({
      totalActive,
      shipTypes
    });
  } catch (error) {
    console.error('Error fetching ship stats:', error);
    res.status(500).json({ error: 'Failed to fetch ship statistics' });
  }
});

export default router;
