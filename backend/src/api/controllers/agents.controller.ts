import { Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const createSchema = z.object({
  name: z.string().min(1),
});

export async function listAgents(req: AuthRequest, res: Response): Promise<void> {
  const agents = await prisma.agent.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { servers: true } } },
  });
  res.json(agents);
}

export async function createAgent(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const apiKey = `opk_${crypto.randomBytes(32).toString('hex')}`;
  const agent = await prisma.agent.create({
    data: { name: parsed.data.name, apiKey, userId: req.userId! },
  });
  res.status(201).json(agent);
}

export async function deleteAgent(req: AuthRequest, res: Response): Promise<void> {
  const agent = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!agent) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  await prisma.agent.delete({ where: { id: agent.id } });
  res.status(204).send();
}
