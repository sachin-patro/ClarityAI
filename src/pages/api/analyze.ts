import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai-edge'
import pdfParse from 'pdf-parse'
import formidable from 'formidable'
import { createReadStream } from 'fs'

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
}

// Initialize OpenAI configuration
const openaiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(openaiConfig)

console.log('Pages API route loaded. OpenAI API Key available:', !!process.env.OPENAI_API_KEY)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Request received at /api/analyze')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse form data
    const form = formidable({})
    
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })
    
    const file = files.file?.[0]
    
    if (!file) {
      console.error('No file provided in the request')
      return res.status(400).json({ error: 'No file provided' })
    }

    console.log(`Processing file: ${file.originalFilename}, type: ${file.mimetype}, size: ${file.size} bytes`)

    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      console.error(`Invalid file type: ${file.mimetype}`)
      return res.status(400).json({ error: 'Please upload a PDF file' })
    }

    // Read the file
    const fileStream = createReadStream(file.filepath)
    const buffer = await streamToBuffer(fileStream)
    console.log(`Read file to buffer of length: ${buffer.length}`)

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
        return res.status(400).json({
          error: 'Could not extract text from the PDF. Please ensure it is a valid certificate.'
        })
      }
    } catch (pdfError) {
      console.error('Error parsing PDF:', pdfError)
      return res.status(400).json({
        error: 'Failed to parse the PDF file. Please ensure it is a valid PDF.'
      })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured')
      return res.status(500).json({
        error: 'OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.'
      })
    }

    try {
      // Prepare the prompt for OpenAI
      const prompt = `You are an expert diamond analyst. Analyze this diamond certificate and provide a detailed but easy-to-understand explanation of the diamond's characteristics. Focus on the 4Cs (Cut, Color, Clarity, and Carat) and highlight any notable features or concerns. Also suggest questions the buyer should ask the jeweler.

Certificate text:
${certificateText}

Please structure your response in the following sections:
1. Overview - A brief summary of the diamond's key characteristics
2. Detailed Analysis of 4Cs - Break down each of the 4Cs and explain what they mean for this specific diamond
3. Notable Features - Highlight any special characteristics or unique aspects
4. Potential Concerns - Point out any areas that might need attention or further investigation
5. Questions for the Jeweler - Suggest specific questions based on the certificate details

For each section, use plain language that a non-expert can understand. If you notice any unusual or noteworthy specifications, explain their significance.`

      // Call OpenAI API
      console.log('Calling OpenAI API...')
      const completion = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
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
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!completion.ok) {
        throw new Error(`OpenAI API error: ${completion.status} ${completion.statusText}`)
      }

      const result = await completion.json()
      const analysis = result.choices[0].message.content

      // Return both the analysis and the raw text
      return res.status(200).json({
        message: 'Certificate analyzed successfully',
        analysis: analysis,
        textLength: certificateText.length,
        textPreview: certificateText.substring(0, 500),
      })
    } catch (openaiError) {
      console.error('Error calling OpenAI API:', openaiError)
      return res.status(500).json({
        error: 'Failed to analyze the certificate with AI. Please try again later.',
        textLength: certificateText.length,
        textPreview: certificateText.substring(0, 500),
      })
    }
  } catch (error) {
    console.error('Error processing certificate:', error)
    return res.status(500).json({ error: 'Failed to process certificate' })
  }
}

// Helper function to convert a stream to a buffer
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
} 