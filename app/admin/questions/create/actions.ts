"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { questions } from "@/lib/db/schema"

export async function createQuestion(formData: FormData) {
  try {
    // Get form data
    const roomId = Number.parseInt(formData.get("roomId") as string)
    const tier = formData.get("tier") as string
    const questionType = formData.get("questionType") as string
    const questionText = formData.get("questionText") as string
    const correctAnswer = formData.get("correctAnswer") as string
    const optionsJson = formData.get("options") as string
    const options = JSON.parse(optionsJson)

    if (!roomId || !tier || !questionType || !questionText || !correctAnswer || !options) {
      return {
        success: false,
        error: "All fields are required",
      }
    }

    // Insert into database
    const [newQuestion] = await db
      .insert(questions)
      .values({
        roomId,
        tier: tier as any,
        questionType: questionType as any,
        questionText,
        options,
        correctAnswer,
        solved: false,
      })
      .returning()

    // Revalidate paths
    revalidatePath("/admin/questions")

    return {
      success: true,
      id: newQuestion.id,
    }
  } catch (error) {
    console.error("Error creating question:", error)
    return {
      success: false,
      error: "Failed to create question",
    }
  }
}

