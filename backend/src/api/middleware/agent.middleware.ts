import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export interface AgentRequest extends Request {
  agentId?: string;
}

export async function requireAgentKey(req: AgentRequest, res: Response, next: NextFunction): Promise<void> {
  const apiKey = req.headers['x-agent-key'] as string | undefined;
  if (!apiKey) {
    res.status(401).json({ error: 'Missing x-agent-key header' });
    return;
  }

  const agent = await prisma.agent.findUnique({ where: { apiKey } });
  if (!agent) {
    res.status(401).json({ error: 'Invalid agent key' });
    return;
  }

  await prisma.agent.update({
    where: { id: agent.id },
    data: { lastSeen: new Date() },
  });

  req.agentId = agent.id;
  next();
}
