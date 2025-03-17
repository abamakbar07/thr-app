"use server"

import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"

// In a real application, you would send an email with the reset link
// This is a simplified version that just creates the token
export async function requestPasswordReset(email: string) {
  try {
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      // Instead, pretend we sent the email
      return { success: true }
    }

    // Generate a token
    const token = uuidv4()
    const expires = new Date()
    expires.setHours(expires.getHours() + 1) // Token expires in 1 hour

    // Delete any existing tokens for this user
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email))

    // Create a new token
    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    })

    // In a real application, you would send an email with the reset link
    // For example: `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    console.log(`Password reset token for ${email}: ${token}`)

    revalidatePath("/forgot-password")

    return { success: true }
  } catch (error) {
    console.error("Error requesting password reset:", error)
    return {
      success: false,
      error: "Failed to request password reset",
    }
  }
}

