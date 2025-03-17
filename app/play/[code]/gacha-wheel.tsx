"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { spinGachaWheel } from "./actions"

interface GachaWheelProps {
  rewards: {
    id: number
    name: string
    color: string
    probability: number
    thrAmount: number
  }[]
  spinTokens: number
  code: string
}

export function GachaWheel({ rewards, spinTokens, code }: GachaWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<{
    rewardName: string
    thrAmount: number
  } | null>(null)
  const [remainingTokens, setRemainingTokens] = useState(spinTokens)

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 300
    canvas.height = 300

    // Calculate total probability for normalization
    const totalProbability = rewards.reduce((sum, reward) => sum + reward.probability, 0)

    // Draw wheel segments
    let startAngle = 0
    rewards.forEach((reward) => {
      const sliceAngle = (2 * Math.PI * reward.probability) / totalProbability

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2, canvas.height / 2)
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 10, startAngle, startAngle + sliceAngle)
      ctx.closePath()

      ctx.fillStyle = reward.color
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = "#FFFFFF"
      ctx.stroke()

      // Add text
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = "right"
      ctx.fillStyle = "#000"
      ctx.font = "bold 14px Arial"
      ctx.fillText(reward.name, canvas.width / 2 - 20, 0)
      ctx.restore()

      startAngle += sliceAngle
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 15, 0, 2 * Math.PI)
    ctx.fillStyle = "#FFF"
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = "#000"
    ctx.stroke()

    // Apply rotation
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(rotation)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)
  }, [rewards, rotation])

  const handleSpin = async () => {
    if (spinning || remainingTokens <= 0) return

    setSpinning(true)
    setSpinResult(null)

    try {
      // Simulate spinning animation
      const spinDuration = 3000 // 3 seconds
      const startTime = Date.now()
      const startRotation = rotation
      const spinRevolutions = 5 + Math.random() * 3 // 5-8 full rotations

      // Call the server action to determine the result
      const result = await spinGachaWheel(code)

      if (!result.success) {
        throw new Error(result.error || "Failed to spin the wheel")
      }

      // Calculate the final rotation to land on the winning segment
      const winningReward = rewards.find((r) => r.id === result.rewardTierId)

      // Animation loop
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / spinDuration, 1)

        // Easing function for slowing down
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

        // Calculate current rotation
        const currentRotation = startRotation + spinRevolutions * 2 * Math.PI * easeOut(progress)
        setRotation(currentRotation)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Spinning finished
          setSpinning(false)
          setRemainingTokens((prev) => prev - 1)

          // Show result
          if (winningReward) {
            setSpinResult({
              rewardName: winningReward.name,
              thrAmount: result.amount,
            })
          }
        }
      }

      animate()
    } catch (error) {
      console.error("Error spinning wheel:", error)
      setSpinning(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[300px] h-[300px]">
        <canvas ref={canvasRef} className="w-full h-full" />
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-600 z-10" />
      </div>

      <div className="mt-4 text-center">
        <p className="text-lg font-semibold mb-2">
          You have {remainingTokens} spin token{remainingTokens !== 1 ? "s" : ""}
        </p>

        {spinResult && (
          <div className="my-4 p-4 bg-amber-100 rounded-lg border border-amber-300">
            <p className="font-bold text-amber-800">Congratulations!</p>
            <p className="text-amber-700">
              You won {spinResult.rewardName}: {spinResult.thrAmount} THR
            </p>
          </div>
        )}

        <Button
          onClick={handleSpin}
          disabled={spinning || remainingTokens <= 0}
          className="mt-2 bg-amber-600 hover:bg-amber-700"
        >
          {spinning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Spinning...
            </>
          ) : (
            "Spin the Wheel"
          )}
        </Button>
      </div>
    </div>
  )
}

