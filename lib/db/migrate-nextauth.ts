import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

// This script will migrate the database schema to support NextAuth.js

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  console.log("🔄 Starting NextAuth migration...")

  try {
    const sql = neon(process.env.DATABASE_URL)
    const db = drizzle(sql, { schema })

    console.log("📊 Creating NextAuth schema...")

    // Add columns to users table
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT`
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" TIMESTAMP`
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" TEXT`

    // Create accounts table
    await sql`
      CREATE TABLE IF NOT EXISTS "accounts" (
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

    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "session_token" TEXT NOT NULL UNIQUE,
        "expires" TIMESTAMP NOT NULL
      )
    `

    // Create verification tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP NOT NULL,
        PRIMARY KEY ("identifier", "token")
      )
    `

    // Migrate existing users
    console.log("🔄 Migrating existing users...")

    // Get all users without passwords
    const usersWithoutPasswords = await db.query.users.findMany({
      where: (users, { isNull }) => isNull(users.password),
    })

    console.log(`Found ${usersWithoutPasswords.length} users to migrate`)

    // Generate temporary passwords for existing users
    for (const user of usersWithoutPasswords) {
      // Generate a random password
      const tempPassword = uuidv4().slice(0, 8)
      const hashedPassword = await bcrypt.hash(tempPassword, 10)

      // Update the user with the hashed password
      await sql`UPDATE "users" SET "password" = ${hashedPassword} WHERE "id" = ${user.id}`

      console.log(`Updated user ${user.id} (${user.name}) with temporary password: ${tempPassword}`)
    }

    console.log("✅ NextAuth migration completed successfully!")
    console.log(
      "⚠️ Note: Temporary passwords have been generated for existing users. They should reset their passwords.",
    )
  } catch (err) {
    console.error("❌ Migration failed:")
    console.error(err)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("❌ Migration failed:")
  console.error(err)
  process.exit(1)
})

