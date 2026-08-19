import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  passwordHash: text('password_hash'),
  verificationToken: text('verification_token'),
  resetToken: text('reset_token'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Trips Table
export const trips = pgTable('trips', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  customName: text('custom_name').notNull(),
  startLocation: text('start_location').notNull(),
  destination: text('destination').notNull(),
  travelers: integer('travelers').notNull().default(1),
  days: integer('days').notNull().default(1),
  travelDates: text('travel_dates'),
  budgetTier: text('budget_tier').default('moderate'),
  customBudget: integer('custom_budget'),
  totalPlannedBudget: integer('total_planned_budget'),
  transportMode: text('transport_mode').default('car'),
  planData: text('plan_data'), // JSON serialized
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Users Relations
export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
}));

// Trips Relations
export const tripsRelations = relations(trips, ({ one }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.uid],
  }),
}));
