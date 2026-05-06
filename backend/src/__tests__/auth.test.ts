import express from 'express';
import request from 'supertest';
import { register, login } from '../api/controllers/auth.controller.js';
import { errorHandler } from '../api/middleware/error.middleware.js';
import { prisma } from '../lib/prisma.js';

// Isolate from the real DB
jest.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.post('/auth/register', register);
app.post('/auth/login', login);
app.use(errorHandler);

const mockUser = prisma.user as jest.Mocked<typeof prisma.user>;

beforeEach(() => jest.clearAllMocks());

describe('POST /auth/register', () => {
  it('returns 400 for invalid body', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'bad' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when email already exists', async () => {
    mockUser.findUnique.mockResolvedValueOnce({ id: '1' } as never);
    const res = await request(app).post('/auth/register').send({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(409);
  });

  it('returns 201 with token on success', async () => {
    process.env.JWT_SECRET = 'test-secret';
    mockUser.findUnique.mockResolvedValueOnce(null);
    mockUser.create.mockResolvedValueOnce({ id: 'user-1' } as never);
    const res = await request(app).post('/auth/register').send({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
});

describe('POST /auth/login', () => {
  it('returns 401 when user not found', async () => {
    mockUser.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).post('/auth/login').send({
      email: 'x@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });
});
