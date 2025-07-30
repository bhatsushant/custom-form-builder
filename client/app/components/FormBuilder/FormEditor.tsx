// components/FormBuilder/FieldEditor.tsx
import React from "react";
import { FormField } from "./FormBuilder";
import { Plus, Trash2 } from "lucide-react";

interface FieldEditorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

export default function FieldEditor({ field, onUpdate }: FieldEditorProps) {
  const addOption = () => {
    const newOptions = [
      ...(field.options || []),
      `Option ${(field.options?.length || 0) + 1}`
    ];
    onUpdate({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || [];
    onUpdate({ options: newOptions });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Field Properties</h3>

      <div className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium mb-2">Label</label>
          <input
            type="text"
            value={field.label}
            onChange={e => onUpdate({ label: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          />
        </div>

        {/* Required */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            checked={field.required}
            onChange={e => onUpdate({ required: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="required" className="text-sm font-medium">
            Required field
          </label>
        </div>

        {/* Options for multiple choice and checkbox */}
        {(field.type === "multiple-choice" || field.type === "checkbox") && (
          <div>
            <label className="block text-sm font-medium mb-2">Options</label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={e => updateOption(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <Plus size={16} />
                <span>Add Option</span>
              </button>
            </div>
          </div>
        )}

        {/* Validation for text fields */}
        {field.type === "text" && (
          <div className="space-y-3">
            <h4 className="font-medium">Validation</h4>
            <div>
              <label className="block text-sm font-medium mb-1">
                Min Length
              </label>
              <input
                type="number"
                value={field.validation?.minLength || ""}
                onChange={e =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      minLength: e.target.value
                        ? parseInt(e.target.value)
                        : undefined
                    }
                  })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Length
              </label>
              <input
                type="number"
                value={field.validation?.maxLength || ""}
                onChange={e =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      maxLength: e.target.value
                        ? parseInt(e.target.value)
                        : undefined
                    }
                  })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
