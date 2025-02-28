'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import CertificateUpload from '../components/CertificateUpload'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const benefits = [
  {
    icon: "🔍",
    text: "Decode technical jargon into simple explanations"
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
    description: "Advanced algorithms process every detail of your diamond"
  },
  {
    number: "3",
    title: "Receive plain-English explanation",
    description: "Get clear insights and smart shopping advice"
  }
]

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <motion.div 
            className="space-y-8"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-gray-900 leading-tight">
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
                  className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-2xl">{benefit.icon}</span>
                  <span className="text-gray-700">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <CertificateUpload onAnalysisStart={handleAnalysisStart} />
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
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
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
                <div className="bg-[#4361ee]/5 p-6 rounded-lg">
                  <div className="flex items-center justify-center w-12 h-12 bg-[#4361ee] text-white rounded-full mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 