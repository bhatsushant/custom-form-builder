// app/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useFormContext } from "./context/FormContext";

interface FormData {
  title: string;
  description: string;
  fields: any[];
  slug: string;
}

export default function HomePage() {
  const [formSlug, setFormSlug] = useState("");
  const [drafts, setDrafts] = useState<FormData[]>([]);
  const { forms } = useFormContext();

  const savedForms = Object.values(forms);

  useEffect(() => {
    // Load drafts
    const draftsData = JSON.parse(localStorage.getItem("drafts") || "{}");
    setDrafts(Object.values(draftsData));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
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

        {/* Quick Access */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter form slug to access"
              value={formSlug}
              onChange={e => setFormSlug(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-2">
              <Link
                href={formSlug ? `/form/${formSlug}` : "#"}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  formSlug
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                📝 Fill Form
              </Link>
              <Link
                href={formSlug ? `/dashboard/${formSlug}` : "#"}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  formSlug
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                📊 View Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Saved Forms */}
        {savedForms.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Forms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedForms.map((form, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    {form.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {form.description || "No description"}
                  </p>
                  <div className="text-sm text-gray-500 mb-4">
                    {form.fields.length} field
                    {form.fields.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/form/${form.slug}`}
                      className="flex-1 text-center px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                    >
                      Fill
                    </Link>
                    <Link
                      href={`/dashboard/${form.slug}`}
                      className="flex-1 text-center px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
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
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Draft Forms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map((draft, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    {draft.title || "Untitled Draft"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {draft.description || "No description"}
                  </p>
                  <div className="text-sm text-gray-500 mb-4">
                    {draft.fields.length} field
                    {draft.fields.length !== 1 ? "s" : ""}
                  </div>
                  <Link
                    href="/builder"
                    className="block text-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
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
