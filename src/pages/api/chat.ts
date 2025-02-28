import { NextApiRequest, NextApiResponse } from 'next'
import { OpenAIApi, Configuration } from 'openai-edge'

// Initialize OpenAI client
const openaiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(openaiConfig)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, certificateText } = req.body

    if (!message || !certificateText) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create system message with certificate context
    const systemMessage = `You are a diamond expert analyzing a GIA/IGI certificate. 
Here is the certificate text for context:

${certificateText}

Provide detailed, accurate responses about this specific diamond based on the certificate text.
Focus on the 4Cs (Cut, Color, Clarity, Carat) and other relevant characteristics.
If asked about pricing, provide general value factors but not specific prices.
If information is not available in the certificate, clearly state that.
Keep responses concise but informative.`

    // Get completion from OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'OpenAI API error')
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    return res.status(200).json({ response: aiResponse })
  } catch (error) {
    console.error('Error in chat endpoint:', error)
    return res.status(500).json({ 
      error: 'Failed to get response from AI',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Configure API route to handle larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
} 