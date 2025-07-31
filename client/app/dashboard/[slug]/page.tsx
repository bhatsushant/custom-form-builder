"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bar, Pie, Line } from "react-chartjs-2";
import Navigation from "../../components/Navigation";
import { useTheme } from "../../context/ThemeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface FormField {
  id: string;
  type: "text" | "multiple-choice" | "checkbox" | "rating";
  label: string;
  options?: string[];
  required?: boolean;
}

interface FormData {
  title: string;
  description: string;
  fields: FormField[];
  slug: string;
}

interface Response {
  id: number;
  timestamp: string;
  data: { [fieldId: string]: any };
}

export default function DashboardPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isDark } = useTheme();
  const [form, setForm] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock real-time updates
  useEffect(() => {
    if (!slug) return;

    // Load form and responses
    const loadData = () => {
      const forms = JSON.parse(localStorage.getItem("forms") || "{}");
      const formData = forms[slug as string];

      if (formData) {
        setForm(formData);

        const allResponses = JSON.parse(
          localStorage.getItem("responses") || "{}"
        );
        const formResponses = allResponses[slug as string] || [];

        // Add some mock data if no responses exist
        if (formResponses.length === 0) {
          const mockResponses = generateMockResponses(formData);
          setResponses(mockResponses);
        } else {
          setResponses(formResponses);
        }
      }
      setIsLoading(false);
    };

    loadData();

    // Simulate real-time updates every 5 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance of new response
        const forms = JSON.parse(localStorage.getItem("forms") || "{}");
        const formData = forms[slug as string];
        if (formData) {
          const newResponse = generateRandomResponse(formData);
          setResponses(prev => [...prev, newResponse]);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [slug]);

  const generateMockResponses = (formData: FormData): Response[] => {
    const mockResponses: Response[] = [];
    const responseCount = Math.floor(Math.random() * 20) + 10; // 10-30 responses

    for (let i = 0; i < responseCount; i++) {
      mockResponses.push(generateRandomResponse(formData, i));
    }

    return mockResponses;
  };

  const generateRandomResponse = (
    formData: FormData,
    index?: number
  ): Response => {
    const responseData: { [fieldId: string]: any } = {};

    formData.fields.forEach(field => {
      switch (field.type) {
        case "text":
          const textResponses = [
            "Great service!",
            "Could be better",
            "Excellent experience",
            "Good overall",
            "Amazing quality",
            "Fast delivery",
            "Professional team",
            "Highly recommended",
            "Outstanding support"
          ];
          responseData[field.id] =
            textResponses[Math.floor(Math.random() * textResponses.length)];
          break;
        case "multiple-choice":
          if (field.options && field.options.length > 0) {
            responseData[field.id] =
              field.options[Math.floor(Math.random() * field.options.length)];
          }
          break;
        case "checkbox":
          if (field.options) {
            const selectedCount =
              Math.floor(Math.random() * field.options.length) + 1;
            const shuffled = [...field.options].sort(() => 0.5 - Math.random());
            responseData[field.id] = shuffled.slice(0, selectedCount);
          }
          break;
        case "rating":
          responseData[field.id] = Math.floor(Math.random() * 5) + 1;
          break;
      }
    });

    return {
      id: Date.now() + (index || 0),
      timestamp: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      data: responseData
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation customTitle="Loading Dashboard..." />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation customTitle="Dashboard Not Found" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">Form not found</p>
            <p className="text-gray-500 mb-6">
              Cannot load analytics for this form.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navigation
        customTitle={`${form.title} - Analytics`}
        rightActions={
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/form/${form.slug}`)}
              className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              📝 Fill Form
            </button>
            <button
              onClick={() => router.push("/builder")}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              ➕ Create New Form
            </button>
          </div>
        }
      />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-300">
            Real-time form analytics and insights
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Responses
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {responses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Avg. Rating
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {getAverageRating(form, responses)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <span className="text-2xl">🕒</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Latest Response
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {responses.length > 0
                    ? new Date(
                        responses[responses.length - 1].timestamp
                      ).toLocaleDateString()
                    : "No responses"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Form Fields
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {form.fields.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Response Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 mb-8 transition-colors duration-300">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Response Trends
          </h2>
          <div className="h-64">
            <Line
              data={getResponseTrendsData(responses, isDark)}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: isDark ? "#e5e7eb" : "#374151"
                    }
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      color: isDark ? "#9ca3af" : "#6b7280"
                    },
                    grid: {
                      color: isDark ? "#374151" : "#e5e7eb"
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      color: isDark ? "#9ca3af" : "#6b7280"
                    },
                    grid: {
                      color: isDark ? "#374151" : "#e5e7eb"
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Field Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {form.fields.map(field => (
            <FieldChart
              key={field.id}
              field={field}
              responses={responses}
              isDark={isDark}
            />
          ))}
        </div>

        {/* Recent Responses */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 transition-colors duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Recent Responses
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {responses
                .slice(-10)
                .reverse()
                .map(response => (
                  <div
                    key={response.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 transition-colors duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Response #{response.id}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(response.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {form.fields.map(field => (
                        <div key={field.id}>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {field.label}:{" "}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {Array.isArray(response.data[field.id])
                              ? response.data[field.id].join(", ")
                              : response.data[field.id] || "No response"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldChart({
  field,
  responses,
  isDark
}: {
  field: FormField;
  responses: Response[];
  isDark?: boolean;
}) {
  const fieldData = responses.map(r => r.data[field.id]).filter(Boolean);

  if (field.type === "text") {
    const recentResponses = fieldData.slice(-5);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {field.label}
        </h3>
        <div className="space-y-2">
          {recentResponses.map((text, i) => (
            <div
              key={i}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-800 dark:text-gray-200"
            >
              "{text}"
            </div>
          ))}
          {recentResponses.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No responses yet
            </p>
          )}
        </div>
      </div>
    );
  }

  if (field.type === "rating") {
    const avg =
      fieldData.length > 0
        ? (
            fieldData.reduce((a: number, b: number) => a + b, 0) /
            fieldData.length
          ).toFixed(1)
        : "0";

    const ratingCounts = [1, 2, 3, 4, 5].map(
      rating => fieldData.filter((r: number) => r === rating).length
    );

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {field.label}
        </h3>
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-yellow-500">⭐ {avg}</div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {fieldData.length} ratings
          </p>
        </div>
        <div className="h-48">
          <Bar
            data={{
              labels: ["1★", "2★", "3★", "4★", "5★"],
              datasets: [
                {
                  label: "Count",
                  data: ratingCounts,
                  backgroundColor: [
                    "#ef4444",
                    "#f97316",
                    "#eab308",
                    "#22c55e",
                    "#16a34a"
                  ]
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: isDark ? "#e5e7eb" : "#374151"
                  }
                }
              },
              scales: {
                x: {
                  ticks: {
                    color: isDark ? "#9ca3af" : "#6b7280"
                  },
                  grid: {
                    color: isDark ? "#374151" : "#e5e7eb"
                  }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    color: isDark ? "#9ca3af" : "#6b7280"
                  },
                  grid: {
                    color: isDark ? "#374151" : "#e5e7eb"
                  }
                }
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    const allSelections = fieldData.flat();
    const counts =
      field.options?.reduce((acc: any, opt: string) => {
        acc[opt] = allSelections.filter((v: string) => v === opt).length;
        return acc;
      }, {}) || {};

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {field.label}
        </h3>
        <div className="h-48">
          <Pie
            data={{
              labels: Object.keys(counts),
              datasets: [
                {
                  data: Object.values(counts),
                  backgroundColor: [
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#06b6d4",
                    "#84cc16",
                    "#f97316"
                  ]
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: isDark ? "#e5e7eb" : "#374151"
                  }
                }
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (field.type === "multiple-choice") {
    const counts =
      field.options?.reduce((acc: any, opt: string) => {
        acc[opt] = fieldData.filter((v: string) => v === opt).length;
        return acc;
      }, {}) || {};

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {field.label}
        </h3>
        <div className="h-48">
          <Bar
            data={{
              labels: Object.keys(counts),
              datasets: [
                {
                  label: "Responses",
                  data: Object.values(counts),
                  backgroundColor: isDark ? "#60a5fa" : "#3b82f6"
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: isDark ? "#e5e7eb" : "#374151"
                  }
                }
              },
              scales: {
                x: {
                  ticks: {
                    color: isDark ? "#9ca3af" : "#6b7280"
                  },
                  grid: {
                    color: isDark ? "#374151" : "#e5e7eb"
                  }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    color: isDark ? "#9ca3af" : "#6b7280"
                  },
                  grid: {
                    color: isDark ? "#374151" : "#e5e7eb"
                  }
                }
              }
            }}
          />
        </div>
      </div>
    );
  }

  return null;
}

function getAverageRating(form: FormData, responses: Response[]): string {
  const ratingFields = form.fields.filter(f => f.type === "rating");
  if (ratingFields.length === 0) return "N/A";

  let totalRating = 0;
  let totalCount = 0;

  ratingFields.forEach(field => {
    const ratings = responses.map(r => r.data[field.id]).filter(Boolean);
    if (ratings.length > 0) {
      totalRating += ratings.reduce((a: number, b: number) => a + b, 0);
      totalCount += ratings.length;
    }
  });

  return totalCount > 0 ? (totalRating / totalCount).toFixed(1) : "N/A";
}

function getResponseTrendsData(responses: Response[], isDark?: boolean) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const responseCounts = last7Days.map(date => {
    return responses.filter(r => r.timestamp.split("T")[0] === date).length;
  });

  return {
    labels: last7Days.map(date =>
      new Date(date).toLocaleDateString("en-US", { weekday: "short" })
    ),
    datasets: [
      {
        label: "Responses",
        data: responseCounts,
        borderColor: isDark ? "#60a5fa" : "#3b82f6",
        backgroundColor: isDark
          ? "rgba(96, 165, 250, 0.1)"
          : "rgba(59, 130, 246, 0.1)",
        tension: 0.1,
        fill: true
      }
    ]
  };
}
