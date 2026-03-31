import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Users, 
  Calendar, 
  BookOpen, 
  LogOut,
  CheckCircle,
  Clock,
  Star,
  Bell,
  MessageSquare,
  GraduationCap,
  FileText,
  Video,
  TrendingUp
} from "lucide-react";

const MentorDashboard = () => {
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
              Welcome back, <span className="text-purple-600">{user?.name}</span>!
            </h1>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-purple-100 rounded-full text-sm font-medium text-purple-800">
                <span className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Mentor
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
              <p className="text-gray-500 text-sm">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Mentees</p>
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
              <p className="text-gray-500 text-sm">Completed Sessions</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rating</p>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Star className="h-6 w-6 text-purple-600" />
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
              <GraduationCap className="h-5 w-5 text-purple-600 mr-2" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Pending Requests</p>
                    <p className="text-sm text-gray-500">Review mentorship requests</p>
                  </div>
                </div>
              </button>

              <button className="p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Assigned Mentees</p>
                    <p className="text-sm text-gray-500">Manage your mentees</p>
                  </div>
                </div>
              </button>

              <button className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Set Schedule</p>
                    <p className="text-sm text-gray-500">Update your availability</p>
                  </div>
                </div>
              </button>

              <button className="p-4 rounded-lg border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 transition group text-left">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg mr-4 group-hover:bg-yellow-200">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Share Resources</p>
                    <p className="text-sm text-gray-500">Upload learning materials</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Mentorship Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Mentorship Requests</h2>
            <div className="space-y-4">
              {[
                { id: 1, name: "Sarah Johnson", startup: "AI HealthTech", request: "Pitch deck review", time: "2 hours ago", status: "pending" },
                { id: 2, name: "Michael Chen", startup: "Clean Energy", request: "Business strategy", time: "1 day ago", status: "pending" },
                { id: 3, name: "Emma Davis", startup: "FinTech Platform", request: "Funding advice", time: "2 days ago", status: "accepted" },
              ].map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{request.name}</p>
                      <p className="text-sm text-gray-500">{request.startup} - {request.request}</p>
                      <p className="text-xs text-gray-400">{request.time}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition">
                      Accept
                    </button>
                    <button className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition">
                      Decline
                    </button>
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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user?.name?.charAt(0) || "M"}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Mentor
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">March 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expertise Areas</span>
                <span className="font-medium">Tech, Finance, Marketing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Rate</span>
                <span className="font-medium text-green-600">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }}></div>
              </div>
            </div>
            <button className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition">
              Update Profile
            </button>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-purple-600 mr-2" />
              Upcoming Sessions
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-gray-900">Mentorship with Sarah</p>
                <p className="text-sm text-gray-500">Today, 3:00 PM</p>
                <div className="flex items-center mt-2 text-sm text-purple-600">
                  <Video className="h-4 w-4 mr-1" />
                  <span>Video Call</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-gray-900">Strategy Session with Michael</p>
                <p className="text-sm text-gray-500">Tomorrow, 11:00 AM</p>
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>Chat Session</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-gray-900">Pitch Review with Emma</p>
                <p className="text-sm text-gray-500">In 2 days, 2:00 PM</p>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <Video className="h-4 w-4 mr-1" />
                  <span>Video Call</span>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Resources */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
              Popular Resources
            </h2>
            <div className="space-y-3">
              <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Startup Pitch Deck Template</span>
                <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Business Model Canvas Guide</span>
                <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Fundraising Strategy PDF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;