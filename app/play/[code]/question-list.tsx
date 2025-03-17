"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { getAvailableQuestions, answerQuestion } from "./actions"
import { useToast } from "@/hooks/use-toast"

interface QuestionProps {
  code: string
  onTokenEarned?: () => void
}

interface Question {
  id: number
  question: string
  options: string[]
  tier: string
  answered?: boolean
  selected?: string
}

export function QuestionList({ code, onTokenEarned }: QuestionProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState<{ [key: number]: string }>({})
  const [submitting, setSubmitting] = useState<{ [key: number]: boolean }>({})
  const [results, setResults] = useState<{ [key: number]: { correct: boolean; correctAnswer: string } }>({})
  const { toast } = useToast()

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const result = await getAvailableQuestions(code)
        if (result.success) {
          setQuestions(result.questions)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load questions",
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

    fetchQuestions()
  }, [code, toast])

  const handleAnswerChange = (questionId: number, answer: string) => {
    setSelectedOption((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = async (questionId: number) => {
    setSubmitting((prev) => ({
      ...prev,
      [questionId]: true,
    }))

    try {
      const answer = selectedOption[questionId]
      const result = await answerQuestion(questionId, answer, code)

      if (result.success) {
        setResults((prev) => ({
          ...prev,
          [questionId]: {
            correct: result.correct,
            correctAnswer: result.correctAnswer,
          },
        }))

        // Update question state to answered
        setQuestions(
          questions.map((q) =>
            q.id === questionId ? { ...q, answered: true, selected: selectedOption[questionId] } : q,
          ),
        )

        if (result.correct) {
          toast({
            title: "Correct!",
            description: "You earned a spin token.",
          })

          // Notify parent component
          if (onTokenEarned) {
            onTokenEarned()
          }
        } else {
          toast({
            title: "Incorrect",
            description: "Try another question.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit answer",
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
      setSubmitting((prev) => ({
        ...prev,
        [questionId]: false,
      }))
    }
  }

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "bg-amber-500"
      case "silver":
        return "bg-slate-400"
      case "gold":
        return "bg-yellow-400"
      default:
        return "bg-primary"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <p className="text-muted-foreground">No questions available at the moment.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{question.question}</CardTitle>
                <Badge className={getBadgeColor(question.tier)}>
                  {question.tier.charAt(0).toUpperCase() + question.tier.slice(1)}
                </Badge>
              </div>
              {question.answered && (
                <CardDescription>
                  {results[question.id]?.correct
                    ? "Correct! You earned a spin token."
                    : "Incorrect. Try another question."}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {!question.answered ? (
                <RadioGroup
                  value={selectedOption[question.id]}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  className="space-y-2"
                >
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${question.id}-option-${index}`} />
                      <Label htmlFor={`${question.id}-option-${index}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        option === results[question.id]?.correctAnswer
                          ? "bg-green-100 border border-green-200"
                          : option === question.selected && option !== results[question.id]?.correctAnswer
                            ? "bg-red-100 border border-red-200"
                            : ""
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {!question.answered && (
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSubmit(question.id)}
                  disabled={!selectedOption[question.id] || submitting[question.id]}
                >
                  {submitting[question.id] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Answer"
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        ))
      )}
    </div>
  )
}

