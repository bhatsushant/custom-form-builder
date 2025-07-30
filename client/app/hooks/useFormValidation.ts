// hooks/useFormValidation.ts
import { useState, useCallback } from "react";
import { FormField } from "../components/FormBuilder/FormBuilder";

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const useFormValidation = (fields: FormField[]) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback(
    (field: FormField, value: any): string | null => {
      if (
        field.required &&
        (!value || (Array.isArray(value) && value.length === 0))
      ) {
        return "This field is required";
      }

      if (field.type === "text" && field.validation && value) {
        const { minLength, maxLength, pattern } = field.validation;

        if (minLength && value.length < minLength) {
          return `Minimum length is ${minLength} characters`;
        }

        if (maxLength && value.length > maxLength) {
          return `Maximum length is ${maxLength} characters`;
        }

        if (pattern && !new RegExp(pattern).test(value)) {
          return "Invalid format";
        }
      }

      return null;
    },
    []
  );

  const validateForm = useCallback(
    (responses: Record<string, any>): ValidationResult => {
      const newErrors: Record<string, string> = {};

      fields.forEach(field => {
        const error = validateField(field, responses[field.id]);
        if (error) {
          newErrors[field.id] = error;
        }
      });

      setErrors(newErrors);
      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors
      };
    },
    [fields, validateField]
  );

  const clearFieldError = useCallback((fieldId: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearFieldError
  };
};
