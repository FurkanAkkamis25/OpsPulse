import { Router } from 'express';
import { requireAgentKey } from '../middleware/agent.middleware';
import { getAssignedServers, pushResults } from '../controllers/agent-sync.controller';

const router = Router();

router.use(requireAgentKey);

router.get('/servers', getAssignedServers);
router.post('/results', pushResults);

export default router;
