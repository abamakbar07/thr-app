import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateGameRoomForm } from "./create-form"

export default async function CreateGameRoom() {
  // Check if user is authenticated
  const user = await currentUser()
  if (!user) {
    redirect("/sign-in")
  }

  return (
    <DashboardShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Create Game Room</h1>

        <Card>
          <CardHeader>
            <CardTitle>Game Room Details</CardTitle>
            <CardDescription>Create a new game room for your participants</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateGameRoomForm userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

