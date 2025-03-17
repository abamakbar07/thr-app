import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-6xl font-bold text-amber-800">404</h1>
        <h2 className="text-2xl font-semibold text-amber-700">Page Not Found</h2>
        <p className="text-amber-600">The page you are looking for doesn't exist or has been moved.</p>
        <Button asChild className="bg-amber-600 hover:bg-amber-700">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}

