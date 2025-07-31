"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";

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
  title: string;
  description: string;
  fields: FormField[];
  slug: string;
}

interface FormContextType {
  forms: { [slug: string]: FormData };
  saveForms: (forms: { [slug: string]: FormData }) => void;
  saveForm: (slug: string, form: FormData) => void;
  getForm: (slug: string) => FormData | null;
  deleteForms: (slug: string) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [forms, setForms] = useState<{ [slug: string]: FormData }>({});

  useEffect(() => {
    // Load forms from localStorage on mount
    const storedForms = JSON.parse(localStorage.getItem("forms") || "{}");
    setForms(storedForms);

    // Initialize with sample forms if empty
    if (Object.keys(storedForms).length === 0) {
      initializeSampleForms();
    }
  }, []);

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

  const saveForm = (slug: string, form: FormData) => {
    const updatedForms = { ...forms, [slug]: form };
    setForms(updatedForms);
    localStorage.setItem("forms", JSON.stringify(updatedForms));
  };

  const getForm = (slug: string): FormData | null => {
    return forms[slug] || null;
  };

  const deleteForms = (slug: string) => {
    const updatedForms = { ...forms };
    delete updatedForms[slug];
    setForms(updatedForms);
    localStorage.setItem("forms", JSON.stringify(updatedForms));
  };

  return (
    <FormContext.Provider
      value={{
        forms,
        saveForms,
        saveForm,
        getForm,
        deleteForms
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
