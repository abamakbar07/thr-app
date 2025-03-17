import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BulkUploadForm } from "./upload-form"

export default async function BulkUploadPage() {
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
        <h1 className="text-3xl font-bold">Bulk Upload Questions</h1>

        <Card>
          <CardHeader>
            <CardTitle>JSON Upload</CardTitle>
            <CardDescription>Upload a JSON file containing multiple questions</CardDescription>
          </CardHeader>
          <CardContent>
            <BulkUploadForm gameRooms={gameRooms} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

