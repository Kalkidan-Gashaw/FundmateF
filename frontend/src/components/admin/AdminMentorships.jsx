import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Search,
  Filter,
  Loader,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Star,
  MessageSquare,
  Clock,
  X,
  TrendingUp,
  Users,
  Award,
  Mail,
  Phone,
  Video,
  ExternalLink,
  Trash2
} from "lucide-react";

const AdminMentorships = () => {
  const navigate = useNavigate();
  const [mentorships, setMentorships] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mentorshipToActOn, setMentorshipToActOn] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
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
    fetchMentorships();
  }, []);

  const checkAdminAccess = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.role !== "admin") {
      navigate("/dashboard");
    }
  };

  const fetchMentorships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      
      const response = await API.get(`/admin/mentorships?${params.toString()}`);
      setMentorships(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching mentorships:", error);
      setMessage({ type: "error", text: "Error loading mentorship data" });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    fetchMentorships();
  };

  const clearFilters = () => {
    setFilters({ status: "all", search: "", startDate: "", endDate: "" });
    setTimeout(() => fetchMentorships(), 100);
  };

  const handleViewDetails = async (mentorship) => {
    setActionLoading(mentorship.id);
    try {
      const response = await API.get(`/admin/mentorships/${mentorship.id}`);
      setSelectedMentorship(response.data.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching mentorship details:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const openStatusModal = (mentorship, status) => {
    setMentorshipToActOn(mentorship);
    setNewStatus(status);
    setAdminNote("");
    setShowStatusModal(true);
  };

  const openDeleteModal = (mentorship) => {
    setMentorshipToActOn(mentorship);
    setShowDeleteModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!mentorshipToActOn) return;
    
    setActionLoading(mentorshipToActOn.id);
    try {
      await API.put(`/admin/mentorships/${mentorshipToActOn.id}/status`, {
        status: newStatus,
        adminNote,
      });
      setMessage({ type: "success", text: `Mentorship status updated to ${newStatus}` });
      setShowStatusModal(false);
      setMentorshipToActOn(null);
      setAdminNote("");
      fetchMentorships();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error updating status" });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!mentorshipToActOn) return;
    
    setActionLoading(mentorshipToActOn.id);
    try {
      await API.delete(`/admin/mentorships/${mentorshipToActOn.id}`);
      setMessage({ type: "success", text: "Mentorship request deleted successfully" });
      setShowDeleteModal(false);
      setMentorshipToActOn(null);
      fetchMentorships();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error deleting mentorship" });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    const icons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      accepted: <CheckCircle className="h-3 w-3 mr-1" />,
      completed: <Award className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
      cancelled: <XCircle className="h-3 w-3 mr-1" />,
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100"}`}>
        {icons[status]}
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleString();
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }
    return stars;
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

  // Status Update Modal
  const StatusUpdateModal = () => {
    if (!showStatusModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Update Status</h3>
            <p className="text-gray-600 text-center mb-4">
              Change status for mentorship between<br />
              <strong>{mentorshipToActOn?.entrepreneur?.name}</strong> and<br />
              <strong>{mentorshipToActOn?.mentor?.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note (Optional)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Add a note explaining the status change..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setMentorshipToActOn(null);
                  setAdminNote("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading === mentorshipToActOn?.id}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {actionLoading === mentorshipToActOn?.id ? <Loader className="h-4 w-4 animate-spin mx-auto" /> : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Mentorship</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this mentorship request?<br />
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMentorshipToActOn(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading === mentorshipToActOn?.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading === mentorshipToActOn?.id ? <Loader className="h-4 w-4 animate-spin mx-auto" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Modals */}
      <StatusUpdateModal />
      <DeleteConfirmationModal />

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
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mentorship Oversight</h1>
              <p className="text-gray-600 mt-1">Monitor and manage all mentorship activities</p>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Requests" value={stats.total || 0} icon={Users} color="bg-blue-600" />
          <StatCard title="Pending" value={stats.pending || 0} icon={Clock} color="bg-yellow-600" />
          <StatCard title="Accepted" value={stats.accepted || 0} icon={CheckCircle} color="bg-blue-600" />
          <StatCard title="Completed" value={stats.completed || 0} icon={Award} color="bg-green-600" />
          <StatCard title="Avg Rating" value={stats.averageRating?.toFixed(1) || 0} icon={Star} color="bg-purple-600" />
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
                    placeholder="Search by name or topic..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

      {/* Mentorships Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : mentorships.length === 0 ? (
            <div className="text-center p-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No mentorship requests found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrepreneur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mentorships.map((mentorship) => (
                  <tr key={mentorship.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{mentorship.entrepreneur?.name}</p>
                          <p className="text-xs text-gray-400">{mentorship.entrepreneur?.startup?.startupName || "No startup"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{mentorship.mentor?.name}</p>
                          <p className="text-xs text-gray-400">{mentorship.mentor?.mentorProfile?.expertise?.slice(0, 2).join(", ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{mentorship.topic}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600 text-sm">{formatDate(mentorship.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {mentorship.scheduledDate ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-green-500" />
                          <span className="text-gray-600 text-sm">{formatDate(mentorship.scheduledDate)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {renderStars(mentorship.rating)}
                        {mentorship.rating && <span className="ml-1 text-xs text-gray-500">({mentorship.rating})</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(mentorship.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(mentorship)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openStatusModal(mentorship, mentorship.status)}
                          className="p-1 text-green-600 hover:text-green-800 transition"
                          title="Update Status"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(mentorship)}
                          className="p-1 text-red-600 hover:text-red-800 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Details Modal */}
      {showDetailsModal && selectedMentorship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Mentorship Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Entrepreneur Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Entrepreneur</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedMentorship.entrepreneur?.name}</p>
                      <p className="text-sm text-gray-500">{selectedMentorship.entrepreneur?.email}</p>
                    </div>
                  </div>
                  {selectedMentorship.entrepreneur?.startup && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Startup: <span className="font-medium text-gray-700">{selectedMentorship.entrepreneur.startup.startupName}</span></p>
                      <p className="text-sm text-gray-500">Sector: <span className="font-medium text-gray-700">{selectedMentorship.entrepreneur.startup.sector}</span></p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mentor Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mentor</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedMentorship.mentor?.name}</p>
                      <p className="text-sm text-gray-500">{selectedMentorship.mentor?.email}</p>
                    </div>
                  </div>
                  {selectedMentorship.mentor?.mentorProfile && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Expertise: <span className="font-medium text-gray-700">{selectedMentorship.mentor.mentorProfile.expertise?.join(", ")}</span></p>
                      <p className="text-sm text-gray-500">Company: <span className="font-medium text-gray-700">{selectedMentorship.mentor.mentorProfile.company || "Not specified"}</span></p>
                      <p className="text-sm text-gray-500">Rating: <span className="font-medium text-gray-700">{selectedMentorship.mentor.mentorProfile.rating} / 5</span></p>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Topic</p>
                    <p className="font-medium text-gray-900">{selectedMentorship.topic}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    {getStatusBadge(selectedMentorship.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Requested Date</p>
                    <p className="text-gray-900">{formatDateTime(selectedMentorship.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Scheduled Date</p>
                    <p className="text-gray-900">{formatDateTime(selectedMentorship.scheduledDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-gray-900">{selectedMentorship.duration} minutes</p>
                  </div>
                  {selectedMentorship.meetingLink && (
                    <div>
                      <p className="text-sm text-gray-500">Meeting Link</p>
                      <a href={selectedMentorship.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        Join Meeting <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              {selectedMentorship.message && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Entrepreneur's Message</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedMentorship.message}</p>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selectedMentorship.feedback && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Feedback / Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMentorship.feedback}</p>
                  </div>
                </div>
              )}

              {/* Rating */}
              {selectedMentorship.rating && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating</h3>
                  <div className="flex items-center">
                    {renderStars(selectedMentorship.rating)}
                    <span className="ml-2 text-gray-700">({selectedMentorship.rating} out of 5)</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openStatusModal(selectedMentorship, selectedMentorship.status);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Status
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openDeleteModal(selectedMentorship);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMentorships;