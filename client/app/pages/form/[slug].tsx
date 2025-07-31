// pages/form/[slug].tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FormRenderer from "@/app/components/FormRenderer/FormRenderer";

export default function FeedbackFormPage() {
  const { slug } = useParams();
  const [form, setForm] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (slug) {
      fetch(`http://localhost:8000/api/forms/${slug}/`)
        .then(res => res.json())
        .then(setForm)
        .catch(console.error);
    }
  }, [slug]);

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const res = await fetch("http://localhost:8000/api/responses/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          form: form.id,
          responses: data
        })
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit response.");
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  if (!form) return <div className="p-6 text-gray-600">Loading...</div>;
  if (submitted)
    return (
      <div className="p-6 text-green-600">Thank you for your response!</div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
      <p className="mb-6 text-gray-600">{form.description}</p>
      <FormRenderer fields={form.fields} onSubmit={handleSubmit} />
    </div>
  );
}
