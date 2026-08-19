import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'triptale-cloudsql-jwt-secret-key-2026';

export interface TokenPayload {
  uid: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  email_verified?: boolean;
}

export function signJwtToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
