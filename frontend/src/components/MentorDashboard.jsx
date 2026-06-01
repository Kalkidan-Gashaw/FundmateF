import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  User, 
  Users, 
  LogOut,
  CheckCircle,
  Clock,
  Bell,
  MessageSquare,
  GraduationCap,
  Settings,
  MessageCircle
} from "lucide-react";

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeMentees, setActiveMentees] = useState([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    activeMenteesCount: 0,
    completedSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch mentor profile
      const profileRes = await API.get("/mentor/profile");
      setMentorProfile(profileRes.data.data);
      
      // Fetch pending requests
      const pendingRes = await API.get("/mentor/pending-requests");
      setPendingRequests(pendingRes.data.data || []);
      
      // Fetch active mentees
      const menteesRes = await API.get("/mentor/active-mentees");
      setActiveMentees(menteesRes.data.data || []);
      
      // Calculate stats from real data
      setStats({
        pendingCount: pendingRes.data.data?.length || 0,
        activeMenteesCount: menteesRes.data.data?.length || 0,
        completedSessions: profileRes.data.data?.totalSessions || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats({
        pendingCount: 0,
        activeMenteesCount: 0,
        completedSessions: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleStartChat = (userId, userName) => {
    navigate(`/messages?userId=${userId}&name=${encodeURIComponent(userName)}&role=entrepreneur`);
  };

  // Calculate profile completion percentage based on actual filled data
  const calculateProfileCompletion = () => {
    if (!mentorProfile) return 0;
    
    let completed = 0;
    let total = 5;
    
    if (mentorProfile.expertise && mentorProfile.expertise.length > 0) completed++;
    if (mentorProfile.bio && mentorProfile.bio.trim() !== "") completed++;
    if (mentorProfile.currentRole && mentorProfile.currentRole.trim() !== "") completed++;
    if (mentorProfile.company && mentorProfile.company.trim() !== "") completed++;
    if (mentorProfile.yearsOfExperience && mentorProfile.yearsOfExperience > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

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
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
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

      {/* Stats Cards - Only 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
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
              <p className="text-2xl font-bold text-green-600">{stats.activeMenteesCount}</p>
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
              <p className="text-2xl font-bold text-blue-600">{stats.completedSessions}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-600" />
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
              <Settings className="h-5 w-5 text-purple-600 mr-2" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate("/mentor/pending-requests")}
                className="p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pending Requests</p>
                    <p className="text-sm text-gray-500">Review mentorship requests</p>
                    {stats.pendingCount > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {stats.pendingCount} new
                      </span>
                    )}
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate("/mentor/my-mentees")}
                className="p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">My Mentees</p>
                    <p className="text-sm text-gray-500">Manage your mentees</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate("/mentor/profile-setup")}
                className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Profile Setup</p>
                    <p className="text-sm text-gray-500">Update your mentor profile</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate("/messages")}
                className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Messages</p>
                    <p className="text-sm text-gray-500">Chat with your mentees</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Mentorship Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 text-purple-600 mr-2" />
                Recent Mentorship Requests
              </h2>
              {pendingRequests.length > 0 && (
                <button 
                  onClick={() => navigate("/mentor/pending-requests")}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  View all →
                </button>
              )}
            </div>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No pending requests</p>
                <p className="text-sm text-gray-400">New requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{request.entrepreneur?.name}</p>
                        <p className="text-sm text-gray-500">{request.topic}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate("/mentor/pending-requests")}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Mentees Section with Chat Button */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="h-5 w-5 text-green-600 mr-2" />
                Active Mentees
              </h2>
              {activeMentees.length > 0 && (
                <button 
                  onClick={() => navigate("/mentor/my-mentees")}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  View all →
                </button>
              )}
            </div>
            {activeMentees.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No active mentees</p>
                <p className="text-sm text-gray-400">Accepted requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMentees.slice(0, 3).map((mentee) => (
                  <div key={mentee.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                        {mentee.entrepreneur?.name?.charAt(0) || "E"}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{mentee.entrepreneur?.name}</p>
                        <p className="text-sm text-gray-500">{mentee.topic}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleStartChat(mentee.entrepreneur?.id, mentee.entrepreneur?.name)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center space-x-1"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>Chat</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            
            {/* Expertise Areas */}
            {mentorProfile?.expertise && mentorProfile.expertise.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Expertise:</p>
                <div className="flex flex-wrap gap-1">
                  {mentorProfile.expertise.slice(0, 3).map((exp) => (
                    <span key={exp} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {exp}
                    </span>
                  ))}
                  {mentorProfile.expertise.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{mentorProfile.expertise.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              {mentorProfile?.currentRole && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Role</span>
                  <span className="font-medium">{mentorProfile.currentRole}</span>
                </div>
              )}
              {mentorProfile?.company && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Company</span>
                  <span className="font-medium">{mentorProfile.company}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Profile Complete</span>
                <span className="font-medium text-green-600">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
              </div>
            </div>
            
            {mentorProfile?.isAvailable ? (
              <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-lg text-center text-sm">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Available for mentorship
              </div>
            ) : (
              <div className="mt-4 p-2 bg-gray-100 text-gray-500 rounded-lg text-center text-sm">
                <Clock className="h-4 w-4 inline mr-1" />
                Currently unavailable
              </div>
            )}
            
            <button 
              onClick={() => navigate("/mentor/profile-setup")}
              className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;