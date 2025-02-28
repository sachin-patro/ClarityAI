'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone, DropzoneOptions } from 'react-dropzone'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface CertificateUploadProps {
  onAnalysisStart?: () => void;
}

export default function CertificateUpload({ 
  onAnalysisStart 
}: CertificateUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')

  // Check API availability on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Test the API endpoint
        const response = await fetch('/api/analyze', { method: 'OPTIONS' });
        if (response.ok) {
          setApiStatus('available');
        } else {
          console.error('API test failed:', response.status, response.statusText);
          setApiStatus('unavailable');
          setError('API is not available. Please check the server logs.');
        }
      } catch (err) {
        console.error('Error checking API status:', err);
        setApiStatus('unavailable');
        setError('Could not connect to the API. Please check your network connection.');
      }
    };
    
    checkApiStatus();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    // Don't proceed if API is not available
    if (apiStatus !== 'available') {
      setError('API is not available. Please check the server logs.');
      return;
    }

    const file = acceptedFiles[0]
    console.log(`File selected: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)
    
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    setIsUploading(true)
    setError(null)
    setDebugInfo(null)
    
    // Notify parent component that analysis has started
    if (onAnalysisStart) {
      onAnalysisStart()
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Send request to analyze endpoint
      console.log('[Upload Flow] Starting analysis request')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      console.log('[Upload Flow] Response status:', response.status, response.statusText)
      console.log('[Upload Flow] Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        // Handle error response
        let errorMessage = 'Failed to analyze certificate';
        let debugMessage = `Status: ${response.status} ${response.statusText}`;
        
        try {
          const contentType = response.headers.get('content-type');
          debugMessage += `, Content-Type: ${contentType}`;
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
            debugMessage += `, Error: ${JSON.stringify(errorData)}`;
          } else {
            // Not JSON, try to get the response text
            const responseText = await response.text();
            debugMessage += `, Response: ${responseText.substring(0, 100)}...`;
            
            // If it's HTML, it might be a 404 or 500 page
            if (responseText.includes('<!DOCTYPE html>')) {
              errorMessage = `Server error (${response.status}). The API endpoint might not exist.`;
            } else {
              errorMessage = `Error: ${response.status} ${response.statusText}`;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          debugMessage += `, Parse error: ${parseError}`;
          errorMessage = `Server error (${response.status})`;
        }
        
        console.error(debugMessage);
        setDebugInfo(debugMessage);
        throw new Error(errorMessage);
      }

      // Parse the JSON response
      const responseData = await response.json()
      console.log('[Upload Flow] Full API Response:', responseData)

      // Validate the response structure
      if (!responseData.analysis || !responseData.specifications) {
        console.error('[Upload Flow] Invalid response structure:', responseData)
        throw new Error('Invalid response from server. Missing analysis or specifications.')
      }

      // Store the certificate data and analysis in localStorage
      const certificateData = {
        analysis: responseData.analysis,
        specs: responseData.specifications,
        rawText: responseData.textPreview
      }
      console.log('[Upload Flow] Certificate data to store:', certificateData)
      
      try {
        localStorage.setItem('certificateData', JSON.stringify(certificateData))
        console.log('[Upload Flow] Data stored in localStorage successfully')
        
        // Add a small delay before redirecting to ensure localStorage is updated
        await new Promise(resolve => setTimeout(resolve, 100))
        
        console.log('[Upload Flow] Redirecting to analysis page...')
        router.push('/analysis')
      } catch (storageError) {
        console.error('[Upload Flow] Error storing data:', storageError)
        throw new Error('Failed to store certificate data. Please try again.')
      }
    } catch (err) {
      console.error('[Upload Flow] Error in upload process:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze certificate. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [onAnalysisStart, apiStatus, router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
    disabled: apiStatus !== 'available'
  } as DropzoneOptions)

  // Separate the dropzone props from the motion props to avoid type conflicts
  const dropzoneProps = getRootProps()

  // If API is not available, show a message
  if (apiStatus === 'checking') {
    return (
      <div className="bg-gradient-to-r from-[#4361ee]/10 to-transparent p-6 rounded-lg">
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <ArrowUpTrayIcon className="w-16 h-16 text-gray-300 mb-6" />
            <p className="text-gray-500">Checking API availability...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#4361ee]/10 to-transparent p-6 rounded-lg">
      <motion.div
        // Spread the dropzone props separately to avoid type conflicts
        onClick={dropzoneProps.onClick}
        onKeyDown={dropzoneProps.onKeyDown}
        onFocus={dropzoneProps.onFocus}
        onBlur={dropzoneProps.onBlur}
        tabIndex={dropzoneProps.tabIndex}
        onDragEnter={dropzoneProps.onDragEnter}
        onDragOver={dropzoneProps.onDragOver}
        onDragLeave={dropzoneProps.onDragLeave}
        onDrop={dropzoneProps.onDrop}
        ref={dropzoneProps.ref}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-[#4361ee] bg-[#4361ee]/5' 
            : apiStatus !== 'available'
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        whileHover={apiStatus === 'available' ? { scale: 1.02 } : {}}
        whileTap={apiStatus === 'available' ? { scale: 0.98 } : {}}
      >
        <input {...getInputProps()} />
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
          className="mb-6"
        >
          <ArrowUpTrayIcon className={`w-16 h-16 mx-auto transition-colors
            ${isDragActive 
              ? 'text-[#4361ee]' 
              : apiStatus !== 'available'
                ? 'text-gray-300'
                : 'text-gray-400'
            }`} 
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
                Let&apos;s analyze your diamond
              </p>
            </motion.div>
          ) : apiStatus !== 'available' ? (
            <motion.div
              key="api-unavailable"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              <p className="text-gray-500 font-medium text-xl">
                API is not available
              </p>
              <p className="text-gray-400">
                Please check the server logs
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
            {debugInfo && (
              <div className="mt-2 text-xs text-gray-500 overflow-auto max-h-32 text-left">
                <details>
                  <summary>Debug Info</summary>
                  <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                </details>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper function to extract diamond specifications from certificate text
function extractSpecs(text: string) {
  console.log('[Spec Extraction] Starting spec extraction from text:', text.substring(0, 200) + '...')
  
  const specs = {
    carat: 0,
    color: '',
    clarity: '',
    cut: '',
    certificateNumber: '',
    laboratory: '' as 'GIA' | 'IGI',
    type: '' as 'Natural' | 'Lab-Grown'
  };

  // First determine the laboratory
  if (text.includes('GIA')) {
    specs.laboratory = 'GIA';
  } else if (text.includes('IGI')) {
    specs.laboratory = 'IGI';
  }

  // Extract values using regex patterns
  // Look for weight/carat with various formats
  const caratMatch = text.match(/(?:weight|carat)\D*(\d+\.\d+)\s*(?:carat|ct\.?|cts\.?)?/i) ||
                    text.match(/(\d+\.\d+)\s*(?:carat|ct\.?|cts\.?)/i);
  console.log('[Spec Extraction] Carat match attempt:', caratMatch?.[1])
  if (caratMatch) specs.carat = parseFloat(caratMatch[1]);

  // Look for color with various formats
  const colorMatch = text.match(/(?:color[^A-Z]*)(D|E|F|G|H|I|J|K)\b/i) ||
                    text.match(/\b(D|E|F|G|H|I|J|K)(?:\s*color)/i);
  console.log('[Spec Extraction] Color match attempt:', colorMatch?.[1])
  if (colorMatch) specs.color = colorMatch[1].toUpperCase();

  // Look for clarity with various formats
  const clarityMatch = text.match(/(?:clarity[^A-Z]*)(FL|IF|VVS1|VVS2|VS1|VS2|SI1|SI2|I1|I2|I3)\b/i) ||
                      text.match(/\b(FL|IF|VVS1|VVS2|VS1|VS2|SI1|SI2|I1|I2|I3)(?:\s*clarity)?/i);
  console.log('[Spec Extraction] Clarity match attempt:', clarityMatch?.[1])
  if (clarityMatch) specs.clarity = clarityMatch[1].toUpperCase();

  // Look for cut grade with various formats
  const cutMatch = text.match(/(?:cut[^A-Z]*)(Excellent|Very Good|Good|Fair|Poor)\b/i) ||
                  text.match(/\b(Excellent|Very Good|Good|Fair|Poor)(?:\s*cut)?/i);
  console.log('[Spec Extraction] Cut match attempt:', cutMatch?.[1])
  if (cutMatch) specs.cut = cutMatch[1];

  // Look for certificate number in various formats
  const certNumberMatch = text.match(/(?:number|no\.?|#|report)\s*:?\s*(?:GIA|IGI)?\s*(\d[\d-]*\d)/i) || 
                         text.match(/\b(?:GIA|IGI)\s*(?:number|no\.?|#|report)?\s*:?\s*(\d[\d-]*\d)/i) ||
                         text.match(/\b(\d{10})\b/); // GIA often uses 10-digit numbers
  console.log('[Spec Extraction] Certificate number match attempt:', certNumberMatch?.[1])
  if (certNumberMatch) {
    specs.certificateNumber = certNumberMatch[1].replace(/[-\s]/g, '');
  }

  // Look for type indicators with more variations
  const typeMatch = text.match(/\b(Lab(?:oratory)?[\s-]Grown|Natural|Type\s*(?:IIa?|IIb|Ia|Ib)|Synthetic|Man-Made)\b/i);
  console.log('[Spec Extraction] Type match attempt:', typeMatch?.[1])
  if (typeMatch?.[1]) {
    const matchedType = typeMatch[1].toLowerCase();
    if (matchedType.includes('lab') || matchedType.includes('grown') || 
        matchedType.includes('synthetic') || matchedType.includes('man-made')) {
      specs.type = 'Lab-Grown';
    } else {
      specs.type = 'Natural';
    }
  } else {
    // Set a default type if no match is found
    specs.type = text.toLowerCase().includes('laboratory') ? 'Lab-Grown' : 'Natural';
  }

  console.log('[Spec Extraction] Final extracted specs:', specs)
  return specs;
} 