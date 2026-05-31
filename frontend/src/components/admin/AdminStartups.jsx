import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  Building2,
  Search,
  Filter,
  Loader,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
  User,
  Briefcase,
  Target,
  Calendar,
  X,
  Clock
} from "lucide-react";

const AdminStartups = () => {
  const navigate = useNavigate();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [showStartupModal, setShowStartupModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({
    sector: "all",
    status: "all",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchStartups();
  }, []);

  const checkAdminAccess = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.role !== "admin") {
      navigate("/dashboard");
    }
  };

  const fetchStartups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.sector !== "all") params.append("sector", filters.sector);
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      
      const response = await API.get(`/admin/startups?${params.toString()}`);
      setStartups(response.data.data);
    } catch (error) {
      console.error("Error fetching startups:", error);
      setMessage({ type: "error", text: "Error loading startups" });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    fetchStartups();
  };

  const clearFilters = () => {
    setFilters({ sector: "all", status: "all", search: "" });
    setTimeout(() => fetchStartups(), 100);
  };

  const handleViewStartup = async (startup) => {
    setSelectedStartup(startup);
    setShowStartupModal(true);
  };

  const handleUpdateStartupStatus = async (startupId, status) => {
    setActionLoading(startupId);
    try {
      await API.put(`/admin/startups/${startupId}/status`, { status });
      setMessage({ type: "success", text: `Startup marked as ${status} successfully` });
      fetchStartups();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error updating startup status" });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getStartupStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      under_review: "bg-yellow-100 text-yellow-800",
      funded: "bg-blue-100 text-blue-800",
    };
    const icons = {
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      draft: <Clock className="h-3 w-3 mr-1" />,
      under_review: <AlertTriangle className="h-3 w-3 mr-1" />,
      funded: <DollarSign className="h-3 w-3 mr-1" />,
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100"}`}>
        {icons[status]}
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
      </span>
    );
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
    { value: "other", label: "Other" },
  ];

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "under_review", label: "Under Review" },
    { value: "funded", label: "Funded" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Startup Management</h1>
              <p className="text-gray-600 mt-1">Review and manage all startup profiles</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: <span className="font-bold text-gray-900">{startups.length}</span> startups
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message.type === "success" ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name or description..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sector</label>
                <select
                  name="sector"
                  value={filters.sector}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sectors.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Startups Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : startups.length === 0 ? (
            <div className="text-center p-12">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No startups found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Startup</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Founder</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funding</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {startups.map((startup) => (
                  <tr key={startup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {startup.startupName?.charAt(0) || "S"}
                        </div>
                        <span className="font-medium text-gray-900">{startup.startupName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                          {startup.owner?.name?.charAt(0) || "F"}
                        </div>
                        <span className="text-gray-600">{startup.owner?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{getSectorLabel(startup.sector)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{getFundingStageLabel(startup.fundingStage)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-medium">
                        {startup.fundingRequired ? `$${Number(startup.fundingRequired).toLocaleString()}` : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStartupStatusBadge(startup.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(startup.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewStartup(startup)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {startup.status !== "active" && startup.status !== "funded" && (
                          <button
                            onClick={() => handleUpdateStartupStatus(startup.id, "active")}
                            disabled={actionLoading === startup.id}
                            className="p-1 text-green-600 hover:text-green-800 transition"
                            title="Approve Startup"
                          >
                            {actionLoading === startup.id ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                        )}
                        {startup.status === "active" && (
                          <button
                            onClick={() => handleUpdateStartupStatus(startup.id, "funded")}
                            disabled={actionLoading === startup.id}
                            className="p-1 text-blue-600 hover:text-blue-800 transition"
                            title="Mark as Funded"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStartupStatus(startup.id, "under_review")}
                          disabled={actionLoading === startup.id}
                          className="p-1 text-yellow-600 hover:text-yellow-800 transition"
                          title="Flag for Review"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Startup Details Modal */}
      {showStartupModal && selectedStartup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedStartup.startupName?.charAt(0) || "S"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedStartup.startupName}</h2>
                  <p className="text-sm text-gray-500">Startup Profile</p>
                </div>
              </div>
              <button onClick={() => setShowStartupModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Founder</p>
                    <p className="text-gray-900 font-medium">{selectedStartup.owner?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-400">{selectedStartup.owner?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p>{getStartupStatusBadge(selectedStartup.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sector</p>
                    <p className="text-gray-900">{getSectorLabel(selectedStartup.sector)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Funding Stage</p>
                    <p className="text-gray-900">{getFundingStageLabel(selectedStartup.fundingStage)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Funding Required</p>
                    <p className="text-gray-900 font-medium">
                      {selectedStartup.fundingRequired ? `$${Number(selectedStartup.fundingRequired).toLocaleString()}` : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Team Size</p>
                    <p className="text-gray-900">{selectedStartup.teamSize || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Women Led</p>
                    <p className="text-gray-900">{selectedStartup.isWomenLed ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-gray-900">{new Date(selectedStartup.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedStartup.description || "No description provided"}</p>
                </div>
              </div>

              {/* Website */}
              {selectedStartup.website && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Website</h3>
                  <a 
                    href={selectedStartup.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    {selectedStartup.website}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                {selectedStartup.status !== "active" && selectedStartup.status !== "funded" && (
                  <button
                    onClick={() => {
                      handleUpdateStartupStatus(selectedStartup.id, "active");
                      setShowStartupModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Approve Startup
                  </button>
                )}
                {selectedStartup.status === "active" && (
                  <button
                    onClick={() => {
                      handleUpdateStartupStatus(selectedStartup.id, "funded");
                      setShowStartupModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Mark as Funded
                  </button>
                )}
                <button
                  onClick={() => {
                    handleUpdateStartupStatus(selectedStartup.id, "under_review");
                    setShowStartupModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                  Flag for Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStartups;