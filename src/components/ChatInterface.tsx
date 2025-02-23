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
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isTyping,
  quickQuestions
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const formatMessageContent = (content: string) => {
    // Split content into lines
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Handle bullet points
      if (line.startsWith('•')) {
        return (
          <li key={index} className="ml-6 text-gray-700">
            {line.substring(1).trim()}
          </li>
        );
      }
      
      // Handle section headers
      if (line.endsWith(':')) {
        return (
          <h4 key={index} className="font-semibold text-gray-900 mt-4 mb-2">
            {line}
          </h4>
        );
      }
      
      // Regular text
      return line.trim() && (
        <p key={index} className="text-gray-700 mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-2'
                    : 'text-gray-800'
                }`}
              >
                {formatMessageContent(message.content)}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-2 px-4 py-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="grid grid-cols-2 gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSendMessage(question)}
              className="text-left px-4 py-3 bg-white rounded-xl border border-gray-200 
                       hover:border-gray-300 transition-colors duration-200 shadow-sm
                       text-sm text-gray-700 hover:bg-gray-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 
                     disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 