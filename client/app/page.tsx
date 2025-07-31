// app/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [formSlug, setFormSlug] = useState("");

  return (
    <main className="max-w-xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Custom Form Builder</h1>

      <div className="space-y-4">
        <Link
          href="/builder"
          className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Create New Form
        </Link>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter form slug"
            value={formSlug}
            onChange={e => setFormSlug(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-4">
            <Link
              href={`/form/${formSlug}`}
              className="text-blue-600 hover:underline"
            >
              📝 Fill Form
            </Link>
            <Link
              href={`/dashboard/${formSlug}`}
              className="text-blue-600 hover:underline"
            >
              📊 View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
