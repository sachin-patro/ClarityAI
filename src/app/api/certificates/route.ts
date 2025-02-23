import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      certificateNumber,
      laboratory,
      pdfUrl,
      rawData,
      carat,
      color,
      clarity,
      cut,
      polish,
      symmetry,
      fluorescence,
      measurements,
      userId,
    } = body

    const certificate = await prisma.certificate.create({
      data: {
        certificateNumber,
        laboratory,
        pdfUrl,
        rawData,
        carat,
        color,
        clarity,
        cut,
        polish,
        symmetry,
        fluorescence,
        measurements,
        userId,
      },
    })

    return NextResponse.json(certificate)
  } catch (error) {
    console.error('Certificate creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create certificate' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        userId,
      },
      include: {
        analyses: true,
      },
    })

    return NextResponse.json(certificates)
  } catch (error) {
    console.error('Certificate fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    )
  }
} 