import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { pingServer } from './engine';

export function startScheduler(): void {
  const intervalSeconds = Number(process.env.PING_INTERVAL_SECONDS) || 60;
  // node-cron minimum granularity is 1 second
  const expression = `*/${intervalSeconds} * * * * *`;

  cron.schedule(expression, async () => {
    const servers = await prisma.server.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    // Fan out pings concurrently; individual errors don't crash the scheduler
    await Promise.allSettled(servers.map((s) => pingServer(s.id)));
  });

  console.log(`Pinger started — interval: ${intervalSeconds}s`);
}
