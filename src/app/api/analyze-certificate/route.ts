import { NextRequest, NextResponse } from 'next/server'
import { StreamingTextResponse, OpenAIStream } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import pdfParse from 'pdf-parse'

// Configure for edge runtime
export const runtime = 'edge'
export const maxDuration = 60

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
    const prompt = `Analyze a diamond certificate (GIA or IGI) and provide a plain English explanation of the diamond's features and quality that would be understandable to a beginner or someone unfamiliar with diamond terminology. Use analogies to help explain the diamond's features. Be fun and engaging.


Certificate text:
${certificateText}
# Steps

1. **Identify Key Elements**: 
   - Examine the certificate for specific details: Carat, Cut, Color, Clarity, and additional information such as polish, symmetry, fluorescence, and measurements.

2. **Explain Carat**: 
   - Describe the weight aspect of the diamond, making comparisons to relatable objects for better understanding.

3. **Describe Cut**: 
   - Explain the cut quality and its effect on the diamond's brilliance and appearance using simple terms.

4. **Clarify Color**: 
   - Describe the color grading, focusing on how it affects the overall look of the diamond compared to a "colorless" ideal.

5. **Detail Clarity**: 
   - Explain the clarity grade, detailing inclusions and blemishes and their visibility and impact.

6. **Additional Features**: 
   - Describe other features like fluorescence, polish, symmetry, and measurements, explaining how they influence the diamond's value and appearance.

7. **Provide a Summary**: 
   - Offer an overall assessment of the diamond, summarizing strengths and potential drawbacks in layman's terms.

# Output Format

Produce the analysis in a structured, paragraph form suitable for a novice reader. Include layman's comparisons and analogies where possible to enhance understanding. Each aspect of the diamond should be a separate short paragraph, clearly delineated.
Provide some questions for the user to ask their jeweler about the diamond, to aid their shopping experience.

# Notes

- To aid understanding, compare technical aspects to everyday objects or situations whenever possible.
- Assure the explanation remains non-technical, aimed primarily at a beginner's level.
- Consider mentioning why certain features, like fluorescence or symmetry, may be desirable or undesirable depending on personal preferences.'

`

    try {
      // Get streaming response from OpenAI
      console.log('Sending request to OpenAI with API key:', process.env.OPENAI_API_KEY?.substring(0, 5) + '...')
      const response = await openai.createChatCompletion({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert diamond analyst helping customers understand diamond certificates. You are a fun and engaging expert. Provide plain English explanations of the diamond\'s features and quality in a way that is easy to understand for someone who is not a diamond expert or new to diamonds.',
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