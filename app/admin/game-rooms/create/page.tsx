import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateGameRoomForm } from "./create-form"
import { getAuthSession } from "@/lib/auth"

export default async function CreateGameRoom() {
  // Check if user is authenticated
  const session = await getAuthSession()
  if (!session?.user) {
    redirect("/sign-in")
  }

  // Check if user has admin role
  if (session.user.role !== "admin") {
    redirect("/")
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
            <CreateGameRoomForm />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

