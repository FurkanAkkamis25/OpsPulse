import { Router } from 'express';
import { createServer, deleteServer, listServers, updateThreshold } from '../controllers/servers.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', listServers);
router.post('/', createServer);
router.delete('/:id', deleteServer);
router.patch('/:id/threshold', updateThreshold);

export default router;
