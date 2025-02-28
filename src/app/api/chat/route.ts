import { NextResponse } from 'next/server';
import { createChatCompletion, type ChatRequestBody } from '@/lib/chat';

// Enable edge runtime for streaming support
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    console.log('[Chat API] Received request');
    const body: ChatRequestBody = await request.json();
    const { message, certificateText, stream = false, conversationHistory = [] } = body;
    console.log('[Chat API] Request params:', { 
      message: message.slice(0, 50) + '...', 
      hasText: !!certificateText, 
      stream,
      historyLength: conversationHistory.length 
    });

    if (!message || !certificateText) {
      console.log('[Chat API] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get completion from OpenAI
    console.log('[Chat API] Calling OpenAI');
    const response = await createChatCompletion(message, certificateText, stream, conversationHistory);
    console.log('[Chat API] OpenAI response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('[Chat API] OpenAI error:', error);
      throw new Error(error.message || 'OpenAI API error');
    }

    if (stream) {
      console.log('[Chat API] Setting up stream response');
      // For streaming responses, set up appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', 'text/event-stream');
      headers.set('Cache-Control', 'no-cache');
      headers.set('Connection', 'keep-alive');

      // Return the stream directly
      return new Response(response.body, { headers });
    } else {
      console.log('[Chat API] Processing non-stream response');
      // Handle non-streaming response
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      return NextResponse.json({ response: aiResponse });
    }
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get response from AI',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 