import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function RewardsPage() {
  // Check if user is authenticated
  const user = await currentUser()
  if (!user) {
    redirect("/sign-in")
  }

  // TODO: Fetch game rooms and reward tiers from the database
  const gameRooms: any[] = []
  const rewardTiers: any[] = []

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Reward Tiers</h1>
          <Button asChild disabled={gameRooms.length === 0}>
            <Link href="/admin/rewards/create">Create Reward Tier</Link>
          </Button>
        </div>

        {gameRooms.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  No game rooms created yet. Create a game room first to configure reward tiers.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/admin/game-rooms/create">Create Game Room</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : rewardTiers.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Reward Tiers</CardTitle>
              <CardDescription>
                Configure reward tiers for your gacha system with customizable probabilities and THR amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">No reward tiers configured yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/rewards/create">Configure Rewards</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Configured Reward Tiers</CardTitle>
              <CardDescription>Manage your reward tiers and their probabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>THR Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewardTiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell className="font-medium">{tier.tier}</TableCell>
                      <TableCell>{tier.name}</TableCell>
                      <TableCell>{tier.probability}%</TableCell>
                      <TableCell>{tier.thrAmount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/rewards/${tier.id}/edit`}>Edit</Link>
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

