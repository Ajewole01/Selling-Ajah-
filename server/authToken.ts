import crypto from 'node:crypto';

export interface AdminTokenPayload {
  sub: string;
  username: string;
  role: 'super_admin' | 'admin';
  iat: number;
  exp: number;
}

const TOKEN_LIFETIME_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET_KEY;

  if (!secret) {
    throw new Error('ADMIN_SECRET_KEY is not configured.');
  }

  if (secret.length < 32) {
    throw new Error('ADMIN_SECRET_KEY must be at least 32 characters long.');
  }

  return secret;
}

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(value: string): string {
  return crypto
    .createHmac('sha256', getSecret())
    .update(value)
    .digest('base64url');
}

export function createAdminToken(user: {
  id: string;
  username: string;
  role: 'super_admin' | 'admin';
}): string {
  const now = Math.floor(Date.now() / 1000);

  const payload: AdminTokenPayload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS
  };

  const encodedPayload = encode(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');

    if (parts.length !== 2) {
      return null;
    }

    const [encodedPayload, suppliedSignature] = parts;

    const expectedSignature = sign(encodedPayload);

    const suppliedBuffer = Buffer.from(suppliedSignature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (suppliedBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
      return null;
    }

    const payload = JSON.parse(
      decode(encodedPayload)
    ) as AdminTokenPayload;

    if (
      !payload.sub ||
      !payload.username ||
      !payload.role ||
      !payload.iat ||
      !payload.exp
    ) {
      return null;
    }

    if (
      payload.role !== 'admin' &&
      payload.role !== 'super_admin'
    ) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}