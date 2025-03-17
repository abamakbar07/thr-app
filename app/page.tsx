import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const user = await currentUser()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold text-amber-800">Family Gacha THR</h1>
        <p className="text-xl text-amber-700">A fun, interactive way to distribute THR during Eid celebrations</p>

        <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
          {user ? (
            <>
              <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
                <Link href="/admin/dashboard">Admin Dashboard</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                <Link href="/play">Join Game</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                <Link href="/play">Join Game</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

