"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { gachaRewardTiers } from "@/lib/db/schema"

export async function createRewardTier(formData: FormData) {
  try {
    // Get form data
    const roomId = Number.parseInt(formData.get("roomId") as string)
    const tier = formData.get("tier") as string
    const name = formData.get("name") as string
    const probability = Number.parseFloat(formData.get("probability") as string)
    const thrAmount = Number.parseInt(formData.get("thrAmount") as string)

    if (!roomId || !tier || !name || isNaN(probability) || isNaN(thrAmount)) {
      return {
        success: false,
        error: "All fields are required with valid values",
      }
    }

    // Check probability value
    if (probability <= 0 || probability > 100) {
      return {
        success: false,
        error: "Probability must be between 0 and 100",
      }
    }

    // Check THR amount
    if (thrAmount <= 0) {
      return {
        success: false,
        error: "THR amount must be a positive number",
      }
    }

    // TODO: Check if total probability for room doesn't exceed 100%
    // This would require fetching existing reward tiers for this room
    // and summing up their probabilities

    // Insert into database
    const [newRewardTier] = await db
      .insert(gachaRewardTiers)
      .values({
        roomId,
        tier: tier as any,
        name,
        probability: probability.toString() as any,
        thrAmount,
      })
      .returning()

    // Revalidate paths
    revalidatePath("/admin/rewards")

    return {
      success: true,
      id: newRewardTier.id,
    }
  } catch (error) {
    console.error("Error creating reward tier:", error)
    return {
      success: false,
      error: "Failed to create reward tier",
    }
  }
}

