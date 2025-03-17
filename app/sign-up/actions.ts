"use server"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

interface RegisterUserParams {
  name: string
  email: string
  password: string
}

export async function registerUser({ name, email, password }: RegisterUserParams) {
  try {
    console.log("Registering user:", { name, email })

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      console.log("User already exists")
      return {
        success: false,
        error: "User with this email already exists",
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("Password hashed")

    // Create the user with SQL directly to avoid schema issues
    const sql = db.session.sql
    const result = await sql`
      INSERT INTO users (id, name, email, password, role, created_at, updated_at)
      VALUES (${uuidv4()}, ${name}, ${email}, ${hashedPassword}, 'admin', NOW(), NOW())
      RETURNING id
    `

    const userId = result[0]?.id
    console.log("User created with ID:", userId)

    return {
      success: true,
      userId,
    }
  } catch (error) {
    console.error("Error registering user:", error)
    return {
      success: false,
      error: "Failed to register user",
    }
  }
}

