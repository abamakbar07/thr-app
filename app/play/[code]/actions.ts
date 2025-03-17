"use server"

import { db } from "@/lib/db"
import {
  roomParticipants,
  userSpinTokens,
  gachaRewardTiers,
  thrSpins,
  thrEarnings,
  userQuestionAttempts,
  questions,
} from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"

// Function to get participant by code
export async function getParticipantByCode(code: string) {
  try {
    const participant = await db.query.roomParticipants.findFirst({
      where: eq(roomParticipants.uniqueCode, code),
      with: {
        user: true,
        gameRoom: true,
      },
    })

    if (!participant) {
      return { success: false, error: "Participant not found" }
    }

    // Get spin tokens
    const spinTokens = await db.query.userSpinTokens.findFirst({
      where: and(eq(userSpinTokens.userId, participant.userId), eq(userSpinTokens.roomId, participant.roomId)),
    })

    // Get total THR earned
    const thrEarned = await db.query.thrEarnings.findFirst({
      where: and(eq(thrEarnings.userId, participant.userId), eq(thrEarnings.roomId, participant.roomId)),
    })

    // Get questions answered
    const questionsAnswered = await db
      .select({ count: sql<number>`count(*)` })
      .from(userQuestionAttempts)
      .where(eq(userQuestionAttempts.userId, participant.userId))
      .execute()

    return {
      success: true,
      participant: {
        id: participant.userId,
        name: participant.user.name,
        roomId: participant.roomId,
        roomName: participant.gameRoom.name,
        spinTokens: spinTokens?.tokens || 0,
        thrEarned: thrEarned?.totalAmount || 0,
        questionsAnswered: questionsAnswered[0]?.count || 0,
      },
    }
  } catch (error) {
    console.error("Error getting participant:", error)
    return { success: false, error: "Failed to get participant" }
  }
}

// Function to get available questions for a participant
export async function getAvailableQuestions(code: string) {
  try {
    const participant = await db.query.roomParticipants.findFirst({
      where: eq(roomParticipants.uniqueCode, code),
    })

    if (!participant) {
      return { success: false, error: "Participant not found" }
    }

    // Get questions for the room that haven't been solved yet
    const availableQuestions = await db.query.questions.findMany({
      where: and(eq(questions.roomId, participant.roomId), eq(questions.solved, false)),
      orderBy: [sql`random()`],
      limit: 5,
    })

    // Format questions for the client
    const formattedQuestions = availableQuestions.map((q) => ({
      id: q.id,
      question: q.questionText,
      options: q.options as string[],
      tier: q.tier,
    }))

    return {
      success: true,
      questions: formattedQuestions,
    }
  } catch (error) {
    console.error("Error getting questions:", error)
    return { success: false, error: "Failed to get questions" }
  }
}

// Function to answer a question
export async function answerQuestion(questionId: number, answer: string, code: string) {
  try {
    const participant = await db.query.roomParticipants.findFirst({
      where: eq(roomParticipants.uniqueCode, code),
    })

    if (!participant) {
      return { success: false, error: "Participant not found" }
    }

    // Get the question
    const question = await db.query.questions.findFirst({
      where: eq(questions.id, questionId),
    })

    if (!question) {
      return { success: false, error: "Question not found" }
    }

    // Check if already answered
    const existingAttempt = await db.query.userQuestionAttempts.findFirst({
      where: and(eq(userQuestionAttempts.userId, participant.userId), eq(userQuestionAttempts.questionId, questionId)),
    })

    if (existingAttempt) {
      return { success: false, error: "Question already answered" }
    }

    // Check if answer is correct
    const isCorrect = question.correctAnswer === answer

    // Record the attempt
    await db.insert(userQuestionAttempts).values({
      userId: participant.userId,
      questionId,
      correct: isCorrect,
    })

    // If correct, award a spin token
    if (isCorrect) {
      // Mark question as solved
      await db.update(questions).set({ solved: true }).where(eq(questions.id, questionId))

      // Add spin token
      const existingTokens = await db.query.userSpinTokens.findFirst({
        where: and(eq(userSpinTokens.userId, participant.userId), eq(userSpinTokens.roomId, participant.roomId)),
      })

      if (existingTokens) {
        await db
          .update(userSpinTokens)
          .set({
            tokens: existingTokens.tokens + 1,
            updatedAt: new Date(),
          })
          .where(eq(userSpinTokens.id, existingTokens.id))
      } else {
        await db.insert(userSpinTokens).values({
          userId: participant.userId,
          roomId: participant.roomId,
          tokens: 1,
        })
      }
    }

    return {
      success: true,
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
    }
  } catch (error) {
    console.error("Error answering question:", error)
    return { success: false, error: "Failed to answer question" }
  }
}

// Function to spin the gacha wheel
export async function spinGachaWheel(code: string) {
  try {
    const participant = await db.query.roomParticipants.findFirst({
      where: eq(roomParticipants.uniqueCode, code),
    })

    if (!participant) {
      return { success: false, error: "Participant not found" }
    }

    // Check if participant has tokens
    const spinTokens = await db.query.userSpinTokens.findFirst({
      where: and(eq(userSpinTokens.userId, participant.userId), eq(userSpinTokens.roomId, participant.roomId)),
    })

    if (!spinTokens || spinTokens.tokens <= 0) {
      return { success: false, error: "No spin tokens available" }
    }

    // Get reward tiers for the room
    const rewardTiers = await db.query.gachaRewardTiers.findMany({
      where: eq(gachaRewardTiers.roomId, participant.roomId),
    })

    if (rewardTiers.length === 0) {
      return { success: false, error: "No reward tiers configured" }
    }

    // Determine the winning tier based on probability
    const totalProbability = rewardTiers.reduce((sum, tier) => {
      return sum + Number(tier.probability)
    }, 0)

    // Generate a random number between 0 and totalProbability
    const random = Math.random() * totalProbability

    let cumulativeProbability = 0
    let winningTier = rewardTiers[0]

    for (const tier of rewardTiers) {
      cumulativeProbability += Number(tier.probability)
      if (random <= cumulativeProbability) {
        winningTier = tier
        break
      }
    }

    // Deduct a token
    await db
      .update(userSpinTokens)
      .set({
        tokens: spinTokens.tokens - 1,
        updatedAt: new Date(),
      })
      .where(eq(userSpinTokens.id, spinTokens.id))

    // Record the spin
    const [spin] = await db
      .insert(thrSpins)
      .values({
        userId: participant.userId,
        roomId: participant.roomId,
        rewardTierId: winningTier.id,
        amount: winningTier.thrAmount,
      })
      .returning()

    // Update total earnings
    const existingEarnings = await db.query.thrEarnings.findFirst({
      where: and(eq(thrEarnings.userId, participant.userId), eq(thrEarnings.roomId, participant.roomId)),
    })

    if (existingEarnings) {
      await db
        .update(thrEarnings)
        .set({
          totalAmount: existingEarnings.totalAmount + winningTier.thrAmount,
          lastUpdated: new Date(),
        })
        .where(eq(thrEarnings.id, existingEarnings.id))
    } else {
      await db.insert(thrEarnings).values({
        userId: participant.userId,
        roomId: participant.roomId,
        totalAmount: winningTier.thrAmount,
      })
    }

    return {
      success: true,
      rewardTierId: winningTier.id,
      amount: winningTier.thrAmount,
    }
  } catch (error) {
    console.error("Error spinning wheel:", error)
    return { success: false, error: "Failed to spin the wheel" }
  }
}

