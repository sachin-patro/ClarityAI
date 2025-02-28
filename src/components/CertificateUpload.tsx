'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone, DropzoneOptions } from 'react-dropzone'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface CertificateUploadProps {
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (analysis: string) => void;
}

export default function CertificateUpload({ 
  onAnalysisStart, 
  onAnalysisComplete 
}: CertificateUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')
  const [routeTestResults, setRouteTestResults] = useState<string[]>([])

  // Check API availability on component mount and test routes
  useEffect(() => {
    const checkApiStatus = async () => {
      const results: string[] = [];
      
      try {
        // Test the first route format
        try {
          console.log('Testing /api/test-route...');
          const testRouteResponse = await fetch('/api/test-route');
          const testRouteStatus = testRouteResponse.status;
          results.push(`/api/test-route: ${testRouteStatus} ${testRouteResponse.statusText}`);
          console.log(`/api/test-route response:`, testRouteStatus, testRouteResponse.statusText);
        } catch (err) {
          results.push(`/api/test-route: Error - ${err}`);
          console.error('Error testing /api/test-route:', err);
        }
        
        // Test the second route format
        try {
          console.log('Testing /api/simple-test...');
          const simpleTestResponse = await fetch('/api/simple-test');
          const simpleTestStatus = simpleTestResponse.status;
          results.push(`/api/simple-test: ${simpleTestStatus} ${simpleTestResponse.statusText}`);
          console.log(`/api/simple-test response:`, simpleTestStatus, simpleTestResponse.statusText);
        } catch (err) {
          results.push(`/api/simple-test: Error - ${err}`);
          console.error('Error testing /api/simple-test:', err);
        }
        
        // Test the original route
        try {
          console.log('Testing /api/pdf-analysis with OPTIONS...');
          const optionsResponse = await fetch('/api/pdf-analysis', { method: 'OPTIONS' });
          results.push(`/api/pdf-analysis OPTIONS: ${optionsResponse.status} ${optionsResponse.statusText}`);
          console.log(`/api/pdf-analysis OPTIONS response:`, optionsResponse.status, optionsResponse.statusText);
        } catch (err) {
          results.push(`/api/pdf-analysis OPTIONS: Error - ${err}`);
          console.error('Error testing /api/pdf-analysis with OPTIONS:', err);
        }
        
        // Test the pages API route
        try {
          console.log('Testing /api/analyze with OPTIONS...');
          const pagesResponse = await fetch('/api/analyze', { method: 'OPTIONS' });
          results.push(`/api/analyze OPTIONS: ${pagesResponse.status} ${pagesResponse.statusText}`);
          console.log(`/api/analyze OPTIONS response:`, pagesResponse.status, pagesResponse.statusText);
        } catch (err) {
          results.push(`/api/analyze OPTIONS: Error - ${err}`);
          console.error('Error testing /api/analyze with OPTIONS:', err);
        }
        
        // Set the results
        setRouteTestResults(results);
        
        // Original API test
        const response = await fetch('/api/test');
        if (response.ok) {
          const data = await response.json();
          console.log('API test response:', data);
          setApiStatus('available');
          
          if (!data.openaiKeyAvailable) {
            setError('OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.');
          }
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
      console.log('Sending request to /api/analyze')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      console.log('Response received:', response.status, response.statusText)
      
      if (!response.ok) {
        // Try to parse as JSON, but handle non-JSON responses gracefully
        let errorMessage = 'Failed to analyze certificate';
        let debugMessage = `Status: ${response.status} ${response.statusText}`;
        
        try {
          const contentType = response.headers.get('content-type');
          debugMessage += `, Content-Type: ${contentType}`;
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
            debugMessage += `, Error: ${JSON.stringify(errorData)}`;
            
            // If we have a text preview despite the error, show it
            if (errorData.textPreview) {
              const fallbackAnalysis = `
1. Overview
Failed to get AI analysis, but here's the extracted text:

${errorData.textPreview}

2. Detailed Analysis of 4Cs
AI analysis unavailable.

3. Notable Features
Text extraction successful with ${errorData.textLength} characters.

4. Potential Concerns
Unable to perform AI analysis. Please try again later.

5. Questions for the Jeweler
Please ask about the details mentioned in the certificate.
              `;
              
              if (onAnalysisComplete) {
                onAnalysisComplete(fallbackAnalysis);
              }
            }
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
      const responseData = await response.json();
      console.log('Analysis response:', responseData);
      
      // Use the AI analysis if available, otherwise fall back to the text preview
      if (responseData.analysis) {
        if (onAnalysisComplete) {
          onAnalysisComplete(responseData.analysis);
        }
      } else if (responseData.textPreview) {
        const fallbackAnalysis = `
1. Overview
This is a diamond certificate with the following text extracted:

${responseData.textPreview}

2. Detailed Analysis of 4Cs
AI analysis unavailable.

3. Notable Features
Text extraction successful with ${responseData.textLength} characters.

4. Potential Concerns
None at this stage.

5. Questions for the Jeweler
Ask about the details mentioned in the certificate.
        `;
        
        if (onAnalysisComplete) {
          onAnalysisComplete(fallbackAnalysis);
        }
      } else {
        throw new Error('No analysis or text preview in the response');
      }
    } catch (err) {
      console.error('Error analyzing certificate:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze certificate. Please try again.')
      // If there's an error, pass empty analysis to reset the UI
      if (onAnalysisComplete) {
        onAnalysisComplete('')
      }
    } finally {
      setIsUploading(false)
    }
  }, [onAnalysisStart, onAnalysisComplete, apiStatus])

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
      {/* Route test results */}
      {routeTestResults.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">API Route Tests</summary>
            <ul className="mt-2 space-y-1">
              {routeTestResults.map((result, index) => (
                <li key={index}>{result}</li>
              ))}
            </ul>
          </details>
        </div>
      )}
      
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
                Let's analyze your diamond
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