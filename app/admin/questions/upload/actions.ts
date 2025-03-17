"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { questions } from "@/lib/db/schema"

interface QuestionData {
  questionText: string
  questionType: "multiple_choice" | "true_false"
  options: string[]
  correctAnswer: string
  tier: "bronze" | "silver" | "gold"
}

export async function bulkUploadQuestions(formData: FormData) {
  try {
    const roomId = Number.parseInt(formData.get("roomId") as string)
    const questionsJson = formData.get("questions") as string

    if (!roomId || !questionsJson) {
      return {
        success: false,
        error: "Room ID and questions data are required",
      }
    }

    const questionsList: QuestionData[] = JSON.parse(questionsJson)

    if (!Array.isArray(questionsList) || questionsList.length === 0) {
      return {
        success: false,
        error: "Invalid questions data. Must be a non-empty array.",
      }
    }

    // Validate each question
    for (const question of questionsList) {
      if (!question.questionText || !question.questionType || !question.correctAnswer || !question.tier) {
        return {
          success: false,
          error: "All questions must include questionText, questionType, correctAnswer, and tier",
        }
      }

      if (!["multiple_choice", "true_false"].includes(question.questionType)) {
        return {
          success: false,
          error: 'questionType must be either "multiple_choice" or "true_false"',
        }
      }

      if (!["bronze", "silver", "gold"].includes(question.tier)) {
        return {
          success: false,
          error: 'tier must be either "bronze", "silver", or "gold"',
        }
      }

      if (
        question.questionType === "multiple_choice" &&
        (!question.options || !Array.isArray(question.options) || question.options.length < 2)
      ) {
        return {
          success: false,
          error: "Multiple choice questions must include at least 2 options",
        }
      }
    }

    // Insert questions into database
    await db.transaction(async (tx) => {
      for (const question of questionsList) {
        await tx.insert(questions).values({
          roomId,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options || ["True", "False"],
          correctAnswer: question.correctAnswer,
          tier: question.tier,
          solved: false,
        })
      }
    })

    // Revalidate paths
    revalidatePath("/admin/questions")

    return {
      success: true,
      count: questionsList.length,
    }
  } catch (error) {
    console.error("Error uploading questions:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload questions",
    }
  }
}

