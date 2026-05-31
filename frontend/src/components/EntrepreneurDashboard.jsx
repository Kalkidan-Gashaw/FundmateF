import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  User, 
  Briefcase, 
  Users, 
  GraduationCap, 
  LogOut,
  PlusCircle,
  Search,
  MessageSquare,
  TrendingUp,
  Bell,
  Calendar,
  Shield,
  Eye,
  CheckCircle,
  DollarSign
} from "lucide-react";

const EntrepreneurDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hasStartup, setHasStartup] = useState(false);
  const [startupId, setStartupId] = useState(null);
  const [startup, setStartup] = useState(null);
  const [interestedInvestors, setInterestedInvestors] = useState(0);
  const [activeMentors, setActiveMentors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    setUser(JSON.parse(userData));
    
    const fetchDashboardData = async () => {
      try {
        // Check if user has a startup
        const startupResponse = await API.get("/entrepreneur/startup");
        if (startupResponse.data.data) {
          setHasStartup(true);
          setStartupId(startupResponse.data.data.id);
          setStartup(startupResponse.data.data);
          
          // Fetch interested investors (investors who signed NDA)
          try {
            const investorsResponse = await API.get("/entrepreneur/interested-investors");
            setInterestedInvestors(investorsResponse.data.data?.length || 0);
          } catch (err) {
            console.error("Error fetching investors:", err);
          }
          
          // Fetch active mentors (accepted mentorship requests)
          try {
            const mentorshipResponse = await API.get("/mentor/my-requests");
            const mentorshipRequests = mentorshipResponse.data.data || [];
            const activeMentorsCount = mentorshipRequests.filter(r => r.status === "accepted" || r.status === "completed").length;
            setActiveMentors(activeMentorsCount);
          } catch (err) {
            console.error("Error fetching mentors:", err);
          }
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error fetching dashboard data:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!startup) return 0;
    
    let completed = 0;
    let total = 5;
    
    if (startup.startupName && startup.startupName.trim() !== "") completed++;
    if (startup.sector && startup.sector !== "other") completed++;
    if (startup.fundingStage) completed++;
    if (startup.description && startup.description.length > 50) completed++;
    if (startup.fundingRequired && startup.fundingRequired > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

      {/* Stats Cards - Only Investor Interested and Mentors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Interested Investors</p>
              <p className="text-2xl font-bold text-gray-900">{interestedInvestors}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Mentors</p>
              <p className="text-2xl font-bold text-gray-900">{activeMentors}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <GraduationCap className="h-6 w-6 text-purple-600" />
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
              {hasStartup ? (
                <button 
                  onClick={() => navigate(`/startup/edit/${startupId}`)}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group text-left"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Edit Startup Profile</p>
                      <p className="text-sm text-gray-500">Update your company details</p>
                    </div>
                  </div>
                </button>
              ) : (
                <button 
                  onClick={() => navigate("/startup/create")}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group text-left"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Create Startup Profile</p>
                      <p className="text-sm text-gray-500">Set up your startup details</p>
                    </div>
                  </div>
                </button>
              )}

              <button 
                onClick={() => navigate("/investors")}
                className="p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition group text-left"
              >
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

              <button 
                onClick={() => navigate("/entrepreneur/find-mentors")}
                className="p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200">
                    <GraduationCap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Find Mentors</p>
                    <p className="text-sm text-gray-500">Get guidance from experts</p>
                  </div>
                </div>
              </button>
            </div>
            
            {hasStartup && (
              <button
                onClick={() => navigate("/entrepreneur/nda-requests")}
                className="mt-4 w-full p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">NDA Requests</p>
                    <p className="text-sm text-gray-500">Review investor access requests</p>
                  </div>
                </div>
              </button>
            )}
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
                <span className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              {startup && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Startup</span>
                    <span className="font-medium">{startup.startupName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sector</span>
                    <span className="font-medium capitalize">{startup.sector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Funding Stage</span>
                    <span className="font-medium capitalize">{startup.fundingStage?.replace(/_/g, ' ')}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Profile Complete</span>
                <span className="font-medium text-green-600">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
              </div>
            </div>
            <button 
              onClick={() => hasStartup ? navigate(`/startup/edit/${startupId}`) : navigate("/startup/create")}
              className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
            >
              {hasStartup ? "Edit Your Startup" : "Complete Your Profile"}
            </button>
          </div>

          {/* Startup Preview - Only if startup exists */}
          {hasStartup && startup && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                Your Startup
              </h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{startup.startupName}</p>
                {startup.description && (
                  <p className="text-sm text-gray-500 line-clamp-3">{startup.description.substring(0, 150)}...</p>
                )}
                <button
                  onClick={() => navigate(`/startup/mine`)}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View full profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurDashboard;