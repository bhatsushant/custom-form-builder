"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";
import { api } from "../utils/api";

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

interface FormContextType {
  forms: { [slug: string]: FormData };
  saveForms: (forms: { [slug: string]: FormData }) => void;
  saveForm: (slug: string, form: FormData) => Promise<void>;
  getForm: (slug: string) => FormData | null;
  deleteForms: (slug: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [forms, setForms] = useState<{ [slug: string]: FormData }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFormsFromAPI();
  }, []);

  const loadFormsFromAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/forms/");

      // Convert API response to our format
      const formsMap: { [slug: string]: FormData } = {};
      response.forEach((form: any) => {
        const slug = form.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        formsMap[slug] = {
          ...form,
          slug
        };
      });

      setForms(formsMap);

      // Fallback to localStorage if API fails or returns empty
      if (response.length === 0) {
        const storedForms = JSON.parse(localStorage.getItem("forms") || "{}");
        if (Object.keys(storedForms).length > 0) {
          setForms(storedForms);
        } else {
          initializeSampleForms();
        }
      }
    } catch (err) {
      console.error("Failed to load forms from API:", err);
      setError("Failed to load forms from server");

      // Fallback to localStorage
      const storedForms = JSON.parse(localStorage.getItem("forms") || "{}");
      if (Object.keys(storedForms).length > 0) {
        setForms(storedForms);
      } else {
        initializeSampleForms();
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeSampleForms = () => {
    const sampleForms = {
      "customer-feedback": {
        title: "Customer Feedback Survey",
        description: "Help us improve our service by sharing your experience",
        slug: "customer-feedback",
        fields: [
          {
            id: "overall_rating",
            type: "rating" as const,
            label: "Overall Satisfaction",
            required: true
          },
          {
            id: "service_quality",
            type: "multiple-choice" as const,
            label: "How would you rate our service quality?",
            options: ["Excellent", "Good", "Average", "Poor"],
            required: true
          },
          {
            id: "features_used",
            type: "checkbox" as const,
            label: "Which features did you use?",
            options: [
              "Customer Support",
              "Online Portal",
              "Mobile App",
              "Email Notifications"
            ],
            required: false
          },
          {
            id: "comments",
            type: "text" as const,
            label: "Additional Comments",
            validation: { minLength: 10, maxLength: 500 },
            required: false
          }
        ]
      },
      "event-registration": {
        title: "Event Registration Form",
        description: "Register for our upcoming tech conference",
        slug: "event-registration",
        fields: [
          {
            id: "full_name",
            type: "text" as const,
            label: "Full Name",
            validation: { minLength: 2, maxLength: 100 },
            required: true
          },
          {
            id: "experience_level",
            type: "multiple-choice" as const,
            label: "Experience Level",
            options: ["Beginner", "Intermediate", "Advanced", "Expert"],
            required: true
          },
          {
            id: "interests",
            type: "checkbox" as const,
            label: "Areas of Interest",
            options: [
              "AI/ML",
              "Web Development",
              "Mobile Development",
              "DevOps",
              "Data Science"
            ],
            required: true
          },
          {
            id: "session_rating",
            type: "rating" as const,
            label: "Expected Value (1-5 stars)",
            required: false
          }
        ]
      }
    };

    setForms(sampleForms);
    localStorage.setItem("forms", JSON.stringify(sampleForms));
  };

  const saveForms = (newForms: { [slug: string]: FormData }) => {
    setForms(newForms);
    localStorage.setItem("forms", JSON.stringify(newForms));
  };

  const saveForm = async (slug: string, form: FormData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Prepare data for API
      const formData = {
        title: form.title,
        description: form.description,
        fields: form.fields
      };

      let savedForm;
      if (form.id) {
        // Update existing form
        savedForm = await api.put(`/forms/${form.id}/`, formData);
      } else {
        // Create new form
        savedForm = await api.post("/forms/", formData);
      }

      // Update local state
      const updatedForm = {
        ...savedForm,
        slug
      };

      const updatedForms = { ...forms, [slug]: updatedForm };
      setForms(updatedForms);

      // Also save to localStorage as backup
      localStorage.setItem("forms", JSON.stringify(updatedForms));
    } catch (err) {
      console.error("Failed to save form:", err);
      setError("Failed to save form to server");

      // Fallback to localStorage only
      const updatedForms = { ...forms, [slug]: form };
      setForms(updatedForms);
      localStorage.setItem("forms", JSON.stringify(updatedForms));
    } finally {
      setLoading(false);
    }
  };

  const getForm = (slug: string): FormData | null => {
    return forms[slug] || null;
  };

  const deleteForms = async (slug: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const form = forms[slug];
      if (form?.id) {
        await api.delete(`/forms/${form.id}/`);
      }

      // Update local state
      const updatedForms = { ...forms };
      delete updatedForms[slug];
      setForms(updatedForms);
      localStorage.setItem("forms", JSON.stringify(updatedForms));
    } catch (err) {
      console.error("Failed to delete form:", err);
      setError("Failed to delete form from server");

      // Fallback to localStorage only
      const updatedForms = { ...forms };
      delete updatedForms[slug];
      setForms(updatedForms);
      localStorage.setItem("forms", JSON.stringify(updatedForms));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContext.Provider
      value={{
        forms,
        saveForms,
        saveForm,
        getForm,
        deleteForms,
        loading,
        error
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
