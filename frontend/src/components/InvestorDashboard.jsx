
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Settings, 
  Search, 
  Heart, 
  FileText, 
  LogOut,
  TrendingUp,
  DollarSign,
  Briefcase,
  Star,
  Bell,
  CheckCircle,
  Clock,
  Target,
  Shield,
  BarChart3
} from "lucide-react";

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="text-green-600">{user?.name}</span>!
            </h1>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-green-100 rounded-full text-sm font-medium text-green-800">
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Investor
                </span>
              </div>
              <div className="text-gray-600">
                Last login: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
              <Bell className="h-5 w-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">$2.5M</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Investments</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Startup Matches</p>
              <p className="text-2xl font-bold text-gray-900">28</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">ROI (YTD)</p>
              <p className="text-2xl font-bold text-green-600">+18.5%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Settings className="h-5 w-5 text-green-600 mr-2" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200">
                    <Settings className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Set Preferences</p>
                    <p className="text-sm text-gray-500">Define investment criteria</p>
                  </div>
                </div>
              </button>

              <button className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Discover Startups</p>
                    <p className="text-sm text-gray-500">Browse new opportunities</p>
                  </div>
                </div>
              </button>

              <button className="p-4 rounded-lg border border-gray-200 hover:border-red-500 hover:bg-red-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg mr-4 group-hover:bg-red-200">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">My Interests</p>
                    <p className="text-sm text-gray-500">View saved startups</p>
                  </div>
                </div>
              </button>

              <button className="p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">NDA Agreements</p>
                    <p className="text-sm text-gray-500">View signed NDAs</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recommended Startups */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              Recommended Startups
            </h2>
            <div className="space-y-4">
              {[
                { id: 1, name: "AI HealthTech", sector: "Healthcare AI", funding: "$500K", stage: "Seed", match: "95%", description: "AI-powered diagnostic platform" },
                { id: 2, name: "Clean Energy Solutions", sector: "Renewable Energy", funding: "$1.2M", stage: "Series A", match: "88%", description: "Solar energy optimization" },
                { id: 3, name: "FinTech Platform", sector: "Financial Services", funding: "$750K", stage: "Seed", match: "92%", description: "Digital banking for SMEs" },
              ].map((startup) => (
                <div key={startup.id} className="p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{startup.name}</h3>
                      <p className="text-sm text-gray-500">{startup.sector}</p>
                      <p className="text-sm text-gray-600 mt-1">{startup.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        {startup.match} Match
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex space-x-4">
                      <div>
                        <p className="text-xs text-gray-500">Funding Required</p>
                        <p className="font-medium text-gray-900">{startup.funding}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Stage</p>
                        <p className="font-medium text-gray-900">{startup.stage}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition">
                        View Details
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition">
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Profile Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user?.name?.charAt(0) || "I"}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Verified Investor
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">March 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Investment Range</span>
                <span className="font-medium">$50K - $500K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Preferred Sectors</span>
                <span className="font-medium">Tech, Health, FinTech</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deals Closed</span>
                <span className="font-medium text-green-600">8 this year</span>
              </div>
            </div>
            <button className="mt-6 w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition">
              Update Preferences
            </button>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              Upcoming Meetings
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-gray-900">AI HealthTech Pitch</p>
                <p className="text-sm text-gray-500">Tomorrow, 10:00 AM</p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">NDA Signed</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-gray-900">Clean Energy Demo</p>
                <p className="text-sm text-gray-500">In 2 days, 2:00 PM</p>
              </div>
            </div>
          </div>

          {/* Portfolio Snapshot */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 text-green-600 mr-2" />
              Portfolio Snapshot
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">TechFlow AI</p>
                  <p className="text-xs text-gray-500">Invested: $150K</p>
                </div>
                <span className="text-green-600 font-medium">+32%</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">Green Energy Co</p>
                  <p className="text-xs text-gray-500">Invested: $200K</p>
                </div>
                <span className="text-green-600 font-medium">+18%</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">FinTech Solutions</p>
                  <p className="text-xs text-gray-500">Invested: $75K</p>
                </div>
                <span className="text-yellow-600 font-medium">+5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
