import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { certificateId, userId, message } = body

    // Find or create chat session
    let chatSession = await prisma.chatSession.findFirst({
      where: {
        certificateId,
        userId,
      },
      include: {
        messages: true,
      },
    })

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          certificateId,
          userId,
        },
        include: {
          messages: true,
        },
      })
    }

    // Create new message
    const newMessage = await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        chatSessionId: chatSession.id,
      },
    })

    return NextResponse.json({
      chatSession,
      message: newMessage,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const certificateId = searchParams.get('certificateId')
    const userId = searchParams.get('userId')

    if (!certificateId || !userId) {
      return NextResponse.json(
        { error: 'Certificate ID and User ID are required' },
        { status: 400 }
      )
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        certificateId,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(chatSession)
  } catch (error) {
    console.error('Chat fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat session' },
      { status: 500 }
    )
  }
} 