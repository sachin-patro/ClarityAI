import { NextRequest, NextResponse } from 'next/server'
import { StreamingTextResponse, OpenAIStream } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import pdfParse from 'pdf-parse'

// Initialize OpenAI configuration
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

export async function POST(req: NextRequest) {
  try {
    console.log('Received certificate upload request')
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('No file provided in the request')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`Converted file to buffer of length: ${buffer.length}`)

    // Extract text from PDF
    let certificateText = ''
    try {
      console.log('Attempting to parse PDF...')
      const pdfData = await pdfParse(buffer)
      certificateText = pdfData.text
      console.log(`Successfully extracted text from PDF (${certificateText.length} characters)`)
      
      if (!certificateText || certificateText.trim().length === 0) {
        console.error('Extracted text is empty')
        return NextResponse.json(
          { error: 'Could not extract text from the PDF. Please ensure it is a valid certificate.' },
          { status: 400 }
        )
      }
    } catch (pdfError) {
      console.error('Error parsing PDF:', pdfError)
      return NextResponse.json(
        { error: 'Failed to parse the PDF file. Please ensure it is a valid PDF.' },
        { status: 400 }
      )
    }

    // Prepare the prompt for OpenAI
    console.log('Preparing prompt for OpenAI')
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
    console.log('Sending request to OpenAI')
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
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Create a streaming response
    console.log('Creating streaming response')
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