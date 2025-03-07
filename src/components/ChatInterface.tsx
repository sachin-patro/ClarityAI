'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  includeQuickQuestions?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  quickQuestions: string[];
  certificateText: string;
  certificateSpecs: {
    carat: number;
    color: string;
    clarity: string;
    cut: string;
    certificateNumber: string;
    laboratory: 'GIA' | 'IGI';
    type: 'Natural' | 'Lab-Grown';
  };
  onNewAssistantMessage?: (message: Message) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isTyping,
  quickQuestions,
  certificateText,
  certificateSpecs,
  onNewAssistantMessage
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseStarted, setResponseStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent, messageOverride?: string) => {
    e.preventDefault();
    if (isLoading) return;

    const messageToSend = messageOverride || input.trim();
    if (!messageToSend) return;

    setInput('');
    setIsLoading(true);
    setResponseStarted(false);

    // Send the message to parent
    onSendMessage(messageToSend);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          certificateText,
          stream: true,
          conversationHistory: [
            {
              role: 'system',
              content: `You are a diamond expert analyzing this specific diamond certificate. Here are the exact specifications:

Certificate Type: ${certificateSpecs.laboratory} ${certificateSpecs.type} Diamond Certificate
Certificate Number: ${certificateSpecs.certificateNumber}

Specifications:
• Carat Weight: ${certificateSpecs.carat}
• Color Grade: ${certificateSpecs.color}
• Clarity Grade: ${certificateSpecs.clarity}
• Cut Grade: ${certificateSpecs.cut}

Your role is to help users understand this specific diamond's characteristics. When answering questions:
1. Always reference these exact specifications
2. Be specific about THIS diamond's characteristics
3. Explain how each characteristic affects this diamond's quality
4. Make comparisons when helpful to understand the grades

Additional certificate details are available in this text:
${certificateText}`
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ]
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';
      const messageId = Date.now().toString();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            if (!content) continue;

            accumulatedResponse += content;
            
            if (!responseStarted) {
              setResponseStarted(true);
            }

            // Send the updated message to parent
            onNewAssistantMessage?.({
              id: messageId,
              content: accumulatedResponse,
              role: 'assistant',
              includeQuickQuestions: false
            });
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error in chat request:', err);
      onNewAssistantMessage?.({
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        includeQuickQuestions: false
      });
    } finally {
      setIsLoading(false);
      setResponseStarted(false);
    }
  };

  const formatMessageContent = (content: string) => {
    // Split content into lines
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Handle bullet points
      if (line.trim().startsWith('•')) {
        return (
          <div key={index} className="flex space-x-2 ml-4 mb-2">
            <span className="text-blue-500">•</span>
            <span>{line.trim().substring(1)}</span>
          </div>
        );
      }
      
      // Handle section headers (lines ending with ':')
      if (line.trim().endsWith(':')) {
        return (
          <h3 key={index} className="font-semibold mt-4 mb-2">
            {line.trim()}
          </h3>
        );
      }
      
      // Regular text
      return line.trim() ? (
        <p key={index} className="mb-2">
          {line}
        </p>
      ) : null;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-[800px] flex flex-col">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.role === 'assistant' ? 'mr-12' : 'ml-12'}`}
          >
            <div
              className={`rounded-lg p-4 ${
                message.role === 'assistant'
                  ? 'bg-blue-50 text-blue-900'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {formatMessageContent(message.content)}
              
              {/* Quick questions */}
              {message.includeQuickQuestions && quickQuestions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-600 mb-2">
                    Quick questions you can ask:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isLoading) {
                            const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
                            handleSubmit(syntheticEvent, question);
                          }
                        }}
                        className="text-sm bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-50"
                        disabled={isLoading}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && !responseStarted && (
          <div className="mr-12 mb-4">
            <div className="bg-blue-50 text-blue-900 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the diamond..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 