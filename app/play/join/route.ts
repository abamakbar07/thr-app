import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return redirect("/play")
  }

  // TODO: Validate the code against the database
  // For now, we'll just redirect to game page

  return redirect(`/play/${code}`)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const code = formData.get("code") as string

  if (!code) {
    return redirect("/play")
  }

  // TODO: Validate the code against the database
  // For now, we'll just redirect to game page

  return redirect(`/play/${code}`)
}

