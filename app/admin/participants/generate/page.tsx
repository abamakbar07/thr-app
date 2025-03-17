import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GenerateParticipantsForm } from "./generate-form"

export default async function GenerateParticipantsPage() {
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
        <h1 className="text-3xl font-bold">Generate Participant IDs</h1>

        <Card>
          <CardHeader>
            <CardTitle>Generate Participant IDs</CardTitle>
            <CardDescription>Create unique IDs and QR codes for participants to join the game</CardDescription>
          </CardHeader>
          <CardContent>
            <GenerateParticipantsForm gameRooms={gameRooms} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

