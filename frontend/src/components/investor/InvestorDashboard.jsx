import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  User,
  Settings,
  Search,
  LogOut,
  Bell,
  Shield,
  Star,
  Briefcase,
  DollarSign,
  Target,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investorProfile, setInvestorProfile] = useState(null);
  const [recommendedStartups, setRecommendedStartups] = useState([]);
  const [signedNDAs, setSignedNDAs] = useState([]);
  const [stats, setStats] = useState({
    activeNDAs: 0,
    startupMatches: 0,
  });
  const [preferences, setPreferences] = useState(null);

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
      // Fetch investor preferences
      const preferencesRes = await API.get("/investor/preferences");
      setInvestorProfile(preferencesRes.data.data);
      setPreferences(preferencesRes.data.data);

      // Fetch recommended startups with match scores
      const startupsRes = await API.get("/investor/startups");
      setRecommendedStartups(startupsRes.data.data || []);
      setStats((prev) => ({
        ...prev,
        startupMatches: startupsRes.data.data?.length || 0,
      }));

      // Fetch signed NDAs
      const ndasRes = await API.get("/nda/my-ndas");
      setSignedNDAs(ndasRes.data.data || []);
      setStats((prev) => ({
        ...prev,
        activeNDAs: ndasRes.data.data?.length || 0,
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("User object:", user);
console.log("Created at:", user?.createdAt);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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

  const getSectorLabel = (sector) => {
    const sectors = {
      technology: "Technology",
      healthcare: "Healthcare",
      finance: "Finance",
      education: "Education",
      agriculture: "Agriculture",
      ecommerce: "E-Commerce",
      clean_energy: "Clean Energy",
      manufacturing: "Manufacturing",
      transportation: "Transportation",
      other: "Other",
    };
    return sectors[sector] || sector;
  };

  const getFundingStageLabel = (stage) => {
    const stages = {
      idea: "Idea Stage",
      prototype: "Prototype / MVP",
      early_revenue: "Early Revenue",
      growth: "Growth",
      expansion: "Expansion",
    };
    return stages[stage] || stage;
  };

  const calculateProfileCompletion = () => {
    if (!investorProfile) return 0;

    let completed = 0;
    let total = 6; // Total number of fields to check

    // Check investor type (not default 'angel')
    if (
      investorProfile.investorType &&
      investorProfile.investorType !== "angel"
    ) {
      completed++;
    } else if (investorProfile.investorType === "angel") {
      // Angel is a valid selection, count it
      completed++;
    }

    // Check investment range (both min and max should have values)
    if (
      investorProfile.investmentRangeMin &&
      investorProfile.investmentRangeMin > 0 &&
      investorProfile.investmentRangeMax &&
      investorProfile.investmentRangeMax > 0
    ) {
      completed++;
    }

    // Check preferred sectors (at least one selected)
    if (
      investorProfile.preferredSectors &&
      investorProfile.preferredSectors.length > 0
    ) {
      completed++;
    }

    // Check preferred stages (at least one selected)
    if (
      investorProfile.preferredStages &&
      investorProfile.preferredStages.length > 0
    ) {
      completed++;
    }

    // Check investment thesis (optional but counts if filled)
    if (
      investorProfile.investmentThesis &&
      investorProfile.investmentThesis.trim().length > 20
    ) {
      completed++;
    }

    // Check professional info (company or title)
    if (
      (investorProfile.company && investorProfile.company.trim() !== "") ||
      (investorProfile.title && investorProfile.title.trim() !== "")
    ) {
      completed++;
    }

    console.log("Profile completion:", {
      completed,
      total,
      percent: Math.round((completed / total) * 100),
    });

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
              Welcome back, <span className="text-green-600">{user?.name}</span>
              !
            </h1>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-green-100 rounded-full text-sm font-medium text-green-800">
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Investor
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
              <p className="text-gray-500 text-sm">Active NDAs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeNDAs}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Startup Matches</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.startupMatches}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Matching Criteria Summary */}
      {preferences && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Your Matching Criteria
          </h3>
          <div className="flex flex-wrap gap-3">
            {preferences.preferredSectors?.length > 0 && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                Sectors: {preferences.preferredSectors.slice(0, 2).join(", ")}
                {preferences.preferredSectors.length > 2 &&
                  ` +${preferences.preferredSectors.length - 2}`}
              </span>
            )}
            {preferences.preferredStages?.length > 0 && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                Stages: {preferences.preferredStages.slice(0, 2).join(", ")}
              </span>
            )}
            {preferences.investmentRangeMin &&
              preferences.investmentRangeMax && (
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  Investment: $
                  {Number(preferences.investmentRangeMin).toLocaleString()} - $
                  {Number(preferences.investmentRangeMax).toLocaleString()}
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
              <Settings className="h-5 w-5 text-green-600 mr-2" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/investor/preferences")}
                className="p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200">
                    <Settings className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Update Preferences
                    </p>
                    <p className="text-sm text-gray-500">
                      Refine your investment criteria
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate("/investor/startups")}
                className="p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Find Startups</p>
                    <p className="text-sm text-gray-500">
                      Browse all matching opportunities
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate("/investor/nda-requests")}
                className="p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">My NDAs</p>
                    <p className="text-sm text-gray-500">
                      View your signed agreements
                    </p>
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
                    <p className="text-sm text-gray-500">
                      Chat with entrepreneurs
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recommended Startups */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                Recommended Startups
              </h2>
              {preferences && !preferences.preferredSectors?.length && (
                <span className="text-xs text-gray-400">
                  Update preferences for better matches
                </span>
              )}
            </div>
            {recommendedStartups.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No startup matches yet</p>
                <p className="text-sm text-gray-400">
                  {!preferences?.preferredSectors?.length
                    ? "Set your investment preferences to get recommendations"
                    : "Check back later for new matching startups"}
                </p>
                {!preferences?.preferredSectors?.length && (
                  <button
                    onClick={() => navigate("/investor/preferences")}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    Set Preferences
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedStartups.slice(0, 3).map((startup) => (
                  <div
                    key={startup.id}
                    className={`p-4 border rounded-xl transition-all hover:shadow-md ${
                      startup.matchScore >= 80
                        ? "border-green-200 bg-green-50/30"
                        : startup.matchScore >= 60
                        ? "border-yellow-200 bg-yellow-50/30"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {startup.startupName}
                          </h3>
                          {startup.matchScore && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getMatchColor(
                                startup.matchScore
                              )}`}
                            >
                              {startup.matchScore}% Match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {getSectorLabel(startup.sector)}
                        </p>
                        {startup.description && !startup.requiresNDA && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {startup.description.substring(0, 100)}...
                          </p>
                        )}
                        {startup.requiresNDA && (
                          <p className="text-sm text-gray-400 mt-2 flex items-center">
                            <Shield className="h-3 w-3 mr-1" />
                            Sign NDA to view description
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3">
                        <div>
                          <p className="text-xs text-gray-500">
                            Funding Required
                          </p>
                          <p className="font-medium text-gray-900">
                            {startup.fundingRequired
                              ? `$${Number(
                                  startup.fundingRequired
                                ).toLocaleString()}`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Stage</p>
                          <p className="font-medium text-gray-900 capitalize">
                            {getFundingStageLabel(startup.fundingStage)}
                          </p>
                        </div>
                        {startup.teamSize && (
                          <div>
                            <p className="text-xs text-gray-500">Team</p>
                            <p className="font-medium text-gray-900">
                              {startup.teamSize} members
                            </p>
                          </div>
                        )}
                        {startup.isWomenLed && (
                          <div className="flex items-center">
                            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                              Women Led
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/investor/startup/${startup.id}`)
                          }
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                        >
                          View Details
                        </button>
                        {startup.requiresNDA ? (
                          <button
                            onClick={() =>
                              navigate(`/investor/startup/${startup.id}`)
                            }
                            className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition"
                          >
                            Sign NDA to Connect
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              navigate(`/investor/startup/${startup.id}`)
                            }
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recommendedStartups.length > 3 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate("/investor/startups")}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View all {recommendedStartups.length} startups →
                </button>
              </div>
            )}
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
                <h3 className="font-bold text-gray-900 text-lg">
                  {user?.name}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Investor
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
              {investorProfile && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investor Type</span>
                    <span className="font-medium capitalize">
                      {investorProfile.investorType || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investment Range</span>
                    <span className="font-medium">
                      {investorProfile.investmentRangeMin &&
                      investorProfile.investmentRangeMax
                        ? `$${Number(
                            investorProfile.investmentRangeMin
                          ).toLocaleString()} - $${Number(
                            investorProfile.investmentRangeMax
                          ).toLocaleString()}`
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Sectors</span>
                    <span className="font-medium">
                      {investorProfile.preferredSectors?.length > 0
                        ? investorProfile.preferredSectors
                            .slice(0, 2)
                            .join(", ")
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Stages</span>
                    <span className="font-medium">
                      {investorProfile.preferredStages?.length > 0
                        ? investorProfile.preferredStages.slice(0, 2).join(", ")
                        : "Not set"}
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
              onClick={() => navigate("/investor/preferences")}
              className="mt-6 w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition"
            >
              {profileCompletion < 80
                ? "Complete Your Profile"
                : "Update Preferences"}
            </button>
          </div>

          {/* Signed NDAs Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 text-purple-600 mr-2" />
              Signed NDAs
            </h2>
            {signedNDAs.length === 0 ? (
              <div className="text-center py-4">
                <Shield className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No NDAs signed yet</p>
                <p className="text-xs text-gray-400">
                  Sign NDAs to view startup details
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {signedNDAs.slice(0, 3).map((nda) => (
                  <div
                    key={nda.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <p className="font-medium text-gray-900">
                      {nda.ndaStartup?.startupName || "Unknown Startup"}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Signed: {new Date(nda.signedAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() =>
                          navigate(`/investor/startup/${nda.startupId}`)
                        }
                        className="text-green-600 hover:text-green-700 text-xs font-medium"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {signedNDAs.length > 3 && (
              <div className="mt-3 text-center pt-2 border-t border-gray-100">
                <button
                  onClick={() => navigate("/investor/nda-requests")}
                  className="text-green-600 hover:text-green-700 text-sm"
                >
                  View all {signedNDAs.length} NDAs →
                </button>
              </div>
            )}
          </div>

          {/* Matching Tips */}
          {recommendedStartups.length === 0 && preferences && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                Matching Tips
              </h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Add preferred sectors to get better matches</li>
                <li>• Set your investment range</li>
                <li>• Select funding stages you're interested in</li>
                <li>• Complete your investor profile</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
