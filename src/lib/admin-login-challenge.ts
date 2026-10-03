import jwt from 'jsonwebtoken';

interface AdminLoginChallengePayload {
  userId: string;
  challengeId: string;
  purpose: 'ADMIN_SMS_LOGIN';
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be configured.');
  return secret;
}

export function signAdminLoginChallengeToken(payload: Omit<AdminLoginChallengePayload, 'purpose'>) {
  return jwt.sign({ ...payload, purpose: 'ADMIN_SMS_LOGIN' }, getJwtSecret(), { expiresIn: '5m' });
}

export function verifyAdminLoginChallengeToken(token: string): AdminLoginChallengePayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as AdminLoginChallengePayload;
    if (payload.purpose !== 'ADMIN_SMS_LOGIN' || !payload.userId || !payload.challengeId) return null;
    return payload;
  } catch {
    return null;
  }
}