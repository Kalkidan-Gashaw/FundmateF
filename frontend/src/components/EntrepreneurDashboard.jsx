import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Briefcase, 
  Users, 
  GraduationCap, 
  FileText, 
  LogOut,
  PlusCircle,
  Search,
  MessageSquare,
  TrendingUp,
  Bell,
  Calendar,
  Star
} from "lucide-react";

const EntrepreneurDashboard = () => {
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
              Welcome back, <span className="text-blue-600">{user?.name}</span>!
            </h1>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-blue-100 rounded-full text-sm font-medium text-blue-800">
                <span className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Entrepreneur
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
              <p className="text-gray-500 text-sm">Profile Views</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Investor Matches</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Mentorship Sessions</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Documents Uploaded</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FileText className="h-6 w-6 text-yellow-600" />
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
              <PlusCircle className="h-5 w-5 text-blue-600 mr-2" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Create/Edit Profile</p>
                    <p className="text-sm text-gray-500">Set up your startup details</p>
                  </div>
                </div>
              </button>

              <button className="p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Find Investors</p>
                    <p className="text-sm text-gray-500">Discover potential backers</p>
                  </div>
                </div>
              </button>

              <button className="p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200">
                    <GraduationCap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Request Mentorship</p>
                    <p className="text-sm text-gray-500">Get guidance from experts</p>
                  </div>
                </div>
              </button>

              <button className="p-4 rounded-lg border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg mr-4 group-hover:bg-yellow-200">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Upload Documents</p>
                    <p className="text-sm text-gray-500">Pitch deck, business plan</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { id: 1, action: "New investor match - Tech Ventures", time: "2 hours ago", type: "success" },
                { id: 2, action: "Pitch deck reviewed by Angel Fund", time: "1 day ago", type: "info" },
                { id: 3, action: "Meeting scheduled with Capital Partners", time: "2 days ago", type: "warning" },
                { id: 4, action: "Profile viewed by 5 investors", time: "3 days ago", type: "success" },
              ].map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${
                      activity.type === 'success' ? 'bg-green-100' :
                      activity.type === 'info' ? 'bg-blue-100' : 'bg-yellow-100'
                    }`}>
                      {activity.type === 'success' && <Star className="h-4 w-4 text-green-600" />}
                      {activity.type === 'info' && <Bell className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'warning' && <Calendar className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Profile Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user?.name?.charAt(0) || "E"}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Entrepreneur
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">March 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profile Complete</span>
                <span className="font-medium text-green-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            <button className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition">
              Complete Your Profile
            </button>
          </div>

          {/* Upcoming */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-purple-600 mr-2" />
              Upcoming
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-gray-900">Investor Pitch Session</p>
                <p className="text-sm text-gray-500">Tomorrow, 2:00 PM</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-gray-900">Mentorship Meeting</p>
                <p className="text-sm text-gray-500">In 3 days, 10:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurDashboard;