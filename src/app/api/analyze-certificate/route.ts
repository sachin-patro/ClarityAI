import { NextRequest, NextResponse } from 'next/server'
import { StreamingTextResponse, OpenAIStream } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import * as pdfParse from 'pdf-parse'

// Initialize OpenAI configuration
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text from PDF
    const pdfData = await pdfParse(buffer)
    const certificateText = pdfData.text

    // Prepare the prompt for OpenAI
    const prompt = `Analyze this diamond certificate and provide a detailed but easy-to-understand explanation of the diamond's characteristics. Focus on the 4Cs (Cut, Color, Clarity, and Carat) and highlight any notable features or concerns. Also suggest questions the buyer should ask the jeweler.

Certificate text:
${certificateText}

Please structure your response in the following sections:
1. Overview
2. Detailed Analysis of 4Cs
3. Notable Features
4. Potential Concerns
5. Questions for the Jeweler`

    // Get streaming response from OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert diamond analyst helping customers understand diamond certificates.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
    })

    // Create a streaming response
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error processing certificate:', error)
    return NextResponse.json(
      { error: 'Failed to process certificate' },
      { status: 500 }
    )
  }
} 