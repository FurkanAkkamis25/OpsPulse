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

export async function getAllAlerts(req: AuthRequest, res: Response): Promise<void> {
  const type = req.query.type as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  const userServers = await prisma.server.findMany({
    where: { userId: req.userId! },
    select: { id: true },
  });
  const serverIds = userServers.map((s) => s.id);

  const alerts = await prisma.alert.findMany({
    where: {
      serverId: { in: serverIds },
      ...(type ? { type: type as any } : {}),
    },
    orderBy: { sentAt: 'desc' },
    take: limit,
    include: { server: { select: { name: true } } },
  });

  res.json(alerts);
}

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  const servers = await prisma.server.findMany({
    where: { userId: req.userId! },
  });

  if (servers.length === 0) {
    res.json({ totalServers: 0, online: 0, offline: 0, avgHealthScore: null, avgLatency: null, bestServer: null, worstServer: null });
    return;
  }

  const online = servers.filter((s) => s.isActive).length;
  const scores = servers.filter((s) => s.healthScore !== null).map((s) => s.healthScore as number);
  const avgHealthScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const recentLogs = await prisma.pingLog.findMany({
    where: { serverId: { in: servers.map((s) => s.id) }, isUp: true, latency: { not: null } },
    orderBy: { checkedAt: 'desc' },
    take: 200,
  });
  const avgLatency = recentLogs.length
    ? Math.round(recentLogs.reduce((a, b) => a + (b.latency ?? 0), 0) / recentLogs.length)
    : null;

  const ranked = [...servers].filter((s) => s.healthScore !== null).sort((a, b) => (b.healthScore ?? 0) - (a.healthScore ?? 0));
  const bestServer = ranked[0] ? { name: ranked[0].name, healthScore: ranked[0].healthScore } : null;
  const worstServer = ranked[ranked.length - 1] ? { name: ranked[ranked.length - 1].name, healthScore: ranked[ranked.length - 1].healthScore } : null;

  res.json({ totalServers: servers.length, online, offline: servers.length - online, avgHealthScore, avgLatency, bestServer, worstServer });
}
