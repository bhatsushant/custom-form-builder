// components/FormBuilder/FormBuilder.tsx
"use client";

import React, { useState, useCallback } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

type FieldType = "text" | "multiple-choice" | "checkbox" | "rating";

interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
  };
}

interface FormData {
  title: string;
  description: string;
  fields: Field[];
}

export default function FormBuilder() {
  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    fields: []
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addField = useCallback((type: FieldType) => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type}`,
      required: false,
      ...(type === "multiple-choice" || type === "checkbox"
        ? { options: ["Option 1", "Option 2"] }
        : {})
    };
    setForm(prev => ({ ...prev, fields: [...prev.fields, newField] }));
  }, []);

  const updateField = (index: number, updates: Partial<Field>) => {
    const updatedFields = [...form.fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setForm(prev => ({ ...prev, fields: updatedFields }));
  };

  const deleteField = (index: number) => {
    const updatedFields = form.fields.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, fields: updatedFields }));
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const updatedFields = [...form.fields];
    const [moved] = updatedFields.splice(draggedIndex, 1);
    updatedFields.splice(dropIndex, 0, moved);
    setForm(prev => ({ ...prev, fields: updatedFields }));
    setDraggedIndex(null);
  };

  const saveDraft = () => {
    localStorage.setItem("form-draft", JSON.stringify(form));
    alert("Draft saved!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <input
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Form Title"
          className="text-2xl font-bold w-full p-2 border rounded"
        />
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Form Description"
          className="w-full p-2 border rounded"
        />
      </div>

      {form.fields.map((field, index) => (
        <div
          key={field.id}
          className="p-4 border rounded shadow bg-white"
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(index)}
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <GripVertical className="text-gray-400" />
              <input
                type="text"
                value={field.label}
                onChange={e => updateField(index, { label: e.target.value })}
                className="font-medium border-b outline-none"
              />
              <span className="text-sm text-gray-500">({field.type})</span>
            </div>
            <button onClick={() => deleteField(index)} className="text-red-500">
              <Trash2 size={16} />
            </button>
          </div>

          {["multiple-choice", "checkbox"].includes(field.type) &&
            field.options?.map((option, i) => (
              <input
                key={i}
                type="text"
                value={option}
                onChange={e => {
                  const opts = [...(field.options || [])];
                  opts[i] = e.target.value;
                  updateField(index, { options: opts });
                }}
                className="mt-2 ml-6 block w-full p-1 border rounded"
              />
            ))}

          {field.type === "text" && (
            <div className="mt-2 ml-6 space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={field.validation?.minLength || ""}
                onChange={e =>
                  updateField(index, {
                    validation: {
                      ...field.validation,
                      minLength: parseInt(e.target.value) || undefined
                    }
                  })
                }
                className="w-20 p-1 border rounded"
              />
              <input
                type="number"
                placeholder="Max"
                value={field.validation?.maxLength || ""}
                onChange={e =>
                  updateField(index, {
                    validation: {
                      ...field.validation,
                      maxLength: parseInt(e.target.value) || undefined
                    }
                  })
                }
                className="w-20 p-1 border rounded"
              />
            </div>
          )}

          <label className="ml-6 mt-2 block text-sm">
            <input
              type="checkbox"
              checked={field.required}
              onChange={e => updateField(index, { required: e.target.checked })}
              className="mr-2"
            />
            Required
          </label>
        </div>
      ))}

      <div className="flex gap-3 flex-wrap">
        {(["text", "multiple-choice", "checkbox", "rating"] as FieldType[]).map(
          type => (
            <button
              key={type}
              onClick={() => addField(type)}
              className="border p-2 rounded bg-blue-50 hover:bg-blue-100 text-sm"
            >
              Add {type}
            </button>
          )
        )}
      </div>

      <button
        onClick={saveDraft}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Draft
      </button>
    </div>
  );
}
