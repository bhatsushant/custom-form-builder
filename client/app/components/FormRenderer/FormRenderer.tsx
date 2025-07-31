// components/FormRenderer/FormRenderer.tsx
"use client";

import { useState } from "react";

type Field = {
  id: string;
  type: "text" | "multiple-choice" | "checkbox" | "rating";
  label: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
};

interface Props {
  fields: Field[];
  onSubmit: (data: Record<string, any>) => void;
}

export default function FormRenderer({ fields, onSubmit }: Props) {
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (id: string, value: any) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const toggleCheckbox = (id: string, value: string) => {
    const prev = formState[id] || [];
    const updated = prev.includes(value)
      ? prev.filter((v: string) => v !== value)
      : [...prev, value];
    updateField(id, updated);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formState[field.id];
      if (field.required) {
        if (
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          newErrors[field.id] = "This field is required.";
        }
      }

      if (field.type === "text" && typeof value === "string") {
        const { minLength, maxLength, pattern } = field.validation || {};
        if (minLength && value.length < minLength)
          newErrors[field.id] = `Minimum length is ${minLength}`;
        if (maxLength && value.length > maxLength)
          newErrors[field.id] = `Maximum length is ${maxLength}`;
        if (pattern && !new RegExp(pattern).test(value))
          newErrors[field.id] = "Invalid format";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map(field => (
        <div key={field.id}>
          <label className="font-medium block mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.type === "text" && (
            <input
              className="w-full border p-2 rounded"
              value={formState[field.id] || ""}
              onChange={e => updateField(field.id, e.target.value)}
            />
          )}

          {field.type === "multiple-choice" &&
            field.options?.map(opt => (
              <label key={opt} className="block">
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={formState[field.id] === opt}
                  onChange={() => updateField(field.id, opt)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}

          {field.type === "checkbox" &&
            field.options?.map(opt => (
              <label key={opt} className="block">
                <input
                  type="checkbox"
                  checked={(formState[field.id] || []).includes(opt)}
                  onChange={() => toggleCheckbox(field.id, opt)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}

          {field.type === "rating" && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  type="button"
                  key={n}
                  className={`w-8 h-8 rounded-full ${
                    formState[field.id] === n ? "bg-yellow-400" : "bg-gray-300"
                  }`}
                  onClick={() => updateField(field.id, n)}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          {errors[field.id] && (
            <p className="text-sm text-red-600 mt-1">{errors[field.id]}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
}
