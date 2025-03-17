"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createRewardTier } from "./actions"

interface GameRoom {
  id: number
  name: string
}

export function RewardTierForm({ gameRooms }: { gameRooms: GameRoom[] }) {
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [rewardName, setRewardName] = useState("")
  const [probability, setProbability] = useState("")
  const [thrAmount, setThrAmount] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      if (!selectedRoom || !selectedTier || !rewardName || !probability || !thrAmount) {
        toast({
          title: "Validation Error",
          description: "All fields are required",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const probValue = Number.parseFloat(probability)
      if (isNaN(probValue) || probValue <= 0 || probValue > 100) {
        toast({
          title: "Validation Error",
          description: "Probability must be between 0 and 100",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const thrValue = Number.parseInt(thrAmount)
      if (isNaN(thrValue) || thrValue <= 0) {
        toast({
          title: "Validation Error",
          description: "THR amount must be a positive number",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append("roomId", selectedRoom)
      formData.append("tier", selectedTier)
      formData.append("name", rewardName)
      formData.append("probability", probability)
      formData.append("thrAmount", thrAmount)

      const result = await createRewardTier(formData)

      if (result.success) {
        toast({
          title: "Reward Tier Created",
          description: `Reward tier "${rewardName}" has been created successfully.`,
        })
        router.push("/admin/rewards")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create reward tier",
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
        <Select value={selectedRoom} onValueChange={setSelectedRoom} required>
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
        <Label htmlFor="tier">Tier</Label>
        <Select value={selectedTier} onValueChange={setSelectedTier} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bronze">Bronze</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Reward Name</Label>
        <Input
          id="name"
          value={rewardName}
          onChange={(e) => setRewardName(e.target.value)}
          placeholder="e.g. Small Prize"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="probability">Probability (%)</Label>
        <Input
          id="probability"
          type="number"
          min="0.01"
          max="100"
          step="0.01"
          value={probability}
          onChange={(e) => setProbability(e.target.value)}
          placeholder="e.g. 25.5"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="thrAmount">THR Amount</Label>
        <Input
          id="thrAmount"
          type="number"
          min="1"
          step="1"
          value={thrAmount}
          onChange={(e) => setThrAmount(e.target.value)}
          placeholder="e.g. 50000"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Reward Tier"}
      </Button>
    </form>
  )
}

