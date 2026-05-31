import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  FileText,
  Search,
  Filter,
  Loader,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  Building2,
  User,
  Clock,
  ArrowLeft,
  AlertTriangle,
  X
} from "lucide-react";

const AdminNDAs = () => {
  const navigate = useNavigate();
  const [ndas, setNdas] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNda, setSelectedNda] = useState(null);
  const [showNdaModal, setShowNdaModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [ndaToRevoke, setNdaToRevoke] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
    fetchNDAs();
  }, []);

  const checkAdminAccess = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.role !== "admin") {
      navigate("/dashboard");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get("/admin/ndas/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching NDA stats:", error);
    }
  };

  const fetchNDAs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      
      const response = await API.get(`/admin/ndas?${params.toString()}`);
      setNdas(response.data.data);
    } catch (error) {
      console.error("Error fetching NDAs:", error);
      setMessage({ type: "error", text: "Error loading NDAs" });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    fetchNDAs();
  };

  const clearFilters = () => {
    setFilters({ status: "all", search: "", startDate: "", endDate: "" });
    setTimeout(() => fetchNDAs(), 100);
  };

  const handleViewNDA = async (nda) => {
    setActionLoading(nda.id);
    try {
      const response = await API.get(`/admin/ndas/${nda.id}`);
      setSelectedNda(response.data.data);
      setShowNdaModal(true);
    } catch (error) {
      console.error("Error fetching NDA details:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const openRevokeModal = (nda) => {
    console.log("Opening revoke modal for:", nda);
    setNdaToRevoke(nda);
    setShowRevokeModal(true);
  };

  const closeRevokeModal = () => {
    setShowRevokeModal(false);
    setNdaToRevoke(null);
  };

  const handleRevokeNDA = async () => {
    if (!ndaToRevoke) return;
    
    console.log("Revoking NDA:", ndaToRevoke.id);
    setActionLoading(ndaToRevoke.id);
    try {
      await API.put(`/admin/ndas/${ndaToRevoke.id}/revoke`);
      setMessage({ type: "success", text: "NDA revoked successfully" });
      closeRevokeModal();
      fetchNDAs();
      fetchStats();
    } catch (error) {
      console.error("Error revoking NDA:", error);
      setMessage({ type: "error", text: error.response?.data?.message || "Error revoking NDA" });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getStatusBadge = (nda) => {
    const isExpired = nda.expiresAt && new Date(nda.expiresAt) < new Date();
    const isRevoked = nda.status === "revoked";
    
    if (isRevoked) {
      return { text: "Revoked", color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" /> };
    }
    if (isExpired) {
      return { text: "Expired", color: "bg-gray-100 text-gray-800", icon: <Clock className="h-3 w-3 mr-1" /> };
    }
    return { text: "Active", color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> };
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Revoke Confirmation Modal Component
  const RevokeConfirmationModal = () => {
    if (!showRevokeModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Revoke NDA</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to revoke this NDA between<br />
              <strong className="text-gray-900">{ndaToRevoke?.investor?.name}</strong> and<br />
              <strong className="text-gray-900">{ndaToRevoke?.ndaStartup?.startupName}</strong>?<br />
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={closeRevokeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeNDA}
                disabled={actionLoading === ndaToRevoke?.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading === ndaToRevoke?.id ? <Loader className="h-4 w-4 animate-spin mx-auto" /> : "Revoke NDA"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Revoke Confirmation Modal */}
      <RevokeConfirmationModal />

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
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NDA Monitoring</h1>
              <p className="text-gray-600 mt-1">Track and manage all Non-Disclosure Agreements</p>
            </div>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total NDAs" value={stats.total || 0} icon={FileText} color="bg-purple-600" />
          <StatCard title="Active NDAs" value={stats.active || 0} icon={CheckCircle} color="bg-green-600" />
          <StatCard title="Expired NDAs" value={stats.expired || 0} icon={Clock} color="bg-gray-600" />
          <StatCard title="Revoked NDAs" value={stats.revoked || 0} icon={XCircle} color="bg-red-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by startup or investor..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="signed">Active</option>
                  <option value="expired">Expired</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
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

      {/* NDAs Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : ndas.length === 0 ? (
            <div className="text-center p-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No NDAs found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Startup</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Founder</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signed Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ndas.map((nda) => {
                  const status = getStatusBadge(nda);
                  return (
                    <tr key={nda.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{nda.investor?.name}</p>
                            <p className="text-xs text-gray-400">{nda.investor?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-900">{nda.ndaStartup?.startupName || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{nda.ndaStartup?.owner?.name || "Unknown"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600 text-sm">{formatDate(nda.signedAt)}</span>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600 text-sm">{formatDate(nda.expiresAt)}</span>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon}
                          {status.text}
                        </span>
                       </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewNDA(nda)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {status.text === "Active" && (
                            <button
                              onClick={() => openRevokeModal(nda)}
                              className="p-1 text-red-600 hover:text-red-800 transition"
                              title="Revoke NDA"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* NDA Details Modal */}
      {showNdaModal && selectedNda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">NDA Details</h2>
              <button onClick={() => setShowNdaModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Investor</p>
                  <p className="font-medium text-gray-900">{selectedNda.investor?.name}</p>
                  <p className="text-sm text-gray-500">{selectedNda.investor?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Startup</p>
                  <p className="font-medium text-gray-900">{selectedNda.ndaStartup?.startupName}</p>
                  <p className="text-sm text-gray-500">Founder: {selectedNda.ndaStartup?.owner?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Signed Date</p>
                  <p className="text-gray-900">{formatDate(selectedNda.signedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiration Date</p>
                  <p className="text-gray-900">{formatDate(selectedNda.expiresAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">IP Address</p>
                  <p className="text-gray-900">{selectedNda.ipAddress || "Not recorded"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User Agent</p>
                  <p className="text-gray-900 text-xs truncate">{selectedNda.userAgent || "Not recorded"}</p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                {getStatusBadge(selectedNda).text === "Active" && (
                  <button
                    onClick={() => {
                      setShowNdaModal(false);
                      openRevokeModal(selectedNda);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Revoke NDA
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNDAs;