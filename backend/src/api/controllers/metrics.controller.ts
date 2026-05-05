import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getPingLogs(req: AuthRequest, res: Response): Promise<void> {
  const server = await prisma.server.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!server) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const limit = Math.min(Number(req.query.limit) || 100, 1000);
  const logs = await prisma.pingLog.findMany({
    where: { serverId: server.id },
    orderBy: { checkedAt: 'desc' },
    take: limit,
  });
  res.json(logs);
}

export async function getAlerts(req: AuthRequest, res: Response): Promise<void> {
  const server = await prisma.server.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!server) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const alerts = await prisma.alert.findMany({
    where: { serverId: server.id },
    orderBy: { sentAt: 'desc' },
    take: 50,
  });
  res.json(alerts);
}
