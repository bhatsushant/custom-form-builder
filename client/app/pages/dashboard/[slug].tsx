// pages/dashboard/[slug].tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Bar, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";

export default function DashboardPage() {
  const { slug } = useParams();
  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!slug) return;

    // Fetch form
    fetch(`http://localhost:8000/api/forms/${slug}/`)
      .then(res => res.json())
      .then(setForm);

    // Fetch past responses
    fetch(`http://localhost:8000/api/responses/?form_slug=${slug}`)
      .then(res => res.json())
      .then(setResponses);

    // Setup WebSocket for live updates
    const ws = new WebSocket(`ws://localhost:8000/ws/form/${slug}/`);
    wsRef.current = ws;
    ws.onmessage = e => {
      const data = JSON.parse(e.data);
      setResponses(prev => [...prev, data.responses]);
    };

    return () => ws.close();
  }, [slug]);

  if (!form) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">{form.title} - Analytics</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {form.fields.map((field: any) => (
          <FieldAnalytics key={field.id} field={field} responses={responses} />
        ))}
      </div>
    </div>
  );
}

function FieldAnalytics({
  field,
  responses
}: {
  field: any;
  responses: any[];
}) {
  const data = responses.map(r => r[field.id]);

  if (!data.length) return null;

  if (field.type === "text") {
    return (
      <div className="p-4 border rounded shadow">
        <h2 className="font-semibold mb-2">{field.label}</h2>
        <ul className="text-sm list-disc list-inside">
          {data.slice(-5).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (field.type === "rating") {
    const avg = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);
    return (
      <div className="p-4 border rounded shadow">
        <h2 className="font-semibold mb-2">{field.label}</h2>
        <p className="text-lg">Average Rating: ⭐ {avg} / 5</p>
      </div>
    );
  }

  if (field.type === "checkbox") {
    const all = data.flat();
    const counts = field.options.reduce((acc: any, opt: string) => {
      acc[opt] = all.filter((val: string) => val === opt).length;
      return acc;
    }, {});
    return (
      <div className="p-4 border rounded shadow">
        <h2 className="font-semibold mb-2">{field.label}</h2>
        <Pie
          data={{
            labels: Object.keys(counts),
            datasets: [
              {
                data: Object.values(counts),
                backgroundColor: [
                  "#60a5fa",
                  "#34d399",
                  "#fbbf24",
                  "#f87171",
                  "#a78bfa"
                ]
              }
            ]
          }}
        />
      </div>
    );
  }

  if (field.type === "multiple-choice") {
    const counts = field.options.reduce((acc: any, opt: string) => {
      acc[opt] = data.filter((val: string) => val === opt).length;
      return acc;
    }, {});
    return (
      <div className="p-4 border rounded shadow">
        <h2 className="font-semibold mb-2">{field.label}</h2>
        <Bar
          data={{
            labels: Object.keys(counts),
            datasets: [
              {
                label: "Responses",
                data: Object.values(counts),
                backgroundColor: "#3b82f6"
              }
            ]
          }}
        />
      </div>
    );
  }

  return null;
}
