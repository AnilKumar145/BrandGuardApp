import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({
      status: 400,
      error_code: 'VALIDATION_ERROR',
      message: 'Email is required',
      details: [{ field: 'email', issue: 'Field required' }],
      timestamp: new Date().toISOString(),
    });
  }

  const user = db.getUser();
  res.json({
    access_token: 'bg_mock_access_token_' + Date.now(),
    refresh_token: 'bg_mock_refresh_token_' + Date.now(),
    token_type: 'bearer',
    expires_in: 3600,
    user: {
      id: user.id,
      email: email || user.email,
      full_name: user.name,
      role: user.role,
      avatar_url: user.avatarUrl,
    },
  });
});

// POST /api/v1/auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(401).json({
      status: 401,
      error_code: 'UNAUTHORIZED',
      message: 'Missing or invalid refresh token',
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    access_token: 'bg_mock_access_token_' + Date.now(),
    token_type: 'bearer',
    expires_in: 3600,
  });
});

// GET /api/v1/auth/me
router.get('/me', (_req: Request, res: Response) => {
  const user = db.getUser();
  res.json({
    id: user.id,
    email: user.email,
    full_name: user.name,
    role: user.role,
    avatar_url: user.avatarUrl,
    is_active: true,
    created_at: '2026-09-01T10:00:00Z',
  });
});

export default router;
