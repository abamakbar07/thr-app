"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { bulkUploadQuestions } from "./actions"

interface GameRoom {
  id: number
  name: string
}

export function BulkUploadForm({ gameRooms }: { gameRooms: GameRoom[] }) {
  const [loading, setLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState("")
  const [jsonContent, setJsonContent] = useState("")
  const [fileUploaded, setFileUploaded] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setJsonContent(text)
      setFileUploaded(true)

      // Parse JSON to verify it's valid
      JSON.parse(text)
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "The uploaded file does not contain valid JSON",
        variant: "destructive",
      })
      setJsonContent("")
      setFileUploaded(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      if (!selectedRoom || !jsonContent) {
        toast({
          title: "Validation Error",
          description: "Please select a game room and provide valid JSON",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append("roomId", selectedRoom)
      formData.append("questions", jsonContent)

      const result = await bulkUploadQuestions(formData)

      if (result.success) {
        toast({
          title: "Questions Uploaded",
          description: `Successfully uploaded ${result.count} questions.`,
        })
        router.push("/admin/questions")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to upload questions",
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
        <Label>Upload JSON File</Label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">JSON file only</p>
            </div>
            <input id="file-upload" type="file" className="hidden" accept=".json" onChange={handleFileChange} />
          </label>
        </div>
        {fileUploaded && <p className="text-sm text-green-600">File uploaded successfully!</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="jsonContent">Or Paste JSON Content</Label>
        <Textarea
          id="jsonContent"
          value={jsonContent}
          onChange={(e) => setJsonContent(e.target.value)}
          placeholder={`[
  {
    "questionText": "What is the capital of Indonesia?",
    "questionType": "multiple_choice",
    "options": ["Jakarta", "Bandung", "Surabaya", "Bali"],
    "correctAnswer": "Jakarta",
    "tier": "bronze"
  }
]`}
          className="min-h-[200px] font-mono text-sm"
        />
      </div>

      <input type="hidden" name="roomId" value={selectedRoom} />
      <input type="hidden" name="questions" value={jsonContent} />

      <Button type="submit" className="w-full" disabled={loading || !selectedRoom || !jsonContent}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload Questions"
        )}
      </Button>
    </form>
  )
}

