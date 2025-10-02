import { pgTable, serial, text, timestamp, numeric } from 'drizzle-orm/pg-core';

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  walletAddress: text('wallet_address').notNull(),
  amountSol: numeric('amount_sol', { precision: 10, scale: 2 }).notNull(),
  amountRot: numeric('amount_rot', { precision: 20, scale: 0 }).notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});