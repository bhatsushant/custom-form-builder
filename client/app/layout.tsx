// components/Layout.tsx
import React, { useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? "dark" : ""}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  Form Builder
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="hidden md:flex space-x-4">
                  <a
                    href="/"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md"
                  >
                    Builder
                  </a>
                  <a
                    href="/analytics"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md"
                  >
                    Analytics
                  </a>
                </div>

                <button
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <a
                    href="/"
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300"
                  >
                    Builder
                  </a>
                  <a
                    href="/analytics"
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300"
                  >
                    Analytics
                  </a>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main content */}
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
