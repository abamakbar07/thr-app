import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function ParticipantsPage() {
  // Check if user is authenticated
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  // TODO: Fetch game rooms and participants from the database
  const gameRooms: any[] = []
  const participants: any[] = []

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Participants</h1>
          <Button asChild disabled={gameRooms.length === 0}>
            <Link href="/admin/participants/generate">Generate Participant IDs</Link>
          </Button>
        </div>

        {gameRooms.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  No game rooms created yet. Create a game room first to generate participant IDs.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/admin/game-rooms/create">Create Game Room</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : participants.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">No participants generated yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/participants/generate">Generate Participant IDs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Participant List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Game Room</TableHead>
                    <TableHead>Questions Solved</TableHead>
                    <TableHead>THR Earned</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell>{participant.code}</TableCell>
                      <TableCell>{participant.roomName}</TableCell>
                      <TableCell>{participant.questionsSolved || 0}</TableCell>
                      <TableCell>{participant.thrEarned || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/participants/${participant.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}

