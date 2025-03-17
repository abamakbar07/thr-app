"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { createQuestion } from "./actions"

interface GameRoom {
  id: number
  name: string
}

export function QuestionForm({ gameRooms }: { gameRooms: GameRoom[] }) {
  const [loading, setLoading] = useState(false)
  const [questionType, setQuestionType] = useState("multiple_choice")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [selectedTier, setSelectedTier] = useState("")
  const [options, setOptions] = useState(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleAddOption = () => {
    setOptions([...options, ""])
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
    if (correctAnswer === options[index]) {
      setCorrectAnswer("")
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)

      // Add options as JSON
      formData.delete("options")
      formData.append("options", JSON.stringify(options.filter((opt) => opt.trim() !== "")))

      const result = await createQuestion(formData)

      if (result.success) {
        toast({
          title: "Question Created",
          description: "Question has been created successfully.",
        })
        router.push("/admin/questions")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create question",
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
        <Label htmlFor="tier">Question Tier</Label>
        <Select value={selectedTier} onValueChange={setSelectedTier} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bronze">Bronze</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="questionType">Question Type</Label>
        <Select value={questionType} onValueChange={setQuestionType} name="questionType" required>
          <SelectTrigger>
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="true_false">True/False</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="questionText">Question</Label>
        <Textarea
          id="questionText"
          name="questionText"
          placeholder="Enter your question here"
          required
          className="min-h-[100px]"
        />
      </div>

      {questionType === "multiple_choice" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Answer Options</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddOption} disabled={options.length >= 8}>
              Add Option
            </Button>
          </div>

          <div className="space-y-2">
            {options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={option}
                  placeholder={`Option ${idx + 1}`}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOption(idx)}
                  disabled={options.length <= 2}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctAnswer">Correct Answer</Label>
            <Select value={correctAnswer} onValueChange={setCorrectAnswer} name="correctAnswer" required>
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                {options.map(
                  (option, idx) =>
                    option.trim() !== "" && (
                      <SelectItem key={idx} value={option}>
                        {option}
                      </SelectItem>
                    ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Correct Answer</Label>
          <RadioGroup
            value={correctAnswer}
            onValueChange={setCorrectAnswer}
            name="correctAnswer"
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="True" id="true" />
              <Label htmlFor="true">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="False" id="false" />
              <Label htmlFor="false">False</Label>
            </div>
          </RadioGroup>
          <input type="hidden" name="options" value={JSON.stringify(["True", "False"])} />
        </div>
      )}

      <input type="hidden" name="roomId" value={selectedRoom} />
      <input type="hidden" name="tier" value={selectedTier} />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Question"}
      </Button>
    </form>
  )
}

