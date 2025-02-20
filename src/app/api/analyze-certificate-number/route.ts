import { NextRequest, NextResponse } from 'next/server'
import { StreamingTextResponse, OpenAIStream } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

// Initialize OpenAI configuration
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

export async function POST(req: NextRequest) {
  try {
    const { certificateNumber } = await req.json()

    if (!certificateNumber) {
      return NextResponse.json(
        { error: 'No certificate number provided' },
        { status: 400 }
      )
    }

    // TODO: Implement actual certificate lookup logic
    // For MVP, we'll simulate certificate data
    const certificateData = {
      shape: 'Round Brilliant',
      caratWeight: '1.01',
      color: 'F',
      clarity: 'VS1',
      cut: 'Excellent',
      polish: 'Excellent',
      symmetry: 'Excellent',
      fluorescence: 'None',
      measurements: '6.47 x 6.50 x 4.01 mm',
    }

    // Prepare the prompt for OpenAI
    const prompt = `Analyze this diamond certificate data and provide a detailed but easy-to-understand explanation of the diamond's characteristics. Focus on the 4Cs (Cut, Color, Clarity, and Carat) and highlight any notable features or concerns. Also suggest questions the buyer should ask the jeweler.

Certificate Number: ${certificateNumber}
Certificate Data:
${JSON.stringify(certificateData, null, 2)}

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
    console.error('Error processing certificate number:', error)
    return NextResponse.json(
      { error: 'Failed to process certificate number' },
      { status: 500 }
    )
  }
} 