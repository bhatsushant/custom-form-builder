"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import { useTheme } from "../context/ThemeContext";
import { useFormContext } from "../context/FormContext";

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

export default function FormBuilder() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isDark } = useTheme();
  const { saveForm: saveFormToAPI, loading, error } = useFormContext();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    fields: [],
    slug: ""
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fieldIdCounter = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fieldTypes = [
    { type: "text", label: "Text Input", icon: "📝" },
    { type: "multiple-choice", label: "Multiple Choice", icon: "🔘" },
    { type: "checkbox", label: "Checkboxes", icon: "☑️" },
    { type: "rating", label: "Rating", icon: "⭐" }
  ];

  const createField = (type: FormField["type"]): FormField => {
    fieldIdCounter.current += 1;
    const baseField = {
      id: `field_${fieldIdCounter.current}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false
    };

    if (type === "multiple-choice" || type === "checkbox") {
      return { ...baseField, options: ["Option 1", "Option 2"] };
    }

    return baseField;
  };

  const addField = (type: FormField["type"]) => {
    const newField = createField(type);
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setEditingField(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const deleteField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newFields = Array.from(formData.fields);
    const [reorderedField] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, reorderedField);

    setFormData(prev => ({ ...prev, fields: newFields }));
    setDraggedIndex(null);
  };

  const saveForm = async () => {
    if (!formData.title || !formData.slug) {
      alert("Please fill in the title and slug");
      return;
    }

    try {
      await saveFormToAPI(formData.slug, formData);
      alert("Form saved successfully!");
      router.push(`/form/${formData.slug}`);
    } catch (err) {
      console.error("Failed to save form:", err);
      alert("Failed to save form. Please try again.");
    }
  };

  const saveDraft = () => {
    const drafts = JSON.parse(localStorage.getItem("drafts") || "{}");
    drafts[formData.slug || "unnamed"] = formData;
    localStorage.setItem("drafts", JSON.stringify(drafts));
    alert("Draft saved!");
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation customTitle="Form Builder" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading form builder...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navigation
        customTitle="Form Builder"
        rightActions={
          <div className="flex gap-4">
            <button
              onClick={saveDraft}
              className="px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={saveForm}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Form"}
            </button>
          </div>
        }
      />
      <div className="max-w-7xl mx-auto p-6">
        {showPreview ? (
          <FormPreview formData={formData} isDark={isDark} />
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Field Types Panel */}
            <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-4 transition-colors duration-300">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Field Types
              </h2>
              <div className="space-y-2">
                {fieldTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addField(type as FormField["type"])}
                    className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-900 dark:text-gray-100 transition-colors"
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Builder */}
            <div className="col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 transition-colors duration-300">
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Form Title"
                  value={formData.title}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                />
                <input
                  type="text"
                  placeholder="Form Slug (URL-friendly name)"
                  value={formData.slug}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-")
                    }))
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                />
                <textarea
                  placeholder="Form Description"
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, index)}
                    className={`p-4 border rounded cursor-move ${
                      editingField === field.id
                        ? "border-blue-500 dark:border-blue-400"
                        : "border-gray-200 dark:border-gray-600"
                    } hover:shadow-md dark:hover:shadow-gray-700 transition-all duration-300 bg-gray-50 dark:bg-gray-700`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="cursor-move text-gray-400 dark:text-gray-400">
                          ⋮⋮
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {field.type.charAt(0).toUpperCase() +
                            field.type.slice(1)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditingField(
                              editingField === field.id ? null : field.id
                            )
                          }
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteField(field.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {editingField === field.id ? (
                      <FieldEditor
                        field={field}
                        onUpdate={updates => updateField(field.id, updates)}
                        onClose={() => setEditingField(null)}
                        isDark={isDark}
                      />
                    ) : (
                      <FieldDisplay field={field} isDark={isDark} />
                    )}
                  </div>
                ))}
              </div>

              {formData.fields.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-300">
                  <p>
                    No fields added yet. Click on a field type to get started!
                  </p>
                </div>
              )}
            </div>

            {/* Properties Panel */}
            <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-4 transition-colors duration-300">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Form Properties
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    Fields: {formData.fields.length}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Required Fields:{" "}
                    {formData.fields.filter(f => f.required).length}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldEditor({
  field,
  onUpdate,
  onClose,
  isDark
}: {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onClose: () => void;
  isDark?: boolean;
}) {
  const [localField, setLocalField] = useState(field);

  const handleSave = () => {
    onUpdate(localField);
    onClose();
  };

  const addOption = () => {
    if (localField.options) {
      setLocalField(prev => ({
        ...prev,
        options: [
          ...(prev.options || []),
          `Option ${(prev.options?.length || 0) + 1}`
        ]
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    if (localField.options) {
      const newOptions = [...localField.options];
      newOptions[index] = value;
      setLocalField(prev => ({ ...prev, options: newOptions }));
    }
  };

  const removeOption = (index: number) => {
    if (localField.options) {
      setLocalField(prev => ({
        ...prev,
        options: prev.options?.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Label
        </label>
        <input
          type="text"
          value={localField.label}
          onChange={e =>
            setLocalField(prev => ({ ...prev, label: e.target.value }))
          }
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={localField.required}
          onChange={e =>
            setLocalField(prev => ({ ...prev, required: e.target.checked }))
          }
          className="text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded"
        />
        <label className="text-sm text-gray-700 dark:text-gray-300">
          Required field
        </label>
      </div>

      {(localField.type === "multiple-choice" ||
        localField.type === "checkbox") && (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Options
          </label>
          <div className="space-y-2">
            {localField.options?.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={e => updateOption(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                />
                <button
                  onClick={() => removeOption(index)}
                  className="px-2 py-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="w-full p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-transparent transition-colors duration-300"
            >
              + Add Option
            </button>
          </div>
        </div>
      )}

      {localField.type === "text" && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Min Length
            </label>
            <input
              type="number"
              value={localField.validation?.minLength || ""}
              onChange={e =>
                setLocalField(prev => ({
                  ...prev,
                  validation: {
                    ...prev.validation,
                    minLength: parseInt(e.target.value) || undefined
                  }
                }))
              }
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Max Length
            </label>
            <input
              type="number"
              value={localField.validation?.maxLength || ""}
              onChange={e =>
                setLocalField(prev => ({
                  ...prev,
                  validation: {
                    ...prev.validation,
                    maxLength: parseInt(e.target.value) || undefined
                  }
                }))
              }
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function FieldDisplay({
  field,
  isDark
}: {
  field: FormField;
  isDark?: boolean;
}) {
  return (
    <div>
      <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">
        {field.label}{" "}
        {field.required && (
          <span className="text-red-500 dark:text-red-400">*</span>
        )}
      </label>
      {field.type === "text" && (
        <input
          type="text"
          disabled
          placeholder="Text input preview"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      )}
      {field.type === "multiple-choice" && (
        <div className="space-y-2">
          {field.options?.map((option, index) => (
            <label key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name={field.id}
                disabled
                className="text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
              <span className="text-gray-700 dark:text-gray-300">{option}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === "checkbox" && (
        <div className="space-y-2">
          {field.options?.map((option, index) => (
            <label key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled
                className="text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
              <span className="text-gray-700 dark:text-gray-300">{option}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === "rating" && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className="text-gray-300 dark:text-gray-600 text-xl"
            >
              ⭐
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FormPreview({
  formData,
  isDark
}: {
  formData: FormData;
  isDark?: boolean;
}) {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-8 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
        {formData.title || "Untitled Form"}
      </h1>
      {formData.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {formData.description}
        </p>
      )}

      <div className="space-y-6">
        {formData.fields.map(field => (
          <FieldDisplay key={field.id} field={field} isDark={isDark} />
        ))}
      </div>

      {formData.fields.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No fields added yet
        </p>
      )}

      <button
        disabled
        className="w-full mt-8 p-3 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors duration-300"
      >
        Submit (Preview Mode)
      </button>
    </div>
  );
}
