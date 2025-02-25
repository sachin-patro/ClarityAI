import { NextRequest, NextResponse } from 'next/server'
import { StreamingTextResponse, OpenAIStream } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import pdfParse from 'pdf-parse'

// Initialize OpenAI configuration
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

// For debugging
console.log('API route loaded. OpenAI API Key available:', !!process.env.OPENAI_API_KEY)

export async function POST(req: NextRequest) {
  console.log('POST request received at /api/analyze-certificate')
  
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

    // Validate file type
    if (file.type !== 'application/pdf') {
      console.error(`Invalid file type: ${file.type}`)
      return NextResponse.json(
        { error: 'Please upload a PDF file' },
        { status: 400 }
      )
    }

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
      console.log('First 100 characters of extracted text:', certificateText.substring(0, 100))
      
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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.' },
        { status: 500 }
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

    try {
      // Get streaming response from OpenAI
      console.log('Sending request to OpenAI with API key:', process.env.OPENAI_API_KEY?.substring(0, 5) + '...')
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
    } catch (openaiError) {
      console.error('Error calling OpenAI API:', openaiError)
      return NextResponse.json(
        { error: 'Failed to analyze the certificate with AI. Please try again later.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing certificate:', error)
    return NextResponse.json(
      { error: 'Failed to process certificate' },
      { status: 500 }
    )
  }
} 