"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createGameRoom } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function CreateGameRoomForm() {
  const [loading, setLoading] = useState(false)
  const [migrationNeeded, setMigrationNeeded] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMigrationNeeded(false)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await createGameRoom(formData)

      if (result.success) {
        toast({
          title: "Game Room Created",
          description: `Game room "${result.name}" has been created successfully.`,
        })
        router.push(`/admin/game-rooms/${result.id}`)
      } else {
        // Check if the error is related to missing tables
        if (result.error?.includes("relation") && result.error?.includes("does not exist")) {
          setMigrationNeeded(true)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create game room",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {migrationNeeded && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database not initialized</AlertTitle>
          <AlertDescription>
            The database tables haven't been created yet. Please run the migration script:
            <pre className="mt-2 bg-slate-950 p-2 rounded text-white text-sm overflow-x-auto">npm run db:migrate</pre>
            or
            <pre className="mt-2 bg-slate-950 p-2 rounded text-white text-sm overflow-x-auto">
              npx tsx lib/db/migrate.ts
            </pre>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Room Name</Label>
          <Input id="name" name="name" placeholder="Family Eid Gathering" required />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create Game Room"}
        </Button>
      </form>
    </>
  )
}

