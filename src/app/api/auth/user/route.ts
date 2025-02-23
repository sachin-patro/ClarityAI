import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, email } = body

    // Create or update user in our database
    const user = await prisma.user.upsert({
      where: { id },
      update: { email },
      create: {
        id,
        email,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 