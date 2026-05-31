import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Search,
  Filter,
  Star,
  Users,
  Briefcase,
  Award,
  Clock,
  Eye,
  Mail,
  Loader,
  ChevronDown,
  ChevronUp,
  X,
  GraduationCap,
  Heart,
  CheckCircle,
  DollarSign
} from "lucide-react";

const FindMentors = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    expertise: "all",
    search: "",
  });

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const response = await API.get("/mentor/all");
      console.log("Mentors data:", response.data.data);
      setMentors(response.data.data);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.expertise && filters.expertise !== "all") params.append("expertise", filters.expertise);
      if (filters.search && filters.search.trim()) params.append("search", filters.search.trim());
      
      const response = await API.get(`/mentor/all?${params.toString()}`);
      setMentors(response.data.data);
    } catch (error) {
      console.error("Error searching mentors:", error);
      setMentors([]);
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
      expertise: "all",
      search: "",
    });
    fetchMentors();
  };

  const getExpertiseList = () => {
    const allExpertise = [];
    mentors.forEach(mentor => {
      if (mentor.expertise) {
        allExpertise.push(...mentor.expertise);
      }
    });
    return [...new Set(allExpertise)];
  };

  const expertiseOptions = getExpertiseList();

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
          onClick={() => navigate("/entrepreneur-dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Mentors</h1>
              <p className="text-gray-600 mt-1">
                Connect with experienced mentors to guide your startup journey
              </p>
            </div>
          </div>
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
              placeholder="Search by mentor name or expertise..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
          >
            Search
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Expertise Area</label>
                <select
                  name="expertise"
                  value={filters.expertise}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Expertise</option>
                  {expertiseOptions.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
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
          Found <span className="font-bold text-gray-900">{mentors.length}</span> mentors
        </p>
      </div>

      {/* Mentors Grid */}
      {mentors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No mentors found</h3>
          <p className="text-gray-600">
            Try adjusting your search or check back later for new mentors
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {mentor.user?.name?.charAt(0) || "M"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{mentor.user?.name}</h3>
                      <p className="text-sm text-gray-500">{mentor.currentRole || "Mentor"}</p>
                      {mentor.company && (
                        <p className="text-xs text-gray-400">{mentor.company}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {renderStars(mentor.rating)}
                    <span className="ml-1 text-sm text-gray-600">({mentor.totalSessions || 0})</span>
                  </div>
                </div>

                {/* Expertise Tags */}
                {mentor.expertise && mentor.expertise.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 3).map((exp) => (
                        <span key={exp} className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">
                          {exp}
                        </span>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{mentor.expertise.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {mentor.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {mentor.bio.substring(0, 100)}...
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{mentor.yearsOfExperience || 0}+ years</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    <span>{mentor.totalSessions || 0} sessions</span>
                  </div>
                  <div className="flex items-center">
                    {mentor.mentoringType === "volunteer" ? (
                      <>
                        <Heart className="h-4 w-4 mr-1 text-green-500" />
                        <span className="text-green-600">Free</span>
                      </>
                    ) : mentor.mentoringType === "paid" ? (
                      <>
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>${mentor.hourlyRate}/hr</span>
                      </>
                    ) : (
                      <span>Free / Paid</span>
                    )}
                  </div>
                </div>

                {/* Availability Badge */}
                <div className="mb-4">
                  {mentor.isAvailable ? (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available for Mentorship
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                      <X className="h-3 w-3 mr-1" />
                      Currently Unavailable
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/entrepreneur/mentor/${mentor.id}`)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Profile</span>
                  </button>
                  {mentor.isAvailable && (
                    <button
                      onClick={() => {
                        const mentorUserId = mentor.user?.id;
                        if (mentorUserId) {
                          navigate(`/entrepreneur/request-mentorship/${mentorUserId}`);
                        } else {
                          console.error("No user ID found for mentor:", mentor);
                        }
                      }}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Request</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindMentors;