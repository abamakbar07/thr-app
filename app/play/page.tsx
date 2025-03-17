import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-amber-800">Join Game</CardTitle>
          <CardDescription>Enter your unique participant code to join the game</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/play/join" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Your Code</Label>
              <Input
                id="code"
                name="code"
                placeholder="Enter your participant code"
                required
                className="text-center text-lg uppercase"
              />
            </div>
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
              Join Game
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            Are you an admin?{" "}
            <Link href="/sign-in" className="text-amber-600 hover:underline">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

