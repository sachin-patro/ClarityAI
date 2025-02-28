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
  onNewAssistantMessage?: (message: Message) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isTyping,
  quickQuestions,
  certificateText,
  onNewAssistantMessage
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent, messageOverride?: string) => {
    e.preventDefault();
    if (isLoading) {
      console.log('[Chat Interface] Skipping submit - already loading');
      return;
    }

    let messageToSend = messageOverride || input.trim();
    
    if (!messageToSend) {
      console.log('[Chat Interface] No message to send');
      return;
    }
    
    console.log('[Chat Interface] Sending message:', messageToSend);
    console.log('[Chat Interface] Current messages:', messages.map(m => ({
      id: m.id,
      role: m.role,
      isInitial: m.includeQuickQuestions,
      contentPreview: m.content.slice(0, 50)
    })));

    setInput('');
    setIsLoading(true);

    // Notify parent about the user message first
    onSendMessage(messageToSend);

    // Convert messages to the format expected by the API
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    try {
      console.log('[Chat Interface] Making API request with history:', conversationHistory.length);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          certificateText,
          stream: true,
          conversationHistory
        })
      });

      console.log('[Chat Interface] API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('[Chat Interface] Stream complete, final response:', accumulatedResponse.slice(0, 50) + '...');
          break;
        }

        // Decode the chunk and accumulate it
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              accumulatedResponse += content;
              
              // Update the message in real-time
              if (content && onNewAssistantMessage) {
                const newMessage = {
                  id: Date.now().toString(),
                  content: accumulatedResponse,
                  role: 'assistant' as const
                };
                console.log('[Chat Interface] Updating assistant message:', {
                  id: newMessage.id,
                  contentPreview: newMessage.content.slice(0, 50)
                });
                onNewAssistantMessage(newMessage);
              }
            } catch (e) {
              console.error('[Chat Interface] Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('[Chat Interface] Error in chat request:', err);
      if (onNewAssistantMessage) {
        onNewAssistantMessage({
          id: Date.now().toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          role: 'assistant'
        });
      }
    } finally {
      setIsLoading(false);
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
      
      // Handle numbered sections (e.g., "1. Overview")
      if (/^\d+\./.test(line)) {
        return (
          <h3 key={index} className="font-semibold text-lg mt-4 mb-2">
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
            className={`mb-4 ${
              message.role === 'assistant' ? 'mr-12' : 'ml-12'
            }`}
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
                            console.log('[Chat Interface] Quick question clicked:', question);
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
        {isLoading && (
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