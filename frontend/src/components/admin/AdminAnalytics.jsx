import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Building2,
  FileText,
  DollarSign,
  Award,
  Activity,
  Calendar,
  Loader,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    checkAdminAccess();
    fetchAnalytics();
  }, []);

  const checkAdminAccess = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.role !== "admin") {
      navigate("/dashboard");
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin/analytics");
      setAnalytics(response.data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setMessage({ type: "error", text: "Error loading analytics data" });
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for user trends chart
  const getUserTrendsData = () => {
    if (!analytics?.userTrends) return { labels: [], datasets: [] };
    
    const months = {};
    const entrepreneurs = {};
    const investors = {};
    const mentors = {};
    
    analytics.userTrends.forEach(item => {
      const month = new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months[month] = true;
      if (item.role === 'entrepreneur') entrepreneurs[month] = item.count;
      else if (item.role === 'investor') investors[month] = item.count;
      else if (item.role === 'mentor') mentors[month] = item.count;
    });
    
    const labels = Object.keys(months);
    
    return {
      labels,
      datasets: [
        {
          label: 'Entrepreneurs',
          data: labels.map(l => entrepreneurs[l] || 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Investors',
          data: labels.map(l => investors[l] || 0),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Mentors',
          data: labels.map(l => mentors[l] || 0),
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare data for startup trends chart
  const getStartupTrendsData = () => {
    if (!analytics?.startupTrends) return { labels: [], datasets: [] };
    
    const labels = analytics.startupTrends.map(item => 
      new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    );
    const data = analytics.startupTrends.map(item => item.count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Startups Created',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderRadius: 8,
        },
      ],
    };
  };

  // Prepare data for NDA trends chart
  const getNDATrendsData = () => {
    if (!analytics?.ndaTrends) return { labels: [], datasets: [] };
    
    const labels = analytics.ndaTrends.map(item => 
      new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    );
    const data = analytics.ndaTrends.map(item => item.count);
    
    return {
      labels,
      datasets: [
        {
          label: 'NDAs Signed',
          data,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare data for role distribution pie chart
  const getRoleDistributionData = () => {
    if (!analytics?.roleDistribution) return { labels: [], datasets: [] };
    
    const labels = analytics.roleDistribution.map(item => {
      switch(item.role) {
        case 'entrepreneur': return 'Entrepreneurs';
        case 'investor': return 'Investors';
        case 'mentor': return 'Mentors';
        case 'admin': return 'Admins';
        default: return item.role;
      }
    });
    const data = analytics.roleDistribution.map(item => item.count);
    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(239, 68, 68, 0.8)',
    ];
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    };
  };

  // Prepare data for mentorship status pie chart
  const getMentorshipData = () => {
    if (!analytics?.mentorshipStats) return { labels: [], datasets: [] };
    
    const labels = analytics.mentorshipStats.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1));
    const data = analytics.mentorshipStats.map(item => item.count);
    const colors = {
      pending: 'rgba(234, 179, 8, 0.8)',
      accepted: 'rgba(34, 197, 94, 0.8)',
      completed: 'rgba(59, 130, 246, 0.8)',
      rejected: 'rgba(239, 68, 68, 0.8)',
    };
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: analytics.mentorshipStats.map(item => colors[item.status] || 'rgba(107, 114, 128, 0.8)'),
          borderWidth: 0,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-600 mt-1">Track platform growth and activity metrics</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message.type === "success" ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
          {message.text}
        </div>
      )}

      {/* Key Metrics Cards */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.activeUsers || 0}</p>
              <p className="text-sm text-gray-500">Active Users (Last 30 days)</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.startupTrends?.reduce((sum, s) => sum + s.count, 0) || 0}</p>
              <p className="text-sm text-gray-500">Total Startups Created</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.ndaTrends?.reduce((sum, n) => sum + n.count, 0) || 0}</p>
              <p className="text-sm text-gray-500">Total NDAs Signed</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${((analytics.investmentStats?.totalFundingSeeking || 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-gray-500">Total Funding Seeking</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* User Growth Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                User Growth Trends
              </h2>
              <div className="h-80">
                <Line data={getUserTrendsData()} options={lineChartOptions} />
              </div>
            </div>

            {/* Startup Creation Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 text-green-600 mr-2" />
                Startup Creation Trends
              </h2>
              <div className="h-80">
                <Bar data={getStartupTrendsData()} options={barChartOptions} />
              </div>
            </div>

            {/* NDA Signing Trends */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                NDA Signing Trends
              </h2>
              <div className="h-80">
                <Line data={getNDATrendsData()} options={lineChartOptions} />
              </div>
            </div>

            {/* User Role Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                User Role Distribution
              </h2>
              <div className="h-80">
                <Pie data={getRoleDistributionData()} options={chartOptions} />
              </div>
            </div>

            {/* Mentorship Status */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 text-purple-600 mr-2" />
                Mentorship Status
              </h2>
              <div className="h-80">
                <Pie data={getMentorshipData()} options={chartOptions} />
              </div>
            </div>

            {/* Investment Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
                Investment Statistics
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Funding Seeking</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${((analytics.investmentStats?.totalFundingSeeking || 0) / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Average Funding per Startup</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${((analytics.investmentStats?.averageFunding || 0) / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Funded Startups</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.investmentStats?.fundedStartups || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;