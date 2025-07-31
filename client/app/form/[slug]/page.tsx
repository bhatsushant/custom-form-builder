"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import { useTheme } from "../../context/ThemeContext";
import { useFormContext } from "../../context/FormContext";
import { api } from "../../utils/api";

interface FormField {
  id: string;
  type: "text" | "multiple-choice" | "checkbox" | "rating";
  label: string;
  options?: string[];
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface FormData {
  id?: number;
  title: string;
  description: string;
  fields: FormField[];
  slug: string;
  created_at?: string;
  updated_at?: string;
}

interface FormResponse {
  [fieldId: string]: any;
}

export default function FormPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isDark } = useTheme();
  const { getForm } = useFormContext();
  const [form, setForm] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<FormResponse>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!slug) return;

    // Load form from FormContext (which now loads from API)
    const formData = getForm(slug as string);
    if (formData) {
      setForm(formData);
    }
  }, [slug, getForm]);

  const validateField = (field: FormField, value: any): string | null => {
    if (
      field.required &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      return `${field.label} is required`;
    }

    if (field.type === "text" && field.validation && value) {
      if (
        field.validation.minLength &&
        value.length < field.validation.minLength
      ) {
        return `${field.label} must be at least ${field.validation.minLength} characters`;
      }
      if (
        field.validation.maxLength &&
        value.length > field.validation.maxLength
      ) {
        return `${field.label} must be no more than ${field.validation.maxLength} characters`;
      }
      if (
        field.validation.pattern &&
        !new RegExp(field.validation.pattern).test(value)
      ) {
        return `${field.label} format is invalid`;
      }
    }

    return null;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setIsSubmitting(true);
    const newErrors: { [key: string]: string } = {};

    // Validate all fields
    form.fields.forEach(field => {
      const error = validateField(field, responses[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit response to backend API
      if (form.id) {
        await api.post(`/forms/${form.id}/responses/`, {
          responses: responses
        });
      } else {
        // Fallback to localStorage if form doesn't have an ID
        const existingResponses = JSON.parse(
          localStorage.getItem("responses") || "{}"
        );
        if (!existingResponses[form.slug]) {
          existingResponses[form.slug] = [];
        }
        existingResponses[form.slug].push({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          data: responses
        });
        localStorage.setItem("responses", JSON.stringify(existingResponses));
      }

      setIsSubmitting(false);
      setSubmitted(true);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push(`/dashboard/${form.slug}`);
      }, 2000);
    } catch (error) {
      console.error("Failed to submit form:", error);
      setIsSubmitting(false);

      // Fallback to localStorage on error
      const existingResponses = JSON.parse(
        localStorage.getItem("responses") || "{}"
      );
      if (!existingResponses[form.slug]) {
        existingResponses[form.slug] = [];
      }
      existingResponses[form.slug].push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        data: responses
      });
      localStorage.setItem("responses", JSON.stringify(existingResponses));

      // Still show success since we saved locally
      setSubmitted(true);
      setTimeout(() => {
        router.push(`/dashboard/${form.slug}`);
      }, 2000);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation customTitle="Loading Form..." />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation customTitle="Form Not Found" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Form not found
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The form you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation customTitle="Form Submitted" />
        <div className="flex items-center justify-center pt-20">
          <div className="max-w-md mx-auto text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow dark:shadow-gray-700 transition-colors duration-300">
            <div className="text-green-600 dark:text-green-400 text-6xl mb-4">
              ✓
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              Thank You!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your response has been submitted successfully.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navigation
        customTitle={form.title}
        rightActions={
          <button
            onClick={() => router.push(`/dashboard/${form.slug}`)}
            className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
          >
            📊 View Analytics
          </button>
        }
      />
      <div className="py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-8 transition-colors duration-300">
          <div className="mb-8">
            {form.description && (
              <p className="text-gray-600 dark:text-gray-300">
                {form.description}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 dark:text-red-400 ml-1">
                      *
                    </span>
                  )}
                </label>

                {field.type === "text" && (
                  <input
                    type="text"
                    value={responses[field.id] || ""}
                    onChange={e => handleFieldChange(field.id, e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300 ${
                      errors[field.id]
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}

                {field.type === "multiple-choice" && (
                  <div className="space-y-2">
                    {field.options?.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={option}
                          checked={responses[field.id] === option}
                          onChange={e =>
                            handleFieldChange(field.id, e.target.value)
                          }
                          className="w-4 h-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === "checkbox" && (
                  <div className="space-y-2">
                    {field.options?.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={option}
                          checked={
                            responses[field.id]?.includes(option) || false
                          }
                          onChange={e => {
                            const current = responses[field.id] || [];
                            const newValue = e.target.checked
                              ? [...current, option]
                              : current.filter(
                                  (item: string) => item !== option
                                );
                            handleFieldChange(field.id, newValue);
                          }}
                          className="w-4 h-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === "rating" && (
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleFieldChange(field.id, rating)}
                        className={`text-2xl ${
                          responses[field.id] >= rating
                            ? "text-yellow-400 dark:text-yellow-300"
                            : "text-gray-300 dark:text-gray-600 hover:text-yellow-200 dark:hover:text-yellow-400"
                        } transition-colors`}
                      >
                        ⭐
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {responses[field.id]
                        ? `${responses[field.id]}/5`
                        : "Click to rate"}
                    </span>
                  </div>
                )}

                {errors[field.id] && (
                  <p className="text-red-500 dark:text-red-400 text-sm">
                    {errors[field.id]}
                  </p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
