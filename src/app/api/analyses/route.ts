import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      summary,
      strengths,
      concerns,
      valueAssessment,
      questions,
      certificateId,
      userId,
    } = body

    const analysis = await prisma.analysis.create({
      data: {
        summary,
        strengths,
        concerns,
        valueAssessment,
        questions,
        certificateId,
        userId,
      },
      include: {
        certificate: true,
      },
    })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analysis creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create analysis' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const certificateId = searchParams.get('certificateId')

    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      )
    }

    const analysis = await prisma.analysis.findFirst({
      where: {
        certificateId,
      },
      include: {
        certificate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analysis fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    )
  }
} 