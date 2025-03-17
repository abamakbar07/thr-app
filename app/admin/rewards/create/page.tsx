import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RewardTierForm } from "./reward-form"

export default async function CreateRewardTier() {
  // Check if user is authenticated
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  // TODO: Fetch game rooms from the database
  const gameRooms: any[] = []

  if (gameRooms.length === 0) {
    redirect("/admin/game-rooms")
  }

  return (
    <DashboardShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Create Reward Tier</h1>

        <Card>
          <CardHeader>
            <CardTitle>Reward Tier Configuration</CardTitle>
            <CardDescription>
              Configure the reward tiers for your gacha system. The total probability should equal 100%.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RewardTierForm gameRooms={gameRooms} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

