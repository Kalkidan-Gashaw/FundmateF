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
  DollarSign,
  Star,
  Target,
  Building2,
  Mail,
  MessageCircle,
} from "lucide-react";

const EntrepreneurDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hasStartup, setHasStartup] = useState(false);
  const [startupId, setStartupId] = useState(null);
  const [startup, setStartup] = useState(null);
  const [interestedInvestors, setInterestedInvestors] = useState(0);
  const [activeMentors, setActiveMentors] = useState(0);
  const [matchedInvestors, setMatchedInvestors] = useState([]);
  const [loadingInvestors, setLoadingInvestors] = useState(false);
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
            const investorsResponse = await API.get(
              "/entrepreneur/interested-investors"
            );
            setInterestedInvestors(investorsResponse.data.data?.length || 0);
          } catch (err) {
            console.error("Error fetching investors:", err);
          }

          // Fetch matched investors
          await fetchMatchedInvestors();

          // Fetch active mentors (accepted mentorship requests)
          try {
            const mentorshipResponse = await API.get("/mentor/my-requests");
            const mentorshipRequests = mentorshipResponse.data.data || [];
            const activeMentorsCount = mentorshipRequests.filter(
              (r) => r.status === "accepted" || r.status === "completed"
            ).length;
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

  const fetchMatchedInvestors = async () => {
    setLoadingInvestors(true);
    try {
      const response = await API.get("/entrepreneur/investors");
      setMatchedInvestors(response.data.data || []);
    } catch (error) {
      console.error("Error fetching matched investors:", error);
    } finally {
      setLoadingInvestors(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleStartChat = (investorId, investorName) => {
    navigate(
      `/messages?userId=${investorId}&name=${encodeURIComponent(
        investorName
      )}&role=investor`
    );
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

  const getMatchColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (score >= 40) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const getMatchText = (score) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Potential Match";
    return "Low Match";
  };

  const getInvestorTypeLabel = (type) => {
    const types = {
      angel: "Angel Investor",
      vc: "Venture Capital",
      corporate: "Corporate VC",
      fund: "Investment Fund",
      individual: "Individual Investor",
    };
    return types[type] || type;
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
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Interested Investors</p>
              <p className="text-2xl font-bold text-gray-900">
                {interestedInvestors}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {activeMentors}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Matching Criteria Summary */}
      {startup && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Your Startup Profile
          </h3>
          <div className="flex flex-wrap gap-3">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              Sector: {startup.sector}
            </span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Stage: {startup.fundingStage}
            </span>
            {startup.fundingRequired && (
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                Funding: ${Number(startup.fundingRequired).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

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
                      <p className="font-medium text-gray-900">
                        Edit Startup Profile
                      </p>
                      <p className="text-sm text-gray-500">
                        Update your company details
                      </p>
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
                      <p className="font-medium text-gray-900">
                        Create Startup Profile
                      </p>
                      <p className="text-sm text-gray-500">
                        Set up your startup details
                      </p>
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
                    <p className="text-sm text-gray-500">
                      Discover potential backers
                    </p>
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
                    <p className="text-sm text-gray-500">
                      Get guidance from experts
                    </p>
                  </div>
                </div>
              </button>
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
                    <p className="text-sm text-gray-500">
                      Review investor access requests
                    </p>
                  </div>
                </div>
              </button>
            )}
            </div>

            
          </div>

          {/* Recommended Investors Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                Recommended Investors
              </h2>
              {!hasStartup && (
                <span className="text-xs text-gray-400">
                  Create startup to see matches
                </span>
              )}
            </div>

            {!hasStartup ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Create your startup profile first
                </p>
                <p className="text-sm text-gray-400">
                  Complete your profile to get investor matches
                </p>
                <button
                  onClick={() => navigate("/startup/create")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Create Startup Profile
                </button>
              </div>
            ) : loadingInvestors ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : matchedInvestors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No investor matches yet</p>
                <p className="text-sm text-gray-400">
                  Complete your profile for better matches
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchedInvestors.slice(0, 3).map((investor) => (
                  <div
                    key={investor.id}
                    className={`p-4 border rounded-xl transition-all hover:shadow-md ${
                      investor.matchScore >= 80
                        ? "border-green-200 bg-green-50/30"
                        : investor.matchScore >= 60
                        ? "border-yellow-200 bg-yellow-50/30"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {investor.user?.name}
                          </h3>
                          {investor.matchScore && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getMatchColor(
                                investor.matchScore
                              )}`}
                            >
                              {investor.matchScore}% Match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {getInvestorTypeLabel(investor.investorType)}
                        </p>
                        {investor.company && (
                          <p className="text-sm text-gray-600 mt-1">
                            {investor.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3">
                        {investor.investmentRangeMin &&
                          investor.investmentRangeMax && (
                            <div>
                              <p className="text-xs text-gray-500">
                                Investment Range
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                $
                                {Number(
                                  investor.investmentRangeMin
                                ).toLocaleString()}{" "}
                                - $
                                {Number(
                                  investor.investmentRangeMax
                                ).toLocaleString()}
                              </p>
                            </div>
                          )}
                        {investor.preferredSectors &&
                          investor.preferredSectors.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500">
                                Interested In
                              </p>
                              <p className="font-medium text-gray-900 text-sm">
                                {investor.preferredSectors
                                  .slice(0, 2)
                                  .join(", ")}
                                {investor.preferredSectors.length > 2 &&
                                  ` +${investor.preferredSectors.length - 2}`}
                              </p>
                            </div>
                          )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStartChat(
                              investor.user?.id,
                              investor.user?.name
                            )
                          }
                          className="px-3 py-1.5 border border-blue-600 text-blue-600 text-sm rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Message
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/entrepreneur/investor/${investor.id}`)
                          }
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {matchedInvestors.length > 3 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate("/investors")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all {matchedInvestors.length} investors →
                </button>
              </div>
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
                <h3 className="font-bold text-gray-900 text-lg">
                  {user?.name}
                </h3>
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
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
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
                    <span className="font-medium capitalize">
                      {startup.sector}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Funding Stage</span>
                    <span className="font-medium capitalize">
                      {startup.fundingStage?.replace(/_/g, " ")}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Profile Complete</span>
                <span className="font-medium text-green-600">
                  {profileCompletion}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={() =>
                hasStartup
                  ? navigate(`/startup/edit/${startupId}`)
                  : navigate("/startup/create")
              }
              className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
            >
              {hasStartup ? "Edit Your Startup" : "Complete Your Profile"}
            </button>
          </div>

          {/* Startup Preview */}
          {hasStartup && startup && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                Your Startup
              </h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {startup.startupName}
                </p>
                {startup.description && (
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {startup.description.substring(0, 150)}...
                  </p>
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
