import { Router } from 'express';
import { getAlerts, getPingLogs } from '../controllers/metrics.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/:id/logs', getPingLogs);
router.get('/:id/alerts', getAlerts);

export default router;
