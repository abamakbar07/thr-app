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

    // Check if password column exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password'
    `

    if (checkColumn.length === 0) {
      // Add password column if it doesn't exist
      await sql`ALTER TABLE "users" ADD COLUMN "password" TEXT`
      console.log("Added password column to users table")
    } else {
      console.log("Password column already exists")
    }

    // Check if email_verified column exists
    const checkEmailVerified = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email_verified'
    `

    if (checkEmailVerified.length === 0) {
      // Add email_verified column if it doesn't exist
      await sql`ALTER TABLE "users" ADD COLUMN "email_verified" TIMESTAMP`
      console.log("Added email_verified column to users table")
    }

    // Check if image column exists
    const checkImage = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'image'
    `

    if (checkImage.length === 0) {
      // Add image column if it doesn't exist
      await sql`ALTER TABLE "users" ADD COLUMN "image" TEXT`
      console.log("Added image column to users table")
    }

    // Check if accounts table exists
    const checkAccounts = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'accounts'
    `

    if (checkAccounts.length === 0) {
      // Create accounts table if it doesn't exist
      await sql`
        CREATE TABLE "accounts" (
          "id" TEXT PRIMARY KEY,
          "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "type" TEXT NOT NULL,
          "provider" TEXT NOT NULL,
          "provider_account_id" TEXT NOT NULL,
          "refresh_token" TEXT,
          "access_token" TEXT,
          "expires_at" INTEGER,
          "token_type" TEXT,
          "scope" TEXT,
          "id_token" TEXT,
          "session_state" TEXT,
          UNIQUE("provider", "provider_account_id")
        )
      `
      console.log("Created accounts table")
    }

    // Check if sessions table exists
    const checkSessions = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'sessions'
    `

    if (checkSessions.length === 0) {
      // Create sessions table if it doesn't exist
      await sql`
        CREATE TABLE "sessions" (
          "id" TEXT PRIMARY KEY,
          "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "session_token" TEXT NOT NULL UNIQUE,
          "expires" TIMESTAMP NOT NULL
        )
      `
      console.log("Created sessions table")
    }

    // Check if verification_tokens table exists
    const checkVerificationTokens = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'verification_tokens'
    `

    if (checkVerificationTokens.length === 0) {
      // Create verification_tokens table if it doesn't exist
      await sql`
        CREATE TABLE "verification_tokens" (
          "identifier" TEXT NOT NULL,
          "token" TEXT NOT NULL,
          "expires" TIMESTAMP NOT NULL,
          PRIMARY KEY ("identifier", "token")
        )
      `
      console.log("Created verification_tokens table")
    }

    // Get all columns in users table
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY column_name
    `

    return NextResponse.json({
      success: true,
      message: "Schema fixed successfully",
      columns: columns.map((c) => c.column_name),
    })
  } catch (error: any) {
    console.error("Schema fix failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Schema fix failed",
        details: error,
      },
      { status: 500 },
    )
  }
}

