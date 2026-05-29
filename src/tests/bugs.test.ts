import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { db } from '../database/db';
import { initDatabase } from '../database/db';
import { resetRateLimits } from '../middleware/rateLimiter';
import fs from 'fs';
import path from 'path';

beforeEach(() => {
  db.exec('DROP TABLE IF EXISTS urls');
  initDatabase();
  resetRateLimits();
});

// ─── Health Check ────────────────────────────────────────────────────

describe('Health Check', () => {
  it('GET /health should return 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
