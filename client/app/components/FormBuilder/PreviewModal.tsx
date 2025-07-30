// components/FormBuilder/PreviewModal.tsx
import React from "react";
import { X } from "lucide-react";
import { FormData } from "./FormBuilder";
import FormRenderer from "../FormRenderer/FormRenderer";

interface PreviewModalProps {
  form: FormData;
  onClose: () => void;
}

export default function PreviewModal({ form, onClose }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Form Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">
                {form.title || "Untitled Form"}
              </h1>
              {form.description && (
                <p className="text-gray-600 dark:text-gray-300">
                  {form.description}
                </p>
              )}
            </div>

            <div className="space-y-6">
              {form.fields.map(field => (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm font-medium">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  {field.type === "text" && (
                    <input
                      type="text"
                      disabled
                      placeholder="Text input preview"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                    />
                  )}

                  {field.type === "multiple-choice" && (
                    <div className="space-y-2">
                      {field.options?.map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input type="radio" name={field.id} disabled />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === "checkbox" && (
                    <div className="space-y-2">
                      {field.options?.map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input type="checkbox" disabled />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === "rating" && (
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className="text-gray-300 text-2xl">
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button
                disabled
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg opacity-50 cursor-not-allowed"
              >
                Submit Response (Preview Mode)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
