import express from 'express';
import request from 'supertest';
import { listServers, createServer, deleteServer } from '../api/controllers/servers.controller';
import { errorHandler } from '../api/middleware/error.middleware';
import { prisma } from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  prisma: {
    server: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Inject userId as if auth middleware already ran
const withAuth = (req: express.Request, _res: express.Response, next: express.NextFunction) => {
  (req as any).userId = 'user-1';
  next();
};

const app = express();
app.use(express.json());
app.get('/servers', withAuth, listServers);
app.post('/servers', withAuth, createServer);
app.delete('/servers/:id', withAuth, deleteServer);
app.use(errorHandler);

const mockServer = prisma.server as jest.Mocked<typeof prisma.server>;

beforeEach(() => jest.clearAllMocks());

describe('GET /servers', () => {
  it('returns server list for the authenticated user', async () => {
    const servers = [{ id: 's-1', name: 'Prod API', url: 'https://api.example.com' }];
    mockServer.findMany.mockResolvedValueOnce(servers as never);
    const res = await request(app).get('/servers');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(servers);
  });
});

describe('POST /servers', () => {
  it('returns 400 for missing url', async () => {
    const res = await request(app).post('/servers').send({ name: 'Test' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid url', async () => {
    const res = await request(app).post('/servers').send({ name: 'Test', url: 'not-a-url' });
    expect(res.status).toBe(400);
  });

  it('creates and returns a server', async () => {
    const created = { id: 's-1', name: 'Prod', url: 'https://api.example.com', userId: 'user-1' };
    mockServer.create.mockResolvedValueOnce(created as never);
    const res = await request(app).post('/servers').send({ name: 'Prod', url: 'https://api.example.com' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('s-1');
  });
});

describe('DELETE /servers/:id', () => {
  it('returns 404 when server not found or not owned', async () => {
    mockServer.findFirst.mockResolvedValueOnce(null);
    const res = await request(app).delete('/servers/s-999');
    expect(res.status).toBe(404);
  });

  it('deletes the server and returns 204', async () => {
    mockServer.findFirst.mockResolvedValueOnce({ id: 's-1' } as never);
    mockServer.delete.mockResolvedValueOnce({} as never);
    const res = await request(app).delete('/servers/s-1');
    expect(res.status).toBe(204);
  });
});
