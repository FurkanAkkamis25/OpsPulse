import axios from 'axios';
import { prisma } from '../lib/prisma';
import { analyzeServer } from '../services/ai.service';
import { sendPushNotification } from '../services/notification.service';

export async function pingServer(serverId: string): Promise<void> {
  const server = await prisma.server.findUnique({
    where: { id: serverId },
    include: { user: true },
  });
  if (!server || !server.isActive) return;

  const start = Date.now();
  let latency: number | null = null;
  let statusCode: number | null = null;
  let isUp = false;

  try {
    const res = await axios.get(server.url, { timeout: 10000 });
    latency = Date.now() - start;
    statusCode = res.status;
    isUp = res.status < 400;
  } catch {
    latency = null;
    isUp = false;
  }

  await prisma.pingLog.create({
    data: { serverId, latency, statusCode, isUp },
  });

  const wasActive = server.isActive;
  await prisma.server.update({
    where: { id: serverId },
    data: { isActive: isUp },
  });

  if (!isUp) {
    if (wasActive) {
      await prisma.alert.create({
        data: { serverId, type: 'DOWN', message: `${server.name} is unreachable` },
      });
      if (server.user.fcmToken) {
        await sendPushNotification(
          server.user.fcmToken,
          'Server Down',
          `${server.name} is unreachable`
        );
      }
    }
    return;
  }

  if (!wasActive) {
    await prisma.alert.create({
      data: { serverId, type: 'RECOVERED', message: `${server.name} is back online` },
    });
    if (server.user.fcmToken) {
      await sendPushNotification(
        server.user.fcmToken,
        'Server Recovered',
        `${server.name} is back online`
      );
    }
  }

  // Check latency against threshold
  if (server.threshold && latency && latency > server.threshold) {
    await prisma.alert.create({
      data: {
        serverId,
        type: 'THRESHOLD_BREACH',
        message: `${server.name} latency ${latency}ms exceeds threshold ${server.threshold}ms`,
      },
    });
    if (server.user.fcmToken) {
      await sendPushNotification(
        server.user.fcmToken,
        'Latency Alert',
        `${server.name}: ${latency}ms (threshold: ${server.threshold}ms)`
      );
    }
  }

  // Every 10 pings, run AI analysis
  const recentLogs = await prisma.pingLog.findMany({
    where: { serverId, isUp: true, latency: { not: null } },
    orderBy: { checkedAt: 'desc' },
    take: 50,
  });

  if (recentLogs.length >= 5) {
    const latencies = recentLogs.map((l) => l.latency as number);
    const analysis = await analyzeServer(latencies);
    if (analysis) {
      await prisma.server.update({
        where: { id: serverId },
        data: {
          healthScore: analysis.healthScore,
          threshold: server.threshold ?? analysis.dynamicThreshold,
        },
      });

      if (analysis.predictedFailure && server.user.fcmToken) {
        await prisma.alert.create({
          data: {
            serverId,
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
