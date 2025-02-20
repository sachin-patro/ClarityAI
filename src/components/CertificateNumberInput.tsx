'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CertificateNumberInput() {
  const [certificateNumber, setCertificateNumber] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!certificateNumber.trim()) {
      setError('Please enter a certificate number')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-certificate-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certificateNumber }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze certificate')
      }

      // Handle successful analysis
      const result = await response.json()
      // TODO: Handle the analysis result
    } catch (err) {
      setError('Failed to analyze certificate. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <motion.label 
          htmlFor="certificate-number" 
          className="block text-sm font-medium text-gray-700 mb-2"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Certificate Number
        </motion.label>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="text"
            id="certificate-number"
            value={certificateNumber}
            onChange={(e) => setCertificateNumber(e.target.value)}
            placeholder="Enter GIA certificate number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4361ee] focus:border-[#4361ee] transition-all placeholder:text-gray-400"
            disabled={isAnalyzing}
          />
        </motion.div>
      </div>

      <motion.button
        type="submit"
        disabled={isAnalyzing}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all
          ${isAnalyzing
            ? 'bg-[#4361ee]/70 cursor-not-allowed'
            : 'bg-[#4361ee] hover:bg-[#4361ee]/90'
          }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isAnalyzing ? (
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </div>
        ) : (
          'Analyze Certificate'
        )}
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  )
} 