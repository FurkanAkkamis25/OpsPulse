import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const createSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
});

const updateThresholdSchema = z.object({
  threshold: z.number().int().positive(),
});

export async function listServers(req: AuthRequest, res: Response): Promise<void> {
  const servers = await prisma.server.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
  });
  res.json(servers);
}

export async function createServer(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const server = await prisma.server.create({
    data: { ...parsed.data, userId: req.userId! },
  });
  res.status(201).json(server);
}

export async function deleteServer(req: AuthRequest, res: Response): Promise<void> {
  const server = await prisma.server.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!server) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  await prisma.server.delete({ where: { id: server.id } });
  res.status(204).send();
}

export async function updateThreshold(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateThresholdSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const server = await prisma.server.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!server) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const updated = await prisma.server.update({
    where: { id: server.id },
    data: { threshold: parsed.data.threshold },
  });
  res.json(updated);
}
