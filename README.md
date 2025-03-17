# Family Gacha THR App

An interactive web application designed for distributing THR (Tunjangan Hari Raya) in a gamified way during Eid celebrations.

## Features

- **Admin Panel**: Create game rooms, add questions, set reward tiers, and generate participant IDs
- **Trivia Game**: Participants answer questions to earn spin tokens
- **Gacha System**: Spin a wheel to win THR rewards with configurable probabilities
- **Real-time Updates**: Track participant progress and THR distribution

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, Tailwind CSS
- **Backend**: Next.js Server Actions, Clerk Authentication
- **Database**: PostgreSQL (Neon.tech) with DrizzleORM
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Neon PostgreSQL database
- A Clerk account for authentication

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

