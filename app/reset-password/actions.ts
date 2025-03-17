"use server"

import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function validateToken(token: string) {
  try {
    const storedToken = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, token),
    })

    if (!storedToken) {
      return { valid: false }
    }

    // Check if token is expired
    const now = new Date()
    if (storedToken.expires < now) {
      return { valid: false }
    }

    return { valid: true, email: storedToken.identifier }
  } catch (error) {
    console.error("Error validating token:", error)
    return { valid: false }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // Validate token
    const validation = await validateToken(token)
    if (!validation.valid || !validation.email) {
      return {
        success: false,
        error: "Invalid or expired token",
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the user's password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.email, validation.email))

    // Delete the used token
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token))

    return { success: true }
  } catch (error) {
    console.error("Error resetting password:", error)
    return {
      success: false,
      error: "Failed to reset password",
    }
  }
}

