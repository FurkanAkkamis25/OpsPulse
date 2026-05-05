import { Router } from 'express';
import { login, register, updateFcmToken } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/fcm-token', requireAuth, updateFcmToken);

export default router;
