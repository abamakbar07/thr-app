"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { users, roomParticipants } from "@/lib/db/schema"
import { generateUniqueCode } from "@/lib/utils"

export async function generateParticipants(formData: FormData) {
  try {
    // Get form data
    const roomId = Number.parseInt(formData.get("roomId") as string)
    const count = Number.parseInt(formData.get("count") as string)
    const prefix = (formData.get("prefix") as string)?.slice(0, 3).toUpperCase() || ""

    if (!roomId || isNaN(roomId) || !count || isNaN(count)) {
      return {
        success: false,
        error: "Valid room ID and count are required",
      }
    }

    if (count < 1 || count > 100) {
      return {
        success: false,
        error: "Count must be between 1 and 100",
      }
    }

    const generatedParticipants = []

    for (let i = 0; i < count; i++) {
      // Create a unique code for the participant
      const uniqueCode = prefix + generateUniqueCode(6 - prefix.length)

      // Create user
      const [user] = await db
        .insert(users)
        .values({
          id: `participant_${Date.now()}_${i}`, // Generate a unique ID
          name: `Participant ${i + 1}`,
          role: "participant",
        })
        .returning()

      // Add to room
      await db.insert(roomParticipants).values({
        roomId,
        userId: user.id,
        uniqueCode,
      })

      generatedParticipants.push({
        id: user.id,
        name: user.name,
        code: uniqueCode,
      })
    }

    // Revalidate paths
    revalidatePath("/admin/participants")

    return {
      success: true,
      count,
      participants: generatedParticipants,
    }
  } catch (error) {
    console.error("Error generating participants:", error)
    return {
      success: false,
      error: "Failed to generate participants",
    }
  }
}

