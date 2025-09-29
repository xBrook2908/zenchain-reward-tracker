import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Wallet table for storing user wallet addresses
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  label: text("label").notNull(),
  walletType: text("wallet_type").notNull().default("staking"), // 'staking', 'validator', 'both'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reward entries table for storing historical reward data
export const rewardEntries = pgTable("reward_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").references(() => wallets.id).notNull(),
  walletAddress: text("wallet_address").notNull(),
  rewardType: text("reward_type").notNull(), // 'staking' or 'validator'
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(), // ZTC amount
  amountUsd: decimal("amount_usd", { precision: 18, scale: 2 }), // USD equivalent
  era: integer("era").notNull(), // Zenchain era number
  blockNumber: integer("block_number").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet balance snapshots for tracking current balances
export const walletBalances = pgTable("wallet_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").references(() => wallets.id).notNull(),
  walletAddress: text("wallet_address").notNull(),
  totalStakingRewards: decimal("total_staking_rewards", { precision: 18, scale: 8 }).notNull().default("0"),
  totalValidatorRewards: decimal("total_validator_rewards", { precision: 18, scale: 8 }).notNull().default("0"),
  totalStakingRewardsUsd: decimal("total_staking_rewards_usd", { precision: 18, scale: 2 }).default("0"),
  totalValidatorRewardsUsd: decimal("total_validator_rewards_usd", { precision: 18, scale: 2 }).default("0"),
  currentStakedAmount: decimal("current_staked_amount", { precision: 18, scale: 8 }).default("0"),
  lastUpdateEra: integer("last_update_era").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Zenchain network status and configuration
export const networkStatus = pgTable("network_status", {
  id: varchar("id").primaryKey().default("zenchain"),
  currentEra: integer("current_era").notNull().default(0),
  currentBlock: integer("current_block").notNull().default(0),
  ztcPriceUsd: decimal("ztc_price_usd", { precision: 18, scale: 8 }).default("0"),
  totalStaked: decimal("total_staked", { precision: 18, scale: 8 }).default("0"),
  activeValidators: integer("active_validators").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Zod schemas for validation
export const insertWalletSchema = createInsertSchema(wallets).pick({
  address: true,
  label: true,
  walletType: true,
}).extend({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
  label: z.string().min(1, "Label is required").max(100, "Label too long"),
  walletType: z.enum(["staking", "validator", "both"]),
});

export const insertRewardEntrySchema = createInsertSchema(rewardEntries).pick({
  walletId: true,
  walletAddress: true,
  rewardType: true,
  amount: true,
  amountUsd: true,
  era: true,
  blockNumber: true,
  transactionHash: true,
  timestamp: true,
});

export const updateWalletBalanceSchema = createInsertSchema(walletBalances).pick({
  walletId: true,
  walletAddress: true,
  totalStakingRewards: true,
  totalValidatorRewards: true,
  totalStakingRewardsUsd: true,
  totalValidatorRewardsUsd: true,
  currentStakedAmount: true,
  lastUpdateEra: true,
});

// TypeScript types
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertRewardEntry = z.infer<typeof insertRewardEntrySchema>;
export type RewardEntry = typeof rewardEntries.$inferSelect;
export type WalletBalance = typeof walletBalances.$inferSelect;
export type NetworkStatus = typeof networkStatus.$inferSelect;

// API response types
export interface WalletWithBalance extends Wallet {
  balance: WalletBalance | null;
  totalRewards: number;
  totalRewardsUsd: number;
  isConnected: boolean;
}

export interface RewardHistoryEntry {
  id: string;
  walletAddress: string;
  walletLabel: string;
  rewardType: 'staking' | 'validator';
  amount: number;
  amountUsd: number | null;
  era: number;
  transactionHash: string;
  timestamp: string;
}

export interface DashboardStats {
  totalWallets: number;
  activeWallets: number;
  totalRewards: number;
  totalRewardsUsd: number;
  rewardChange24h: number;
  lastUpdateTime: string;
}

export interface ChartDataPoint {
  date: string;
  stakingRewards: number;
  validatorRewards: number;
  totalRewards: number;
}
