import 'dotenv/config';
import express from 'express';
import authRoutes from './api/routes/auth.routes';
import serverRoutes from './api/routes/servers.routes';
import metricsRoutes from './api/routes/metrics.routes';
import { errorHandler } from './api/middleware/error.middleware';
import { securityHeaders, authLimiter, apiLimiter } from './api/middleware/security.middleware';
import { startScheduler } from './pinger/scheduler';

const app = express();

app.use(securityHeaders);
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/servers', apiLimiter, serverRoutes);
app.use('/api/servers', apiLimiter, metricsRoutes);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  startScheduler();
});
