import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Search,
  Filter,
  DollarSign,
  Briefcase,
  Star,
  TrendingUp,
  Users,
  Building2,
  Target,
  Eye,
  Heart,
  Loader,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const FindStartups = () => {
  const navigate = useNavigate();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sector: "all",
    fundingStage: "all",
    minFunding: "",
    maxFunding: "",
    search: "",
  });
  const [preferences, setPreferences] = useState(null);

  // Helper function to get first sentence (up to first full stop)
  const getFirstSentence = (text) => {
    if (!text) return "";
    const firstFullStopIndex = text.indexOf(".");
    if (firstFullStopIndex !== -1) {
      return text.substring(0, firstFullStopIndex + 1);
    }
    return text;
  };

  // Fetch startups on load
  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    setLoading(true);
    try {
      const response = await API.get("/investor/startups");
      setStartups(response.data.data);
      setPreferences(response.data.preferences);
    } catch (error) {
      if (error.response?.status === 404) {
        navigate("/investor/preferences");
      } else {
        console.error("Error fetching startups:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.sector && filters.sector !== "all") params.append("sector", filters.sector);
      if (filters.fundingStage && filters.fundingStage !== "all") params.append("fundingStage", filters.fundingStage);
      if (filters.minFunding) params.append("minFunding", filters.minFunding);
      if (filters.maxFunding) params.append("maxFunding", filters.maxFunding);
      if (filters.search && filters.search.trim()) params.append("search", filters.search.trim());
      
      const response = await API.get(`/investor/startups/search?${params.toString()}`);
      setStartups(response.data.data);
    } catch (error) {
      console.error("Error searching startups:", error);
      setStartups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      sector: "all",
      fundingStage: "all",
      minFunding: "",
      maxFunding: "",
      search: "",
    });
    fetchStartups();
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
      other: "Other"
    };
    return sectors[sector] || sector;
  };

  const getFundingStageLabel = (stage) => {
    const stages = {
      idea: "Idea Stage",
      prototype: "Prototype / MVP",
      early_revenue: "Early Revenue",
      growth: "Growth",
      expansion: "Expansion"
    };
    return stages[stage] || stage;
  };

  const getMatchColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-600";
  };

  const sectors = [
    { value: "all", label: "All Sectors" },
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "agriculture", label: "Agriculture" },
    { value: "ecommerce", label: "E-Commerce" },
    { value: "clean_energy", label: "Clean Energy" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "transportation", label: "Transportation" },
  ];

  const fundingStages = [
    { value: "all", label: "All Stages" },
    { value: "idea", label: "Idea Stage" },
    { value: "prototype", label: "Prototype / MVP" },
    { value: "early_revenue", label: "Early Revenue" },
    { value: "growth", label: "Growth" },
    { value: "expansion", label: "Expansion" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/investor-dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Search className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Startups</h1>
              <p className="text-gray-600 mt-1">
                Discover matching investment opportunities
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/investor/preferences")}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Star className="h-4 w-4" />
            <span>Update Preferences</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by startup name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Search
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sector</label>
                <select
                  name="sector"
                  value={filters.sector}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {sectors.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Funding Stage</label>
                <select
                  name="fundingStage"
                  value={filters.fundingStage}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {fundingStages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Funding (USD)</label>
                <input
                  type="number"
                  name="minFunding"
                  value={filters.minFunding}
                  onChange={handleFilterChange}
                  placeholder="Min amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Funding (USD)</label>
                <input
                  type="number"
                  name="maxFunding"
                  value={filters.maxFunding}
                  onChange={handleFilterChange}
                  placeholder="Max amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
                <span>Clear all filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Found <span className="font-bold text-gray-900">{startups.length}</span> startups
        </p>
      </div>

      {/* Startups Grid */}
      {startups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No startups found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or update your investment preferences
          </p>
          <button
            onClick={() => navigate("/investor/preferences")}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Update Preferences
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {startups.map((startup) => (
            <div
              key={startup.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{startup.startupName}</h2>
                      {startup.matchScore && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(startup.matchScore)}`}>
                          {startup.matchScore}% Match
                        </span>
                      )}
                      {/* Show NDA Protected if description is null (meaning no NDA signed) */}
                      {!startup.description ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center">
                          <Lock className="h-3 w-3 mr-1" />
                          Sign NDA to Unlock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Full Access
                        </span>
                      )}
                    </div>
                    
                    {/* Description - Show first sentence only if NDA signed */}
                    <div className="mb-4">
                      {!startup.description ? (
                        <div className="flex items-center text-gray-400 bg-gray-50 p-3 rounded-lg">
                          <Lock className="h-4 w-4 mr-2" />
                          <span className="text-sm">Sign NDA to view business description</span>
                        </div>
                      ) : startup.description ? (
                        <p className="text-gray-600">
                          {getFirstSentence(startup.description)}
                        </p>
                      ) : (
                        <p className="text-gray-400 italic">No description provided</p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Building2 className="h-4 w-4 mr-1" />
                        {getSectorLabel(startup.sector)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Target className="h-4 w-4 mr-1" />
                        {getFundingStageLabel(startup.fundingStage)}
                      </div>
                      {startup.fundingRequired && (
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${Number(startup.fundingRequired).toLocaleString()}
                        </div>
                      )}
                      {startup.teamSize && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {startup.teamSize} members
                        </div>
                      )}
                      {startup.isWomenLed && (
                        <div className="flex items-center text-sm text-pink-500">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Women Led
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-xs">
                            {startup.User?.name?.charAt(0) || "F"}
                          </span>
                        </div>
                        <span>{startup.User?.name || "Founder"}</span>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/investor/startup/${startup.id}`)}
                          className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        <button className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                          <Heart className="h-4 w-4" />
                          <span>Express Interest</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindStartups;