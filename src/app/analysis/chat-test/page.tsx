'use client';

import React, { useState } from 'react';

// Placeholder file to resolve TypeScript errors
// This file can be safely deleted when no longer needed

export default function ChatTestPage() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useStream, setUseStream] = useState(true);
  const [error, setError] = useState('');

  // Sample certificate text for testing
  const sampleCertificateText = `
    Shape and Cutting Style: ROUND BRILLIANT
    Measurements: 6.61 - 6.64 x 4.05 MM
    Carat Weight: 1.01 carat
    Color Grade: D
    Clarity Grade: VS1
    Cut Grade: EXCELLENT
    Polish: EXCELLENT
    Symmetry: EXCELLENT
    Fluorescence: NONE
  `;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          certificateText: sampleCertificateText,
          stream: useStream
        }),
      });

      if (!response.ok) throw new Error('Request failed');

      if (useStream) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No reader available');

        let streamResponse = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta?.content) {
                  streamResponse += parsed.choices[0].delta.content;
                  setResponse(streamResponse);
                }
              } catch (e) {
                console.warn('Error parsing JSON from stream:', e);
              }
            }
          }
        }
      } else {
        const data = await response.json();
        setResponse(data.response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chat API Test Page</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Sample Certificate</h2>
        <pre className="bg-gray-100 p-4 rounded">{sampleCertificateText}</pre>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">
            <input
              type="checkbox"
              checked={useStream}
              onChange={(e) => setUseStream(e.target.checked)}
              className="mr-2"
            />
            Use Streaming Response
          </label>
        </div>

        <div>
          <label className="block mb-2">
            Message:
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Enter your message..."
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {response && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Response:</h2>
          <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}
    </div>
  );
} 