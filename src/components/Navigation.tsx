'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Animated Text Logo */}
            <div className="flex-shrink-0">
              <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 animate-gradient">
                ClarityAI
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Upload
              </Link>

              <Link
                href="/analysis"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/analysis')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Analysis
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Blue Accent Bar */}
      <div className="h-2 bg-[#4285F4]" />
    </>
  );
};

export default Navigation; 