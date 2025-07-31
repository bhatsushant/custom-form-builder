// app/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useFormContext } from "./context/FormContext";
import { useTheme } from "./context/ThemeContext";

interface FormData {
  title: string;
  description: string;
  fields: any[];
  slug: string;
}

export default function HomePage() {
  const [formSlug, setFormSlug] = useState("");
  const [drafts, setDrafts] = useState<FormData[]>([]);
  const [mounted, setMounted] = useState(false);
  const { forms } = useFormContext();

  // Handle theme safely after mounting
  let theme = "light";
  let toggleTheme = () => {};
  let isDark = false;

  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
    isDark = themeContext.isDark;
  } catch (error) {
    // Theme context not available yet during hydration
  }

  const savedForms = Object.values(forms);

  useEffect(() => {
    setMounted(true);
    // Load drafts
    const draftsData = JSON.parse(localStorage.getItem("drafts") || "{}");
    setDrafts(Object.values(draftsData));
  }, []);

  // Don't render theme-dependent UI until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Custom Form Builder
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create beautiful forms with real-time analytics
            </p>
            <Link
              href="/builder"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="mr-2">➕</span>
              Create New Form
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-8">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Custom Form Builder
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Create beautiful forms with real-time analytics
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <span className="mr-2">➕</span>
            Create New Form
          </Link>
        </div>

        {/* Quick Access */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 mb-8 transition-colors duration-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Quick Access
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter form slug to access"
              value={formSlug}
              onChange={e => setFormSlug(e.target.value)}
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
            <div className="flex gap-2">
              <Link
                href={formSlug ? `/form/${formSlug}` : "#"}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  formSlug
                    ? "bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                📝 Fill Form
              </Link>
              <Link
                href={formSlug ? `/dashboard/${formSlug}` : "#"}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  formSlug
                    ? "bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                📊 View Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Saved Forms */}
        {savedForms.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 mb-8 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Your Forms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedForms.map((form, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-700 transition-all duration-300 bg-white dark:bg-gray-750"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {form.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {form.description || "No description"}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {form.fields.length} field
                    {form.fields.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/form/${form.slug}`}
                      className="flex-1 text-center px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 text-sm transition-colors"
                    >
                      Fill
                    </Link>
                    <Link
                      href={`/dashboard/${form.slug}`}
                      className="flex-1 text-center px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 text-sm transition-colors"
                    >
                      Analytics
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drafts */}
        {drafts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 mb-8 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Draft Forms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map((draft, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-700 transition-all duration-300 bg-white dark:bg-gray-750"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {draft.title || "Untitled Draft"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {draft.description || "No description"}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {draft.fields.length} field
                    {draft.fields.length !== 1 ? "s" : ""}
                  </div>
                  <Link
                    href="/builder"
                    className="block text-center px-3 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 text-sm transition-colors"
                  >
                    Continue Editing
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold mb-2">Drag & Drop Builder</h3>
            <p className="text-gray-600 text-sm">
              Create forms easily with our intuitive drag-and-drop interface
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-gray-600 text-sm">
              Monitor responses and see insights update live as submissions come
              in
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Custom Validation</h3>
            <p className="text-gray-600 text-sm">
              Set up custom validation rules and required fields for data
              quality
            </p>
          </div>
        </div>

        {/* Getting Started */}
        {savedForms.length === 0 && drafts.length === 0 && (
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Welcome! Let's get started
            </h2>
            <p className="text-blue-700 mb-6">
              Create your first form to start collecting responses and viewing
              analytics
            </p>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>Click "Create New Form" to start building</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Add fields by clicking on field types</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>Save your form and share the link</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </span>
                <span>Watch responses come in real-time!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
