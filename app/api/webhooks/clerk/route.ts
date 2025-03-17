import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error verifying webhook", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data

    // Create user in our database
    await db
      .insert(users)
      .values({
        id,
        name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
        email: email_addresses?.[0]?.email_address,
        role: "admin", // Default to admin for Clerk users
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
          email: email_addresses?.[0]?.email_address,
          updatedAt: new Date(),
        },
      })
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data

    // Update user in our database
    await db
      .update(users)
      .set({
        name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
        email: email_addresses?.[0]?.email_address,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data

    // We might want to keep the user record for historical data
    // but mark it as deleted or inactive
    await db
      .update(users)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
  }

  return new Response("Webhook received", { status: 200 })
}

