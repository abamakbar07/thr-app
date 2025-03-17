"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { gameRooms } from "@/lib/db/schema"
import { generateUniqueCode } from "@/lib/utils"

export async function createGameRoom(formData: FormData, adminId: string) {
  try {
    // Get form data
    const name = formData.get("name") as string

    if (!name || !adminId) {
      return {
        success: false,
        error: "Room name and admin ID are required",
      }
    }

    // Generate a unique room code
    const code = generateUniqueCode(6)

    // Insert into database
    const [newRoom] = await db
      .insert(gameRooms)
      .values({
        name,
        code,
        adminId,
        active: true,
      })
      .returning()

    // Revalidate paths
    revalidatePath("/admin/game-rooms")
    revalidatePath("/admin/dashboard")

    return {
      success: true,
      id: newRoom.id,
      name: newRoom.name,
    }
  } catch (error: any) {
    console.error("Error creating game room:", error)

    // Return more detailed error information
    return {
      success: false,
      error: error.message || "Failed to create game room",
      code: error.code,
      detail: error.detail,
    }
  }
}

