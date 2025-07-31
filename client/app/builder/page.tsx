"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";

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

export default function FormBuilder() {
  const router = useRouter();
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

  const saveForm = () => {
    if (!formData.title || !formData.slug) {
      alert("Please fill in the title and slug");
      return;
    }

    // Save to localStorage for now (in real app, save to backend)
    const forms = JSON.parse(localStorage.getItem("forms") || "{}");
    forms[formData.slug] = formData;
    localStorage.setItem("forms", JSON.stringify(forms));

    alert("Form saved successfully!");
    router.push(`/form/${formData.slug}`);
  };

  const saveDraft = () => {
    const drafts = JSON.parse(localStorage.getItem("drafts") || "{}");
    drafts[formData.slug || "unnamed"] = formData;
    localStorage.setItem("drafts", JSON.stringify(drafts));
    alert("Draft saved!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        customTitle="Form Builder"
        rightActions={
          <div className="flex gap-4">
            <button
              onClick={saveDraft}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Save Draft
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={saveForm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Form
            </button>
          </div>
        }
      />
      <div className="max-w-7xl mx-auto p-6">
        {showPreview ? (
          <FormPreview formData={formData} />
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Field Types Panel */}
            <div className="col-span-3 bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Field Types</h2>
              <div className="space-y-2">
                {fieldTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addField(type as FormField["type"])}
                    className="w-full p-3 text-left border rounded hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Builder */}
            <div className="col-span-6 bg-white rounded-lg shadow p-6">
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Form Title"
                  value={formData.title}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full text-2xl font-bold border-none outline-none"
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
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
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
                        ? "border-blue-500"
                        : "border-gray-200"
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="cursor-move text-gray-400">⋮⋮</div>
                        <span className="text-sm text-gray-500">
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
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteField(field.id)}
                          className="text-red-600 hover:text-red-800"
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
                      />
                    ) : (
                      <FieldDisplay field={field} />
                    )}
                  </div>
                ))}
              </div>

              {formData.fields.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>
                    No fields added yet. Click on a field type to get started!
                  </p>
                </div>
              )}
            </div>

            {/* Properties Panel */}
            <div className="col-span-3 bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Form Properties</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fields: {formData.fields.length}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
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
  onClose
}: {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onClose: () => void;
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
        <label className="block text-sm font-medium mb-1">Label</label>
        <input
          type="text"
          value={localField.label}
          onChange={e =>
            setLocalField(prev => ({ ...prev, label: e.target.value }))
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={localField.required}
          onChange={e =>
            setLocalField(prev => ({ ...prev, required: e.target.checked }))
          }
        />
        <label className="text-sm">Required field</label>
      </div>

      {(localField.type === "multiple-choice" ||
        localField.type === "checkbox") && (
        <div>
          <label className="block text-sm font-medium mb-2">Options</label>
          <div className="space-y-2">
            {localField.options?.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={e => updateOption(index, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={() => removeOption(index)}
                  className="px-2 py-1 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="w-full p-2 border border-dashed rounded text-gray-500 hover:text-gray-700"
            >
              + Add Option
            </button>
          </div>
        </div>
      )}

      {localField.type === "text" && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Min Length</label>
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
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Length</label>
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
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function FieldDisplay({ field }: { field: FormField }) {
  return (
    <div>
      <label className="block font-medium mb-2">
        {field.label}{" "}
        {field.required && <span className="text-red-500">*</span>}
      </label>
      {field.type === "text" && (
        <input
          type="text"
          disabled
          placeholder="Text input preview"
          className="w-full p-2 border rounded bg-gray-50"
        />
      )}
      {field.type === "multiple-choice" && (
        <div className="space-y-2">
          {field.options?.map((option, index) => (
            <label key={index} className="flex items-center gap-2">
              <input type="radio" name={field.id} disabled />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === "checkbox" && (
        <div className="space-y-2">
          {field.options?.map((option, index) => (
            <label key={index} className="flex items-center gap-2">
              <input type="checkbox" disabled />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === "rating" && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <span key={star} className="text-gray-300 text-xl">
              ⭐
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FormPreview({ formData }: { formData: FormData }) {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
      <h1 className="text-3xl font-bold mb-2">
        {formData.title || "Untitled Form"}
      </h1>
      {formData.description && (
        <p className="text-gray-600 mb-6">{formData.description}</p>
      )}

      <div className="space-y-6">
        {formData.fields.map(field => (
          <FieldDisplay key={field.id} field={field} />
        ))}
      </div>

      {formData.fields.length === 0 && (
        <p className="text-gray-500 text-center py-8">No fields added yet</p>
      )}

      <button
        disabled
        className="w-full mt-8 p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Submit (Preview Mode)
      </button>
    </div>
  );
}
