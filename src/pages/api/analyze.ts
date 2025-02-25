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

    // For testing purposes, just return the extracted text
    return res.status(200).json({
      message: 'PDF processed successfully',
      textLength: certificateText.length,
      textPreview: certificateText.substring(0, 500),
    })
    
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