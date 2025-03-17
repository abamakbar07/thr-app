"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { generateParticipants } from "./actions"
import { Loader2 } from "lucide-react"

interface GameRoom {
  id: number
  name: string
}

export function GenerateParticipantsForm({ gameRooms }: { gameRooms: GameRoom[] }) {
  const [loading, setLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState("")
  const [count, setCount] = useState("10")
  const [prefix, setPrefix] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await generateParticipants(formData)

      if (result.success) {
        toast({
          title: "Participants Generated",
          description: `Successfully generated ${result.count} participant IDs.`,
        })
        router.push("/admin/participants")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate participant IDs",
          variant: "destructive",
        })
      }
    } catch (error) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="room">Game Room</Label>
        <Select value={selectedRoom} onValueChange={setSelectedRoom} name="roomId" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a game room" />
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

      <div className="space-y-2">
        <Label htmlFor="count">Number of Participants</Label>
        <Input
          id="count"
          name="count"
          type="number"
          min="1"
          max="100"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prefix">Prefix (Optional)</Label>
        <Input
          id="prefix"
          name="prefix"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="e.g. FAMILY"
        />
        <p className="text-sm text-muted-foreground">
          A short prefix to make the codes more recognizable (max 3 characters)
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Participant IDs"
        )}
      </Button>
    </form>
  )
}

