import React, { useState, useEffect } from 'react';

const loadingTexts = [
  "Analyzing sparkle factor...",
  "Measuring brilliance levels...",
  "Counting light reflections...",
  "Calculating diamond DNA...",
  "Measuring carat perfection...",
  "Calculating sparkle quotient...",
  "Analyzing gem geometry...",
  "Scanning for exceptional radiance...",
  "Examining crystal structure..."
];

export default function LoadingScreen() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => 
        prevIndex === loadingTexts.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-blue-50 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="inline-block mb-8">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Animated Text */}
        <div className="h-8"> {/* Fixed height to prevent layout shift */}
          <p 
            key={currentTextIndex}
            className="text-xl text-blue-600 animate-fade-in"
          >
            {loadingTexts[currentTextIndex]}
          </p>
        </div>
      </div>
    </div>
  );
} 