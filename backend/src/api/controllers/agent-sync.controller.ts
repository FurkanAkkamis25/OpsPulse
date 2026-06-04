import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { AgentRequest } from '../middleware/agent.middleware';
import { analyzeServer } from '../../services/ai.service';
import { sendPushNotification } from '../../services/notification.service';

export async function getAssignedServers(req: AgentRequest, res: Response): Promise<void> {
  const servers = await prisma.server.findMany({
    where: { agentId: req.agentId! },
    select: { id: true, name: true, url: true, threshold: true },
  });
  res.json(servers);
}

const resultSchema = z.object({
  results: z.array(z.object({
    serverId: z.string(),
    latency: z.number().int().nullable(),
    statusCode: z.number().int().nullable(),
    isUp: z.boolean(),
  })),
});

export async function pushResults(req: AgentRequest, res: Response): Promise<void> {
  const parsed = resultSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  for (const result of parsed.data.results) {
    const server = await prisma.server.findFirst({
      where: { id: result.serverId, agentId: req.agentId! },
      include: { user: true },
    });
    if (!server) continue;

    await prisma.pingLog.create({
      data: {
        serverId: server.id,
        latency: result.latency,
        statusCode: result.statusCode,
        isUp: result.isUp,
      },
    });

    const wasActive = server.isActive;
    await prisma.server.update({
      where: { id: server.id },
      data: { isActive: result.isUp },
    });

    if (!result.isUp) {
      if (wasActive) {
        await prisma.alert.create({
          data: { serverId: server.id, type: 'DOWN', message: `${server.name} is unreachable` },
        });
        if (server.user.fcmToken) {
          await sendPushNotification(server.user.fcmToken, 'Server Down', `${server.name} is unreachable`);
        }
      }
      continue;
    }

    if (!wasActive) {
      await prisma.alert.create({
        data: { serverId: server.id, type: 'RECOVERED', message: `${server.name} is back online` },
      });
      if (server.user.fcmToken) {
        await sendPushNotification(server.user.fcmToken, 'Server Recovered', `${server.name} is back online`);
      }
    }

    if (server.threshold && result.latency && result.latency > server.threshold) {
      await prisma.alert.create({
        data: {
          serverId: server.id,
          type: 'THRESHOLD_BREACH',
          message: `${server.name} latency ${result.latency}ms exceeds threshold ${server.threshold}ms`,
        },
      });
      if (server.user.fcmToken) {
        await sendPushNotification(
          server.user.fcmToken,
          'Latency Alert',
          `${server.name}: ${result.latency}ms (threshold: ${server.threshold}ms)`
        );
      }
    }

    const recentLogs = await prisma.pingLog.findMany({
      where: { serverId: server.id, isUp: true, latency: { not: null } },
      orderBy: { checkedAt: 'desc' },
      take: 50,
    });

    if (recentLogs.length >= 5) {
      const latencies = recentLogs.map((l) => l.latency as number);
      const analysis = await analyzeServer(latencies);
      if (analysis) {
        await prisma.server.update({
          where: { id: server.id },
          data: {
            healthScore: analysis.healthScore,
            threshold: server.threshold ?? analysis.dynamicThreshold,
          },
        });

        if (analysis.predictedFailure && server.user.fcmToken) {
          await prisma.alert.create({
            data: {
              serverId: server.id,
              type: 'PREDICTED_FAILURE',
              message: `${server.name} predicted to fail soon (health score: ${analysis.healthScore})`,
            },
          });
          await sendPushNotification(
            server.user.fcmToken,
            'Predicted Failure',
            `${server.name} may go down soon (score: ${analysis.healthScore})`
          );
        }
      }
    }
  }

  res.json({ ok: true, processed: parsed.data.results.length });
}
