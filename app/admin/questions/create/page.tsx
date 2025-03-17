import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionForm } from "./question-form"

export default async function CreateQuestionPage() {
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
        <h1 className="text-3xl font-bold">Create Question</h1>

        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
            <CardDescription>Add a new question to your game room</CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionForm gameRooms={gameRooms} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

