import { db } from './index.ts';
import { users, trips } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signJwtToken } from '../lib/jwt.ts';

export async function getOrCreateUser(
  uid: string, 
  email: string, 
  displayName?: string | null, 
  photoUrl?: string | null,
  emailVerified?: boolean
) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
        emailVerified: !!emailVerified,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || undefined,
          photoUrl: photoUrl || undefined,
          emailVerified: emailVerified !== undefined ? emailVerified : undefined,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to get or create user in Cloud SQL:', error);
    throw new Error('Database user sync failed', { cause: error });
  }
}

export async function registerUserWithPassword(
  email: string,
  passwordPlain: string,
  displayName?: string
) {
  const cleanEmail = email.trim().toLowerCase();
  
  // Check if user already exists
  const existing = await db.select().from(users).where(eq(users.email, cleanEmail));
  if (existing.length > 0) {
    throw new Error('An account with this email already exists.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordPlain, salt);
  const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const verificationToken = `verif_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

  const inserted = await db.insert(users)
    .values({
      uid,
      email: cleanEmail,
      displayName: displayName?.trim() || cleanEmail.split('@')[0],
      passwordHash,
      verificationToken,
      emailVerified: false,
    })
    .returning();

  const user = inserted[0];
  const token = signJwtToken({
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    picture: user.photoUrl,
    email_verified: user.emailVerified ?? false,
  });

  return { user, token };
}

export async function loginUserWithPassword(email: string, passwordPlain: string) {
  const cleanEmail = email.trim().toLowerCase();
  const found = await db.select().from(users).where(eq(users.email, cleanEmail));

  if (found.length === 0 || !found[0].passwordHash) {
    throw new Error('Invalid email or password.');
  }

  const user = found[0];
  const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  const token = signJwtToken({
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    picture: user.photoUrl,
    email_verified: user.emailVerified ?? false,
  });

  return { user, token };
}

export async function verifyUserEmailByUid(uid: string) {
  const updated = await db.update(users)
    .set({ emailVerified: true, verificationToken: null, updatedAt: new Date() })
    .where(eq(users.uid, uid))
    .returning();
  return updated[0];
}

export async function requestPasswordReset(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const found = await db.select().from(users).where(eq(users.email, cleanEmail));
  if (found.length === 0) {
    // Return true silently for security
    return { success: true };
  }

  const resetToken = `rst_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
  await db.update(users)
    .set({ resetToken, updatedAt: new Date() })
    .where(eq(users.email, cleanEmail));

  return { success: true, resetToken };
}

export async function resetPasswordWithToken(resetToken: string, newPasswordPlain: string) {
  const found = await db.select().from(users).where(eq(users.resetToken, resetToken));
  if (found.length === 0) {
    throw new Error('Invalid or expired password reset token.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPasswordPlain, salt);

  await db.update(users)
    .set({ passwordHash, resetToken: null, updatedAt: new Date() })
    .where(eq(users.id, found[0].id));

  return { success: true };
}

export async function getUserTrips(userId: string) {
  try {
    return await db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.createdAt));
  } catch (error) {
    console.error('Failed to fetch user trips from Cloud SQL:', error);
    throw new Error('Failed to load trips from database', { cause: error });
  }
}

export async function saveUserTrip(tripData: {
  id: string;
  userId: string;
  customName: string;
  startLocation: string;
  destination: string;
  travelers: number;
  days: number;
  travelDates?: string;
  budgetTier?: string;
  customBudget?: number;
  totalPlannedBudget?: number;
  transportMode?: string;
  planData?: string;
  notes?: string;
}) {
  try {
    const result = await db.insert(trips)
      .values(tripData)
      .onConflictDoUpdate({
        target: trips.id,
        set: {
          customName: tripData.customName,
          travelDates: tripData.travelDates,
          budgetTier: tripData.budgetTier,
          customBudget: tripData.customBudget,
          totalPlannedBudget: tripData.totalPlannedBudget,
          notes: tripData.notes,
          planData: tripData.planData,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to save user trip to Cloud SQL:', error);
    throw new Error('Failed to save trip to database', { cause: error });
  }
}

export async function deleteUserTrip(tripId: string, userId: string) {
  try {
    await db.delete(trips).where(and(eq(trips.id, tripId), eq(trips.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error('Failed to delete trip from Cloud SQL:', error);
    throw new Error('Failed to delete trip from database', { cause: error });
  }
}
