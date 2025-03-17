import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GachaWheel } from "./gacha-wheel"
import { QuestionList } from "./question-list"
import { getParticipantByCode } from "./actions"
import { db } from "@/lib/db"
import { gachaRewardTiers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

interface PageProps {
  params: {
    code: string
  }
}

export default async function GamePage({ params }: PageProps) {
  const { code } = params

  // Validate the participant code and fetch participant data
  const participantResult = await getParticipantByCode(code)

  if (!participantResult.success || !participantResult.participant) {
    notFound()
  }

  const participant = participantResult.participant

  // Get reward tiers for the gacha wheel
  const rewardTiers = await db.query.gachaRewardTiers.findMany({
    where: eq(gachaRewardTiers.roomId, participant.roomId),
  })

  // Format rewards for the gacha wheel
  const formattedRewards = rewardTiers.map((tier) => {
    let color
    switch (tier.tier) {
      case "bronze":
        color = "#CD7F32"
        break
      case "silver":
        color = "#C0C0C0"
        break
      case "gold":
        color = "#FFD700"
        break
      default:
        color = "#E5E4E2"
    }

    return {
      id: tier.id,
      name: tier.name,
      color,
      probability: Number(tier.probability),
      thrAmount: tier.thrAmount,
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col p-4">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-amber-800">Family Gacha THR</h1>
        <p className="text-amber-700">Welcome, {participant.name}! Answer questions to earn spin tokens.</p>
      </header>

      <Tabs defaultValue="questions" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="gacha">Gacha Wheel</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-4 flex-1">
          <QuestionList code={code} />
        </TabsContent>

        <TabsContent value="gacha" className="mt-4 flex-1 flex flex-col items-center">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">Spin the Gacha Wheel</CardTitle>
              <CardDescription className="text-center">
                Use your tokens to spin the wheel and win THR rewards!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="text-lg font-semibold mb-4">
                You have {participant.spinTokens} spin token{participant.spinTokens !== 1 ? "s" : ""}
              </div>

              <div className="text-lg font-semibold mb-4">Total THR earned: {participant.thrEarned}</div>

              {formattedRewards.length > 0 ? (
                <GachaWheel rewards={formattedRewards} spinTokens={participant.spinTokens} code={code} />
              ) : (
                <p className="text-center text-amber-700 my-8">
                  No reward tiers have been configured yet. Please check back later.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

