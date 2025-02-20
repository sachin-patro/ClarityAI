'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone, DropzoneOptions } from 'react-dropzone'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

export default function CertificateUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/analyze-certificate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze certificate')
      }

      // Handle successful upload
      const result = await response.json()
      // TODO: Handle the analysis result
    } catch (err) {
      setError('Failed to analyze certificate. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  } as DropzoneOptions)

  return (
    <div className="bg-gradient-to-r from-[#4361ee]/10 to-transparent p-6 rounded-lg">
      <motion.div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-[#4361ee] bg-[#4361ee]/5' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
          className="mb-6"
        >
          <ArrowUpTrayIcon className={`w-16 h-16 mx-auto transition-colors
            ${isDragActive ? 'text-[#4361ee]' : 'text-gray-400'}`} 
          />
        </motion.div>
        <AnimatePresence mode="wait">
          {isDragActive ? (
            <motion.div
              key="drag-active"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-2"
            >
              <p className="text-[#4361ee] font-medium text-xl">
                Drop your certificate here
              </p>
              <p className="text-[#4361ee]/60 text-sm">
                Let's analyze your diamond
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="drag-inactive"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              <p className="text-gray-600 font-medium text-xl">
                Drag and drop your certificate here
              </p>
              <p className="text-gray-500">
                or click to select a file
              </p>
              <p className="text-sm text-gray-400 mt-4">
                Supports GIA/IGI PDF certificates
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center px-6 py-3 bg-[#4361ee]/5 text-[#4361ee] rounded-full">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing your certificate...
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 text-center text-red-500 bg-red-50 px-6 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 