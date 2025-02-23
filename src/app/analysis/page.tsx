'use client';

import React, { useState } from 'react';
import CertificateSummaryCard from '@/components/CertificateSummaryCard';
import ChatInterface from '@/components/ChatInterface';

// Mock data - replace with real data from your API
const mockCertificateData = {
  carat: 1.01,
  color: 'D',
  clarity: 'VS1',
  cut: 'Excellent',
  certificateNumber: 'GIA2345678901',
  laboratory: 'GIA' as const,
  type: 'Natural' as const
};

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  includeQuickQuestions?: boolean;
}

// These will be shown as clickable suggestions in the AI's first response
const QUICK_QUESTIONS = [
  "Explain the color grade in detail",
  "Is this diamond eye-clean?",
  "What's a fair price for this diamond?",
  "Compare to average diamonds of this size"
];

export default function AnalysisPage() {
  const [messages, setMessages] = useState<Message[]>([
    // Initial AI message with analysis and quick questions
    {
      id: 'initial',
      role: 'assistant',
      content: `Here's my analysis of your diamond:

Summary:
This is an exceptional diamond with excellent proportions and optimal light performance. The combination of D color and VS1 clarity places it in the upper echelon of diamond quality.

Key Strengths:
• D color - the highest color grade possible
• VS1 clarity ensures the diamond is eye-clean
• Excellent cut grade for maximum brilliance

Potential Concerns:
• Premium pricing due to high color grade
• Slight fluorescence may affect value

Value Assessment:
Given the exceptional quality metrics, this diamond commands a premium price but represents good value for those seeking a top-tier stone.

What would you like to know more about?`,
      includeQuickQuestions: true
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'This is a mock AI response. Replace with actual AI integration.',
        role: 'assistant'
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Certificate Summary Card - Sidebar */}
          <div className="lg:col-span-1">
            <CertificateSummaryCard specs={mockCertificateData} />
          </div>
          
          {/* Main Chat Area */}
          <div className="lg:col-span-3 h-[800px]">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
              quickQuestions={QUICK_QUESTIONS}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 