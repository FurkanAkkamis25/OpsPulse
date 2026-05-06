import { pingServer } from '../pinger/engine';
import { prisma } from '../lib/prisma';
import * as aiService from '../services/ai.service';
import * as notifService from '../services/notification.service';
import axios from 'axios';

jest.mock('../lib/prisma', () => ({
  prisma: {
    server: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    pingLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    alert: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../services/ai.service');
jest.mock('../services/notification.service');
jest.mock('axios');

const mockServer = prisma.server as jest.Mocked<typeof prisma.server>;
const mockPingLog = prisma.pingLog as jest.Mocked<typeof prisma.pingLog>;
const mockAlert = prisma.alert as jest.Mocked<typeof prisma.alert>;
const mockAi = aiService as jest.Mocked<typeof aiService>;
const mockNotif = notifService as jest.Mocked<typeof notifService>;
const mockAxios = axios as jest.Mocked<typeof axios>;

const baseServer = {
  id: 's-1',
  name: 'Test Server',
  url: 'https://api.example.com',
  isActive: true,
  threshold: null,
  user: { fcmToken: null },
};

beforeEach(() => jest.clearAllMocks());

describe('pingServer', () => {
  it('does nothing when server is inactive', async () => {
    mockServer.findUnique.mockResolvedValueOnce({ ...baseServer, isActive: false } as never);
    await pingServer('s-1');
    expect(mockPingLog.create).not.toHaveBeenCalled();
  });

  it('records DOWN log and creates alert when server unreachable', async () => {
    mockServer.findUnique.mockResolvedValueOnce(baseServer as never);
    mockAxios.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    mockPingLog.create.mockResolvedValueOnce({} as never);
    mockAlert.create.mockResolvedValueOnce({} as never);

    await pingServer('s-1');

    expect(mockPingLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isUp: false, latency: null }) })
    );
    expect(mockAlert.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'DOWN' }) })
    );
  });

  it('records UP log when server responds', async () => {
    mockServer.findUnique.mockResolvedValueOnce(baseServer as never);
    mockAxios.get.mockResolvedValueOnce({ status: 200 });
    mockPingLog.create.mockResolvedValueOnce({} as never);
    mockPingLog.findMany.mockResolvedValueOnce([]); // not enough logs for AI

    await pingServer('s-1');

    expect(mockPingLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isUp: true }) })
    );
    expect(mockAlert.create).not.toHaveBeenCalled();
  });

  it('creates THRESHOLD_BREACH alert and sends FCM when latency exceeds threshold', async () => {
    const server = { ...baseServer, threshold: 100, user: { fcmToken: 'fcm-token-123' } };
    mockServer.findUnique.mockResolvedValueOnce(server as never);
    // Simulate slow response by overriding Date.now
    let callCount = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => callCount++ === 0 ? 0 : 500);
    mockAxios.get.mockResolvedValueOnce({ status: 200 });
    mockPingLog.create.mockResolvedValueOnce({} as never);
    mockPingLog.findMany.mockResolvedValueOnce([]);
    mockAlert.create.mockResolvedValueOnce({} as never);
    mockNotif.sendPushNotification.mockResolvedValueOnce();

    await pingServer('s-1');

    expect(mockAlert.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'THRESHOLD_BREACH' }) })
    );
    expect(mockNotif.sendPushNotification).toHaveBeenCalledWith('fcm-token-123', expect.any(String), expect.any(String));
    jest.restoreAllMocks();
  });

  it('calls AI service and updates server when 10+ logs exist', async () => {
    mockServer.findUnique.mockResolvedValueOnce(baseServer as never);
    mockAxios.get.mockResolvedValueOnce({ status: 200 });
    mockPingLog.create.mockResolvedValueOnce({} as never);
    const logs = Array.from({ length: 15 }, (_, i) => ({ latency: 100 + i, isUp: true }));
    mockPingLog.findMany.mockResolvedValueOnce(logs as never);
    mockAi.analyzeServer.mockResolvedValueOnce({ healthScore: 85, dynamicThreshold: 200, predictedFailure: false });
    mockServer.update.mockResolvedValueOnce({} as never);

    await pingServer('s-1');

    expect(mockAi.analyzeServer).toHaveBeenCalled();
    expect(mockServer.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ healthScore: 85 }) })
    );
  });
});
