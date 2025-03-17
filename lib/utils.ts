import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random alphanumeric code of specified length
export function generateUniqueCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed similar-looking characters
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Create QR code URL using a free service
export function generateQRCodeUrl(text: string, size = 150): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
}

