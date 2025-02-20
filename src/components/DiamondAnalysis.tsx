'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface DiamondAnalysisProps {
  analysis: string
  isLoading?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DiamondAnalysis({ analysis, isLoading = false }: DiamondAnalysisProps) {
  if (isLoading) {
    return (
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-4 bg-[#4361ee]/5 rounded-full w-3/4 animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-4 bg-[#4361ee]/5 rounded-full animate-pulse"></div>
          <div className="h-4 bg-[#4361ee]/5 rounded-full w-5/6 animate-pulse"></div>
          <div className="h-4 bg-[#4361ee]/5 rounded-full w-4/6 animate-pulse"></div>
        </div>
      </motion.div>
    )
  }

  if (!analysis) {
    return null
  }

  // Split the analysis into sections based on numbered headers
  const sections = analysis.split(/\d+\.\s+/).filter(Boolean)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="bg-white rounded-xl shadow-lg p-8 space-y-8 border border-gray-100"
    >
      {sections.map((section, index) => {
        const [title, ...content] = section.split('\n').filter(Boolean)
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-[#4361ee] text-white rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {title}
              </h3>
            </div>
            <div className="ml-11 space-y-3">
              {content.map((paragraph, pIndex) => (
                <motion.p
                  key={pIndex}
                  variants={itemVariants}
                  className="text-gray-600 leading-relaxed"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
} 