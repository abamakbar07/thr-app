import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function QuestionsPage() {
  // Check if user is authenticated
  const user = await currentUser()
  if (!user) {
    redirect("/sign-in")
  }

  // TODO: Fetch game rooms for the dropdown
  const gameRooms: any[] = []

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Questions</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/admin/questions/create">Add Questions</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/questions/upload">Bulk Upload</Link>
            </Button>
          </div>
        </div>

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
          <Tabs defaultValue="bronze">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bronze">Bronze</TabsTrigger>
              <TabsTrigger value="silver">Silver</TabsTrigger>
              <TabsTrigger value="gold">Gold</TabsTrigger>
            </TabsList>

            <TabsContent value="bronze" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bronze Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-4 text-muted-foreground">No bronze questions added yet.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="silver" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Silver Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-4 text-muted-foreground">No silver questions added yet.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gold" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gold Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-4 text-muted-foreground">No gold questions added yet.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardShell>
  )
}

