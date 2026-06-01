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
  Users,
  Building2,
  Target,
  Eye,
  Heart,
  Loader,
  ChevronDown,
  ChevronUp,
  X,
  Award,
  Calendar,
  Mail,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const FindInvestors = () => {
  const navigate = useNavigate();
  const [investors, setInvestors] = useState([]);
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    investorType: "all",
    minInvestment: "",
    maxInvestment: "",
    search: "",
  });

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const response = await API.get("/entrepreneur/investors");
      console.log("Investors data:", response.data.data);
      setInvestors(response.data.data);
      setStartup(response.data.startup);
    } catch (error) {
      if (error.response?.status === 404) {
        navigate("/startup/create");
      } else {
        console.error("Error fetching investors:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.investorType && filters.investorType !== "all") params.append("investorType", filters.investorType);
      if (filters.minInvestment) params.append("minInvestment", filters.minInvestment);
      if (filters.maxInvestment) params.append("maxInvestment", filters.maxInvestment);
      if (filters.search && filters.search.trim()) params.append("search", filters.search.trim());
      
      const response = await API.get(`/entrepreneur/investors/search?${params.toString()}`);
      setInvestors(response.data.data);
    } catch (error) {
      console.error("Error searching investors:", error);
      setInvestors([]);
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
      investorType: "all",
      minInvestment: "",
      maxInvestment: "",
      search: "",
    });
    fetchInvestors();
  };

  const getInvestorTypeLabel = (type) => {
    const types = {
      angel: "Angel Investor",
      vc: "Venture Capital",
      corporate: "Corporate VC",
      fund: "Investment Fund",
      individual: "Individual Investor"
    };
    return types[type] || type;
  };

  const getMatchColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-600";
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    return stars;
  };

  const investorTypes = [
    { value: "all", label: "All Types" },
    { value: "angel", label: "Angel Investor" },
    { value: "vc", label: "Venture Capital" },
    { value: "corporate", label: "Corporate VC" },
    { value: "fund", label: "Investment Fund" },
    { value: "individual", label: "Individual Investor" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/entrepreneur-dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Investors</h1>
              <p className="text-gray-600 mt-1">
                Discover investors interested in {startup?.startupName || "your startup"}
              </p>
            </div>
          </div>
          {startup && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
              <Briefcase className="h-4 w-4" />
              <span>Seeking: ${Number(startup.fundingRequired).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* No Startup Warning */}
      {!startup && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900">No Startup Profile Found</h3>
              <p className="text-gray-600 text-sm mt-1">
                You need to create a startup profile before you can find matching investors.
              </p>
              <button
                onClick={() => navigate("/startup/create")}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
              >
                Create Startup Profile
              </button>
            </div>
          </div>
        </div>
      )}

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
              placeholder="Search by investor name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Investor Type</label>
                <select
                  name="investorType"
                  value={filters.investorType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {investorTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Investment (USD)</label>
                <input
                  type="number"
                  name="minInvestment"
                  value={filters.minInvestment}
                  onChange={handleFilterChange}
                  placeholder="Min amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Investment (USD)</label>
                <input
                  type="number"
                  name="maxInvestment"
                  value={filters.maxInvestment}
                  onChange={handleFilterChange}
                  placeholder="Max amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          Found <span className="font-bold text-gray-900">{investors.length}</span> investors
        </p>
      </div>

      {/* Investors Grid */}
      {investors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No investors found</h3>
          <p className="text-gray-600">
            {startup 
              ? "Try adjusting your filters or complete your startup profile for better matches"
              : "Create your startup profile to find matching investors"}
          </p>
          {!startup && (
            <button
              onClick={() => navigate("/startup/create")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Startup Profile
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {investors.map((investor) => (
            <div
              key={investor.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{investor.user?.name || investor.User?.name}</h2>
                      {investor.matchScore && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(investor.matchScore)}`}>
                          {investor.matchScore}% Match
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        <Award className="h-3 w-3 mr-1" />
                        {getInvestorTypeLabel(investor.investorType)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      {investor.company && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Building2 className="h-4 w-4 mr-1" />
                          {investor.company}
                        </div>
                      )}
                      {investor.title && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {investor.title}
                        </div>
                      )}
                      {investor.investmentRangeMin && investor.investmentRangeMax && (
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${Number(investor.investmentRangeMin).toLocaleString()} - ${Number(investor.investmentRangeMax).toLocaleString()}
                        </div>
                      )}
                      {investor.yearsOfExperience && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {investor.yearsOfExperience} years exp.
                        </div>
                      )}
                    </div>

                    {/* Preferred Sectors */}
                    {investor.preferredSectors && investor.preferredSectors.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Interested in:</p>
                        <div className="flex flex-wrap gap-2">
                          {investor.preferredSectors.slice(0, 3).map((sector) => (
                            <span key={sector} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {sector}
                            </span>
                          ))}
                          {investor.preferredSectors.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{investor.preferredSectors.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Investment Thesis */}
                    {investor.investmentThesis && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Investment Thesis:</p>
                        <p className="text-sm text-gray-700">{investor.investmentThesis.substring(0, 150)}...</p>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      {renderStars(investor.rating || 0)}
                      <span className="ml-2 text-sm text-gray-500">
                        ({investor.totalSessions || 0} deals)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Mail className="h-4 w-4" />
                        <span>{investor.user?.email || investor.User?.email}</span>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/entrepreneur/investor/${investor.id}`)}
                          className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Profile</span>
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

export default FindInvestors;