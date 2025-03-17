import type { InferModel } from "drizzle-orm"
import { pgTable, serial, text, boolean, integer, timestamp, pgEnum, decimal, json } from "drizzle-orm/pg-core"

// Role enum for users
export const roleEnum = pgEnum("role", ["admin", "participant"])

// Question types enum
export const questionTypeEnum = pgEnum("question_type", ["multiple_choice", "true_false"])

// Tier types for gacha rewards
export const tierEnum = pgEnum("tier", ["bronze", "silver", "gold", "custom"])

// Users table (updated for NextAuth.js)
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  password: text("password"), // Password field for NextAuth
  role: roleEnum("role").notNull().default("participant"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// NextAuth.js required tables
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
})

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: [vt.identifier, vt.token],
  }),
)

// Game Rooms table
export const gameRooms = pgTable("game_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  adminId: text("admin_id")
    .notNull()
    .references(() => users.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Room Participants junction table
export const roomParticipants = pgTable("room_participants", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => gameRooms.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  uniqueCode: text("unique_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => gameRooms.id),
  questionText: text("question_text").notNull(),
  questionType: questionTypeEnum("question_type").notNull(),
  options: json("options").$type<string[]>(),
  correctAnswer: text("correct_answer").notNull(),
  tier: tierEnum("tier").notNull(),
  solved: boolean("solved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// User Question Attempts junction table
export const userQuestionAttempts = pgTable("user_question_attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
  correct: boolean("correct").notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
})

// Gacha Reward Tiers table
export const gachaRewardTiers = pgTable("gacha_reward_tiers", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => gameRooms.id),
  name: text("name").notNull(),
  tier: tierEnum("tier").notNull(),
  probability: decimal("probability", { precision: 5, scale: 2 }).notNull(),
  thrAmount: integer("thr_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// User Spin Tokens table
export const userSpinTokens = pgTable("user_spin_tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  roomId: integer("room_id")
    .notNull()
    .references(() => gameRooms.id),
  tokens: integer("tokens").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// THR Spins table
export const thrSpins = pgTable("thr_spins", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  roomId: integer("room_id")
    .notNull()
    .references(() => gameRooms.id),
  rewardTierId: integer("reward_tier_id")
    .notNull()
    .references(() => gachaRewardTiers.id),
  amount: integer("amount").notNull(),
  spunAt: timestamp("spun_at").defaultNow().notNull(),
})

// THR Earnings summary table
export const thrEarnings = pgTable("thr_earnings", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  roomId: integer("room_id")
    .notNull()
    .references(() => gameRooms.id),
  totalAmount: integer("total_amount").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
})

// Types
export type User = InferModel<typeof users>
export type GameRoom = InferModel<typeof gameRooms>
export type RoomParticipant = InferModel<typeof roomParticipants>
export type Question = InferModel<typeof questions>
export type UserQuestionAttempt = InferModel<typeof userQuestionAttempts>
export type GachaRewardTier = InferModel<typeof gachaRewardTiers>
export type UserSpinToken = InferModel<typeof userSpinTokens>
export type THRSpin = InferModel<typeof thrSpins>
export type THREarning = InferModel<typeof thrEarnings>

