import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { verifyJwtToken, TokenPayload } from '../lib/jwt.ts';

export interface AuthUser extends TokenPayload {
  uid: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  email_verified?: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // 1. Try verifying as native Cloud SQL JWT session token first
  const jwtUser = verifyJwtToken(token);
  if (jwtUser && jwtUser.uid) {
    req.user = jwtUser;
    return next();
  }

  // 2. Fallback to Firebase ID token verification
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
      email_verified: decodedToken.email_verified,
    };
    next();
  } catch (error) {
    console.error('Error verifying Auth token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
  }
};
