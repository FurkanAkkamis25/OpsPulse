import 'dotenv/config';
import express from 'express';
import authRoutes from './api/routes/auth.routes';
import serverRoutes from './api/routes/servers.routes';
import metricsRoutes from './api/routes/metrics.routes';
import { errorHandler } from './api/middleware/error.middleware';
import { startScheduler } from './pinger/scheduler';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/servers', metricsRoutes);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  startScheduler();
});
