import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default async function ResultsPage() {
  // Check if user is authenticated
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  // TODO: Fetch game rooms from the database
  const gameRooms: any[] = []
  // TODO: Fetch THR results for display
  const thrResults: any[] = []

  return (
    <DashboardShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">THR Results</h1>

        {gameRooms.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <p className="text-muted-foreground">No game rooms created yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/game-rooms/create">Create Game Room</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="p-4">
              <div className="max-w-xs">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select game room" />
                  </SelectTrigger>
                  <SelectContent>
                    {gameRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>THR Distribution Results</CardTitle>
              </CardHeader>
              <CardContent>
                {thrResults.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No THR results available yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participant</TableHead>
                        <TableHead>Total Questions Answered</TableHead>
                        <TableHead>Spins Used</TableHead>
                        <TableHead>Total THR Earned</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {thrResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">{result.participantName}</TableCell>
                          <TableCell>{result.questionsAnswered}</TableCell>
                          <TableCell>{result.spinsUsed}</TableCell>
                          <TableCell>{result.totalTHR}</TableCell>
                          <TableCell>{result.paid ? "Paid" : "Pending"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardShell>
  )
}

