import { useState, useCallback } from "react";

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

interface FormResponse {
  [fieldId: string]: any;
}

interface FormErrors {
  [fieldId: string]: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function useFormValidation(fields: FormField[]) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback(
    (field: FormField, value: any): string | null => {
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
    },
    []
  );

  const validateForm = useCallback(
    (responses: Record<string, any>): ValidationResult => {
      const newErrors: FormErrors = {};
      let isValid = true;

      fields.forEach(field => {
        const error = validateField(field, responses[field.id]);
        if (error) {
          newErrors[field.id] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return {
        isValid,
        errors: newErrors
      };
    },
    [fields, validateField]
  );

  const updateField = useCallback(
    (fieldId: string, value: any) => {
      setTouched(prev => ({ ...prev, [fieldId]: true }));

      // Clear error when user starts typing
      if (errors[fieldId]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldId];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const clearFieldError = useCallback((fieldId: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  }, []);

  const resetForm = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    updateField,
    clearFieldError,
    resetForm,
    isFieldValid: (fieldId: string) => !errors[fieldId] && touched[fieldId],
    getFieldError: (fieldId: string) => errors[fieldId],
    hasErrors: Object.keys(errors).length > 0
  };
}
