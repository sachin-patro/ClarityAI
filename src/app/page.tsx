'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CertificateUpload from '../components/CertificateUpload'
import LoadingScreen from '../components/LoadingScreen'
import { useRouter } from 'next/navigation'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const benefits = [
  {
    icon: "🔍",
    text: "Translate confusing diamond lingo into plain English"
  },
  {
    icon: "💎",
    text: "Know exactly what you're paying for"
  },
  {
    icon: "💡",
    text: "Ask the right questions when shopping"
  },
  {
    icon: "✓",
    text: "Avoid common diamond shopping mistakes"
  }
]

const steps = [
  {
    number: "1",
    title: "Upload your diamond certificate",
    description: "Simply drag & drop your GIA/IGI certificate PDF"
  },
  {
    number: "2",
    title: "Our AI analyzes the diamond specifications",
    description: "Advanced AI models process every detail of your diamond"
  },
  {
    number: "3",
    title: "Receive a plain-English explanation",
    description: "Get clear insights and smart shopping advice"
  }
]

const sampleCertificateData = {
  analysis: JSON.stringify({
    overview: "This is a high-quality 1-carat round brilliant diamond with excellent proportions and exceptional color.",
    detailedAnalysis: {
      cut: "The Excellent cut grade indicates optimal light performance and sparkle.",
      color: "D color grade represents the highest and most rare color grade, completely colorless.",
      clarity: "VS1 clarity means the diamond is very slightly included, but inclusions are difficult to see under 10x magnification.",
      carat: "At 1.01 carats, this is a classic size that balances presence and value."
    },
    notableFeatures: [
      "Excellent symmetry and polish",
      "Ideal proportions for maximum brilliance",
      "No fluorescence, ensuring consistent appearance"
    ],
    potentialConcerns: [
      "Premium pricing due to D color grade",
      "Consider if the premium for D color is worth it over an F or G color"
    ],
    questionsForJeweler: [
      "Can you show me how this diamond looks in different lighting conditions?",
      "What is the price premium for D color versus F color?",
      "Can you show me the diamond's light performance under an ASET scope?"
    ]
  }),
  specs: {
    carat: 1.01,
    color: "D",
    clarity: "VS1",
    cut: "Excellent",
    certificateNumber: "0123456789",
    laboratory: "GIA",
    type: "Natural"
  },
  rawText: `
ROUND BRILLIANT CUT DIAMOND
Shape and Cutting Style: ROUND BRILLIANT
Measurements: 6.61 - 6.64 x 4.05 MM
Carat Weight: 1.01 carat
Color Grade: D
Clarity Grade: VS1
Cut Grade: EXCELLENT
Polish: EXCELLENT
Symmetry: EXCELLENT
Fluorescence: NONE
  `
};

export default function Home() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
  }

  const handleViewSample = () => {
    // Show loading screen
    setIsAnalyzing(true)
    
    // Store sample data in localStorage
    localStorage.setItem('certificateData', JSON.stringify(sampleCertificateData))
    
    // Wait 3 seconds before redirecting
    setTimeout(() => {
      router.push('/analysis')
    }, 3000)
  }

  return (
    <div className="min-h-screen">
      {isAnalyzing && <LoadingScreen />}
      {/* Content */}
      <div className="relative">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <motion.div 
              className="space-y-10"
              initial="initial"
              animate="animate"
              variants={fadeIn}
            >
              <div className="space-y-6">
                <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 leading-tight">
                  Understand Your Diamond Certificate in Plain English
                </h2>
                <p className="text-xl text-gray-600">
                  Upload your GIA/IGI certificate and get expert analysis that anyone can understand
                </p>
              </div>

              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-4 bg-white p-5 rounded-lg shadow-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-3xl">{benefit.icon}</span>
                    <span className="text-gray-700 text-lg">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-xl border border-gray-100"
              initial="initial"
              animate="animate"
              variants={fadeIn}
            >
              <CertificateUpload onAnalysisStart={handleAnalysisStart} />
              <div className="mt-6 text-center">
                <button
                  onClick={handleViewSample}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-medium text-2xl py-3 px-6 rounded-lg w-full transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>👀</span>
                  <span>See a sample analysis first</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                How It Works
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-full mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-gray-600 text-lg">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 