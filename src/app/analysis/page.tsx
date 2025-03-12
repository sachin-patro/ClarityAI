'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import CertificateSummaryCard from '@/components/CertificateSummaryCard';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  includeQuickQuestions?: boolean;
}

interface CertificateData {
  analysis: string;
  specs: {
    carat: number;
    color: string;
    clarity: string;
    cut: string;
    certificateNumber: string;
    laboratory: 'GIA' | 'IGI';
    type: 'Natural' | 'Lab-Grown';
  };
  rawText: string;
}

export default function AnalysisPage() {
  const router = useRouter();
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<Message[]>([]);

  // Add logging for message state changes
  useEffect(() => {
    console.log('[Analysis Page] Messages state changed:', messages.map(m => ({
      id: m.id,
      role: m.role,
      isInitial: m.includeQuickQuestions,
      contentPreview: m.content.slice(0, 30)
    })));
  }, [messages]);

  // Add logging for conversation context changes
  useEffect(() => {
    console.log('[Analysis Page] Conversation context changed:', conversationContext.map(m => ({
      id: m.id,
      role: m.role,
      isInitial: m.includeQuickQuestions,
      contentPreview: m.content.slice(0, 30)
    })));
  }, [conversationContext]);

  useEffect(() => {
    // Get certificate data from localStorage
    console.log('[Analysis Page] Initializing analysis page')
    const storedData = localStorage.getItem('certificateData')
    console.log('[Analysis Page] Found stored data:', !!storedData)
    
    if (!storedData) {
      console.log('[Analysis Page] No certificate data found, redirecting to home')
      router.push('/')
      return
    }

    try {
      const data = JSON.parse(storedData) as CertificateData
      console.log('[Analysis Page] Parsed certificate data:', {
        hasAnalysis: !!data.analysis,
        analysisLength: data.analysis?.length,
        hasSpecs: !!data.specs,
        specsKeys: Object.keys(data.specs || {}),
        rawTextLength: data.rawText?.length
      })

      if (!data.analysis || !data.specs || !data.rawText) {
        console.error('[Analysis Page] Invalid certificate data structure')
        router.push('/')
        return
      }
      
      setCertificateData(data)

      // Format the initial AI message
      try {
        // Parse the analysis JSON if it's a string
        const analysisObj = typeof data.analysis === 'string' ? JSON.parse(data.analysis) : data.analysis
        
        // Create a formatted message from the analysis object
        const sections = [
          // Overview section
          analysisObj.overview,
          
          // Detailed Analysis section
          '\nDetailed Analysis:',
          `• Cut: ${analysisObj.detailedAnalysis.cut}`,
          `• Color: ${analysisObj.detailedAnalysis.color}`,
          `• Clarity: ${analysisObj.detailedAnalysis.clarity}`,
          `• Carat: ${analysisObj.detailedAnalysis.carat}`,
          
          // Notable Features section
          '\nNotable Features:',
          ...analysisObj.notableFeatures.map((feature: string) => `• ${feature}`),
          
          // Potential Concerns section
          '\nPotential Concerns:',
          ...analysisObj.potentialConcerns.map((concern: string) => `• ${concern}`),
          
          // Questions for Jeweler section
          '\nQuestions to Consider:',
          ...analysisObj.questionsForJeweler.map((question: string) => `• ${question}`)
        ].join('\n')

        // Set initial message
        console.log('[Analysis Page] Setting initial message')
        const initialMessage = {
          id: 'initial',
          content: sections,
          role: 'assistant' as const,
          includeQuickQuestions: true
        };
        
        setMessages([initialMessage]);
        
        // Also add to conversation context for future API calls
        setConversationContext([
          {
            id: 'system',
            content: `You are a diamond expert analyzing this certificate. Here's what you know about it:

Certificate Type: ${data.specs.laboratory} ${data.specs.type} Diamond Certificate
Certificate Number: ${data.specs.certificateNumber}

Specifications:
• Carat Weight: ${data.specs.carat}
• Color Grade: ${data.specs.color}
• Clarity Grade: ${data.specs.clarity}
• Cut Grade: ${data.specs.cut}

Your role is to help users understand this specific diamond's characteristics, quality, and value. When answering questions:
1. Always refer to the specific details of this diamond
2. Explain how each characteristic impacts this diamond's quality and value
3. Provide context about why certain grades or features matter
4. Make comparisons when relevant to help users understand
5. Be specific about this diamond rather than giving general diamond information

IMPORTANT INSTRUCTIONS:
1. You MUST ONLY discuss this specific diamond and its characteristics
2. If asked about anything unrelated to this diamond or jewelry shopping, respond with: "I can only help you understand this specific diamond and its characteristics. What would you like to know about this diamond?"
3. Never break character or discuss AI, language models, or your capabilities
4. Focus solely on helping users understand this diamond's quality, characteristics, and value
5. Use the certificate details above as your primary reference
6. Use analogies and examples to explain the diamond's characteristics in a way that is easy to understand

Raw certificate text for additional details:
${data.rawText}`,
            role: 'assistant'
          },
          initialMessage
        ]);
      } catch (err) {
        console.error('[Analysis Page] Error formatting analysis:', err)
        // Fallback to raw analysis if parsing fails
        const fallbackMessage = {
          id: 'initial',
          content: typeof data.analysis === 'string' ? data.analysis : JSON.stringify(data.analysis, null, 2),
          role: 'assistant' as const,
          includeQuickQuestions: true
        };
        
        setMessages([fallbackMessage]);
        setConversationContext([fallbackMessage]);
      }
    } catch (err) {
      console.error('[Analysis Page] Error parsing certificate data:', err)
      router.push('/')
    }
  }, [router])

  // Quick questions based on certificate data
  const getQuickQuestions = () => {
    if (!certificateData) return [];

    const questions = [
      'Can you explain more about the diamond\'s cut quality?',
      'How does this color grade affect the diamond\'s appearance?',
      'What are the key factors that determined this clarity grade?',
      'How does this diamond compare to others with similar specifications?'
    ];

    // Add specific questions based on certificate data
    if (certificateData.specs.type === 'Lab-Grown') {
      questions.push('What are the main differences between lab-grown and natural diamonds?');
    }

    if (['SI1', 'SI2', 'I1', 'I2', 'I3'].includes(certificateData.specs.clarity)) {
      questions.push('Are the inclusions visible to the naked eye?');
    }

    if (['D', 'E', 'F'].includes(certificateData.specs.color)) {
      questions.push('What makes this diamond\'s color so exceptional?');
    }

    return questions;
  };

  const handleSendMessage = (content: string) => {
    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user'
    };
    
    // Simply append the user message to the messages array
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
  };
  
  const handleNewAssistantMessage = (message: Message) => {
    // If this is a new message, append it
    // If it's an update to an existing message (streaming), update that message
    setMessages(prev => {
      const existingIndex = prev.findIndex(m => m.id === message.id);
      if (existingIndex >= 0) {
        const newMessages = [...prev];
        newMessages[existingIndex] = message;
        return newMessages;
      }
      return [...prev, message];
    });
    
    setIsTyping(false);
  };

  if (!certificateData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Diamond specifications */}
        <div className="lg:col-span-1">
          <CertificateSummaryCard specs={certificateData.specs} />
        </div>

        {/* Right column - Chat interface */}
        <div className="lg:col-span-2">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onNewAssistantMessage={handleNewAssistantMessage}
            isTyping={isTyping}
            quickQuestions={getQuickQuestions()}
            certificateText={certificateData.rawText}
            certificateSpecs={certificateData.specs}
          />
        </div>
      </div>
    </div>
  );
} 