// components/FormBuilder/FormBuilder.tsx
import React, { useState, useCallback } from "react";
import { Plus, Save, Eye, Trash2, GripVertical } from "lucide-react";
import FieldEditor from "./FieldEditor";
import PreviewModal from "./PreviewModal";

export interface FormField {
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
}

export interface FormData {
  id?: string;
  title: string;
  description: string;
  fields: FormField[];
}

export default function FormBuilder() {
  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    fields: []
  });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addField = useCallback((type: FormField["type"]) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      ...(type === "multiple-choice" || type === "checkbox"
        ? { options: ["Option 1", "Option 2"] }
        : {})
    };

    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setSelectedFieldId(newField.id);
  }, []);

  const updateField = useCallback(
    (fieldId: string, updates: Partial<FormField>) => {
      setForm(prev => ({
        ...prev,
        fields: prev.fields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      }));
    },
    []
  );

  const deleteField = useCallback(
    (fieldId: string) => {
      setForm(prev => ({
        ...prev,
        fields: prev.fields.filter(field => field.id !== fieldId)
      }));
      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null);
      }
    },
    [selectedFieldId]
  );

  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setForm(prev => {
      const newFields = [...prev.fields];
      const [movedField] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, movedField);
      return { ...prev, fields: newFields };
    });
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveField(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const saveForm = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/forms/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        const savedForm = await response.json();
        setForm(savedForm);
        alert("Form saved successfully!");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Error saving form");
    }
  };

  const selectedField = form.fields.find(field => field.id === selectedFieldId);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Form Title"
                value={form.title}
                onChange={e =>
                  setForm(prev => ({ ...prev, title: e.target.value }))
                }
                className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400"
              />
              <textarea
                placeholder="Form Description"
                value={form.description}
                onChange={e =>
                  setForm(prev => ({ ...prev, description: e.target.value }))
                }
                className="w-full bg-transparent border-none outline-none placeholder-gray-400 resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {form.fields.map((field, index) => (
              <div
                key={field.id}
                draggable
                onDragStart={e => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, index)}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-move transition-all ${
                  selectedFieldId === field.id ? "ring-2 ring-blue-500" : ""
                } ${draggedIndex === index ? "opacity-50" : ""}`}
                onClick={() => setSelectedFieldId(field.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GripVertical size={16} className="text-gray-400" />
                    <div>
                      <h3 className="font-medium">{field.label}</h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {field.type.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteField(field.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Field Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Add Field</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: "text" as const, label: "Text Input" },
                { type: "multiple-choice" as const, label: "Multiple Choice" },
                { type: "checkbox" as const, label: "Checkbox" },
                { type: "rating" as const, label: "Rating" }
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className="flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Plus size={16} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={saveForm}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              <span>Save Form</span>
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Eye size={16} />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Field Editor Sidebar */}
        <div className="space-y-6">
          {selectedField ? (
            <FieldEditor
              field={selectedField}
              onUpdate={updates => updateField(selectedField.id, updates)}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-gray-500 text-center">
                Select a field to edit its properties
              </p>
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <PreviewModal form={form} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
