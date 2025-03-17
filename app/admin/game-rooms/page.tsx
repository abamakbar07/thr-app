import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function GameRooms() {
  // Check if user is authenticated
  const user = await currentUser()
  if (!user) {
    redirect("/sign-in")
  }

  // TODO: Fetch actual game rooms from the database
  const gameRooms: any[] = []

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Game Rooms</h1>
          <Button asChild>
            <Link href="/admin/game-rooms/create">Create Game Room</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gameRooms.length > 0 ? (
            gameRooms.map((room) => (
              <Card key={room.id}>
                <CardHeader>
                  <CardTitle>{room.name}</CardTitle>
                  <CardDescription>Code: {room.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={room.active ? "text-green-500" : "text-red-500"}>
                        {room.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Participants:</span>
                      <span>0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Questions:</span>
                      <span>0</span>
                    </div>
                    <Button asChild className="mt-4" variant="outline">
                      <Link href={`/admin/game-rooms/${room.id}`}>Manage</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">
                No game rooms created yet. Click the "Create Game Room" button to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

