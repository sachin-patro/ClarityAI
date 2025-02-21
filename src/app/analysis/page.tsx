'use client';

import React, { useState } from 'react';
import CertificateSummaryCard from '@/components/CertificateSummaryCard';
import InitialAnalysis from '@/components/InitialAnalysis';
import ChatInterface from '@/components/ChatInterface';
import QuickPrompts from '@/components/QuickPrompts';

// Mock data - replace with real data from your API
const mockCertificateData = {
  carat: 1.01,
  color: 'D',
  clarity: 'VS1',
  cut: 'Excellent',
  certificateNumber: 'GIA2345678901',
  laboratory: 'GIA' as const
};

const mockAnalysisData = {
  summary: 'This is an exceptional diamond with excellent proportions and optimal light performance. The combination of D color and VS1 clarity places it in the upper echelon of diamond quality.',
  strengths: [
    'D color - the highest color grade possible',
    'VS1 clarity ensures the diamond is eye-clean',
    'Excellent cut grade for maximum brilliance'
  ],
  concerns: [
    'Premium pricing due to high color grade',
    'Slight fluorescence may affect value'
  ],
  valueAssessment: 'Given the exceptional quality metrics, this diamond commands a premium price but represents good value for those seeking a top-tier stone.',
  recommendedQuestions: [
    'Can you provide images of the diamond under different lighting conditions?',
    'What is the fluorescence rating?',
    'Are there any clarity characteristics visible to the naked eye?'
  ]
};

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export default function AnalysisPage() {
  const [messages, setMessages] = useState<Message[]>([]);
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

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Certificate Summary Card */}
          <div className="lg:col-span-1">
            <CertificateSummaryCard specs={mockCertificateData} />
          </div>
          
          {/* Initial Analysis */}
          <div className="lg:col-span-2">
            <InitialAnalysis 
              isLoading={false}
              sections={mockAnalysisData}
            />
          </div>
        </div>

        {/* Chat Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3 h-[600px]">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          </div>
          
          {/* Quick Prompts Sidebar */}
          <div className="lg:col-span-1">
            <QuickPrompts onPromptClick={handleQuickPrompt} />
          </div>
        </div>
      </div>
    </div>
  );
} 