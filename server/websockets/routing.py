# websockets/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/analytics/
        

interface AnalyticsData {
  totalResponses: number;
  totalForms: number;
  responsesByForm: Array<{
    formTitle: string;
    responseCount: number;
  }>;
  fieldAnalytics: Array<{
    fieldLabel: string;
    fieldType: string;
    responses: any[];
  }>;
  recentResponses: Array<{
    formTitle: string;
    submittedAt: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [forms, setForms] = useState<Array<{id: string, title: string}>>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);

    newSocket.on('new_response', (data) => {
      // Update analytics when new response is received
      fetchAnalytics();
    });

    fetchForms();
    fetchAnalytics();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/forms/');
      if (response.ok) {
        const formsData = await response.json();
        setForms(formsData);
        if (formsData.length > 0 && !selectedFormId) {
          setSelectedFormId(formsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const url = selectedFormId 
        ? `http://localhost:8000/api/analytics/${selectedFormId}/`
        : 'http://localhost:8000/api/analytics/';
      
      const response = await fetch(url);
      if (response.ok) {
        const analyticsData = await response.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    if (selectedFormId) {
      fetchAnalytics();
    }
  }, [selectedFormId]);

  const renderFieldAnalytics = (field: any) => {
    switch (field.fieldType) {
      case 'multiple-choice':
      case 'checkbox':
        const optionCounts = field.responses.reduce((acc: any, response: any) => {
          const values = Array.isArray(response) ? response : [response];
          values.forEach((value: string) => {
            acc[value] = (acc[value] || 0) + 1;
          });
          return acc;
        }, {});

        const pieData = Object.entries(optionCounts).map(([option, count], index) => ({
          name: option,
          value: count as number,
          fill: COLORS[index % COLORS.length]
        }));

        return (
          <div key={field.fieldLabel} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">{field.fieldLabel}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'rating':
        const ratingCounts = field.responses.reduce((acc: any, response: number) => {
          acc[response] = (acc[response] || 0) + 1;
          return acc;
        }, {});

        const ratingData = [1, 2, 3, 4, 5].map(rating => ({
          rating: `${rating} Star${rating !== 1 ? 's' : ''}`,
          count: ratingCounts[rating] || 0
        }));

        const averageRating = field.responses.length > 0 
          ? (field.responses.reduce((sum: number, rating: number) => sum + rating, 0) / field.responses.length).toFixed(1)
          : 0;

        return (
          <div key={field.fieldLabel} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{field.fieldLabel}</h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{averageRating}</p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'text':
        const wordCount = field.responses.reduce((total: number, response: string) => {
          return total + (response ? response.split(' ').length : 0);
        }, 0);

        const averageWords = field.responses.length > 0 ? (wordCount / field.responses.length).toFixed(1) : 0;

        return (
          <div key={field.fieldLabel} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">{field.fieldLabel}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{field.responses.length}</p>
                <p className="text-sm text-gray-500">Total Responses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{averageWords}</p>
                <p className="text-sm text-gray-500">Avg Words</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Recent Responses:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {field.responses.slice(-3).map((response: string, index: number) => (
                  <p key={index} className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    {response.length > 100 ? `${response.substring(0, 100)}...` : response}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-300 rounded-lg h-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-300 rounded-lg h-64"></div>
            <div className="bg-gray-300 rounded-lg h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <select
          value={selectedFormId}
          onChange={(e) => setSelectedFormId(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        >
          <option value="">All Forms</option>
          {forms.map(form => (
            <option key={form.id} value={form.id}>{form.title}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Responses</p>
              <p className="text-2xl font-bold">{analytics.totalResponses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Forms</p>
              <p className="text-2xl font-bold">{analytics.totalForms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg per Form</p>
              <p className="text-2xl font-bold">
                {analytics.totalForms > 0 ? (analytics.totalResponses / analytics.totalForms).toFixed(1) : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Week</p>
              <p className="text-2xl font-bold">
                {analytics.recentResponses.filter(r => 
                  new Date(r.submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Responses by Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Responses by Form</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.responsesByForm}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formTitle" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="responseCount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analytics.recentResponses.slice(0, 10).map((response, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium">{response.formTitle}</p>
                  <p className="text-sm text-gray-500">New response</p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(response.submittedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Field Analytics */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Field Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics.fieldAnalytics.map(renderFieldAnalytics)}
        </div>
      </div>
    </div>
  );
}, consumers.AnalyticsConsumer.as_asgi()),
]