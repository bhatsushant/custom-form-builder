"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationProps {
  showBackToHome?: boolean;
  customTitle?: string;
  rightActions?: React.ReactNode;
}

export default function Navigation({
  showBackToHome = true,
  customTitle,
  rightActions
}: NavigationProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (isHomePage && !customTitle) {
    return null; // Don't show navigation on home page unless custom title is provided
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Back to Home */}
          <div className="flex items-center space-x-4">
            {showBackToHome && (
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="font-medium">Back to Home</span>
              </Link>
            )}
            {customTitle && (
              <h1 className="text-xl font-semibold text-gray-900">
                {customTitle}
              </h1>
            )}
          </div>

          {/* Center - App Title (when not on home page) */}
          {!isHomePage && !customTitle && (
            <div className="flex-1 text-center">
              <Link
                href="/"
                className="text-lg font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Custom Form Builder
              </Link>
            </div>
          )}

          {/* Right side - Custom actions */}
          <div className="flex items-center space-x-3">{rightActions}</div>
        </div>
      </div>
    </div>
  );
}
