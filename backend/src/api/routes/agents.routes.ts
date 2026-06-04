import { Router } from 'express';
import { listAgents, createAgent, deleteAgent } from '../controllers/agents.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', listAgents);
router.post('/', createAgent);
router.delete('/:id', deleteAgent);

export default router;
