import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: Request) {
  // Check for a secret token to prevent unauthorized migrations
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token || token !== process.env.MIGRATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 })
  }

  try {
    const sql = neon(process.env.DATABASE_URL)

    // Create the schema directly using SQL
    await sql`
      DO $$ 
      BEGIN
        -- Create enums if they don't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
          CREATE TYPE "role" AS ENUM ('admin', 'participant');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
          CREATE TYPE "question_type" AS ENUM ('multiple_choice', 'true_false');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tier') THEN
          CREATE TYPE "tier" AS ENUM ('bronze', 'silver', 'gold', 'custom');
        END IF;
      END $$;
    `

    // Create tables
    await sql`
      -- Users table
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "role" role NOT NULL DEFAULT 'participant',
        "email" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Game Rooms table
      CREATE TABLE IF NOT EXISTS "game_rooms" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL UNIQUE,
        "admin_id" TEXT NOT NULL REFERENCES "users"("id"),
        "active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Room Participants junction table
      CREATE TABLE IF NOT EXISTS "room_participants" (
        "id" SERIAL PRIMARY KEY,
        "room_id" INTEGER NOT NULL REFERENCES "game_rooms"("id"),
        "user_id" TEXT NOT NULL REFERENCES "users"("id"),
        "unique_code" TEXT NOT NULL UNIQUE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Questions table
      CREATE TABLE IF NOT EXISTS "questions" (
        "id" SERIAL PRIMARY KEY,
        "room_id" INTEGER NOT NULL REFERENCES "game_rooms"("id"),
        "question_text" TEXT NOT NULL,
        "question_type" question_type NOT NULL,
        "options" JSONB,
        "correct_answer" TEXT NOT NULL,
        "tier" tier NOT NULL,
        "solved" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- User Question Attempts junction table
      CREATE TABLE IF NOT EXISTS "user_question_attempts" (
        "id" SERIAL PRIMARY KEY,
        "user_id" TEXT NOT NULL REFERENCES "users"("id"),
        "question_id" INTEGER NOT NULL REFERENCES "questions"("id"),
        "correct" BOOLEAN NOT NULL,
        "attempted_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Gacha Reward Tiers table
      CREATE TABLE IF NOT EXISTS "gacha_reward_tiers" (
        "id" SERIAL PRIMARY KEY,
        "room_id" INTEGER NOT NULL REFERENCES "game_rooms"("id"),
        "name" TEXT NOT NULL,
        "tier" tier NOT NULL,
        "probability" DECIMAL(5,2) NOT NULL,
        "thr_amount" INTEGER NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- User Spin Tokens table
      CREATE TABLE IF NOT EXISTS "user_spin_tokens" (
        "id" SERIAL PRIMARY KEY,
        "user_id" TEXT NOT NULL REFERENCES "users"("id"),
        "room_id" INTEGER NOT NULL REFERENCES "game_rooms"("id"),
        "tokens" INTEGER NOT NULL DEFAULT 0,
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- THR Spins table
      CREATE TABLE IF NOT EXISTS "thr_spins" (
        "id" SERIAL PRIMARY KEY,
        "user_id" TEXT NOT NULL REFERENCES "users"("id"),
        "room_id" INTEGER NOT NULL REFERENCES "game_rooms"("id"),
        "reward_tier_id" INTEGER NOT NULL REFERENCES "gacha_reward_tiers"("id"),
        "amount" INTEGER NOT NULL,
        "spun_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- THR Earnings summary table
      CREATE TABLE IF NOT EXISTS "thr_earnings" (
        "id" SERIAL PRIMARY KEY,
        "user_id" TEXT NOT NULL REFERENCES "users"("id"),
        "room_id" INTEGER NOT NULL REFERENCES "game_rooms"("id"),
        "total_amount" INTEGER NOT NULL DEFAULT 0,
        "last_updated" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `

    // Verify tables were created
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      tables: tables.map((t) => t.table_name),
    })
  } catch (error: any) {
    console.error("Migration failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Migration failed",
      },
      { status: 500 },
    )
  }
}

