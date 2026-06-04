import { Router } from 'express';
import { getAlerts, getAllAlerts, getPingLogs, getStats } from '../controllers/metrics.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/alerts', getAllAlerts);
router.get('/stats', getStats);
router.get('/:id/logs', getPingLogs);
router.get('/:id/alerts', getAlerts);

export default router;
