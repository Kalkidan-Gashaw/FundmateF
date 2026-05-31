import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Briefcase,
  TrendingUp,
  Shield,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Ban,
  RefreshCw,
  Trash2,
  Clock,
  Award,
  Mail,
  Calendar
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    search: "",
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [userToActOn, setUserToActOn] = useState(null);
  const [userToMessage, setUserToMessage] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
    fetchUsers();
  }, []);

  const checkAdminAccess = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.role !== "admin") {
      navigate("/dashboard");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get("/admin/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.role !== "all") params.append("role", filters.role);
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      
      const response = await API.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage({ type: "error", text: "Error loading users" });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    fetchUsers();
  };

  const clearFilters = () => {
    setFilters({ role: "all", status: "all", search: "" });
    setTimeout(() => fetchUsers(), 100);
  };

  const handleViewUser = async (user) => {
    setActionLoading(user.id);
    try {
      const response = await API.get(`/admin/users/${user.id}`);
      setSelectedUser(response.data.data);
      setShowUserModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveUser = async (userId) => {
    setActionLoading(userId);
    try {
      await API.put(`/admin/users/${userId}/approve`);
      setMessage({ type: "success", text: "User approved successfully" });
      fetchUsers();
      fetchStats();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error approving user" });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const confirmSuspend = (user) => {
    setUserToActOn(user);
    setShowSuspendModal(true);
  };

  const confirmReactivate = (user) => {
    setUserToActOn(user);
    setShowReactivateModal(true);
  };

  const confirmDelete = (user) => {
    setUserToActOn(user);
    setShowDeleteModal(true);
  };

  const handleMessageUser = (user) => {
    setUserToMessage(user);
    setMessageText("");
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !userToMessage) return;
    
    setSendingMessage(true);
    try {
      await API.post("/chat/send", {
        receiverId: userToMessage.id,
        message: messageText,
      });
      setMessage({ type: "success", text: `Message sent to ${userToMessage.name}` });
      setShowMessageModal(false);
      setUserToMessage(null);
      setMessageText("");
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error sending message" });
    } finally {
      setSendingMessage(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSuspendUser = async () => {
    if (!userToActOn) return;
    
    setActionLoading(userToActOn.id);
    try {
      await API.put(`/admin/users/${userToActOn.id}/suspend`);
      setMessage({ type: "success", text: "User suspended successfully" });
      fetchUsers();
      fetchStats();
      setShowSuspendModal(false);
      setUserToActOn(null);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error suspending user" });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReactivateUser = async () => {
    if (!userToActOn) return;
    
    setActionLoading(userToActOn.id);
    try {
      await API.put(`/admin/users/${userToActOn.id}/reactivate`);
      setMessage({ type: "success", text: "User reactivated successfully" });
      fetchUsers();
      fetchStats();
      setShowReactivateModal(false);
      setUserToActOn(null);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error reactivating user" });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToActOn) return;
    
    setActionLoading(userToActOn.id);
    try {
      await API.delete(`/admin/users/${userToActOn.id}`);
      setMessage({ type: "success", text: "User deleted successfully" });
      fetchUsers();
      fetchStats();
      setShowDeleteModal(false);
      setUserToActOn(null);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error deleting user" });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      entrepreneur: "bg-blue-100 text-blue-800",
      investor: "bg-green-100 text-green-800",
      mentor: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    };
    const labels = {
      entrepreneur: "Entrepreneur",
      investor: "Investor",
      mentor: "Mentor",
      admin: "Admin",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || "bg-gray-100 text-gray-800"}`}>
        {labels[role] || role}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
    };
    const icons = {
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      suspended: <XCircle className="h-3 w-3 mr-1" />,
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100"}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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

  // Confirmation Modals
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete User</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <strong>{userToActOn?.name}</strong>?<br />
              This action cannot be undone. All associated data will be permanently removed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToActOn(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading === userToActOn?.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading === userToActOn?.id ? <Loader className="h-4 w-4 animate-spin mx-auto" /> : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SuspendConfirmationModal = () => {
    if (!showSuspendModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Ban className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Suspend User</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to suspend <strong>{userToActOn?.name}</strong>?<br />
              They will not be able to access their account until reactivated.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setUserToActOn(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendUser}
                disabled={actionLoading === userToActOn?.id}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
              >
                {actionLoading === userToActOn?.id ? <Loader className="h-4 w-4 animate-spin mx-auto" /> : "Suspend User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ReactivateConfirmationModal = () => {
    if (!showReactivateModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Reactivate User</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to reactivate <strong>{userToActOn?.name}</strong>?<br />
              They will regain full access to their account.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowReactivateModal(false);
                  setUserToActOn(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReactivateUser}
                disabled={actionLoading === userToActOn?.id}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {actionLoading === userToActOn?.id ? <Loader className="h-4 w-4 animate-spin mx-auto" /> : "Reactivate User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Message User Modal
  const MessageUserModal = () => {
    if (!showMessageModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Send Message to {userToMessage?.name}</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              This message will be sent directly to the user's chat inbox.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Type your message here..."
                autoFocus
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setUserToMessage(null);
                  setMessageText("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendingMessage}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {sendingMessage ? <Loader className="h-4 w-4 animate-spin mx-auto" /> : "Send Message"}
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
      <DeleteConfirmationModal />
      <SuspendConfirmationModal />
      <ReactivateConfirmationModal />
      <MessageUserModal />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-xl">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users, monitor platform activity</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total Users" value={stats.users?.total || 0} icon={Users} color="bg-blue-600" />
          <StatCard title="Entrepreneurs" value={stats.users?.entrepreneurs || 0} icon={Briefcase} color="bg-blue-600" />
          <StatCard title="Investors" value={stats.users?.investors || 0} icon={TrendingUp} color="bg-green-600" />
          <StatCard title="Mentors" value={stats.users?.mentors || 0} icon={Award} color="bg-purple-600" />
          <StatCard title="Pending" value={stats.users?.pending || 0} icon={UserPlus} color="bg-yellow-600" />
          <StatCard title="Suspended" value={stats.users?.suspended || 0} icon={UserX} color="bg-red-600" />
        </div>
      )}

      {/* User Management Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-600 to-pink-600">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </h2>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Role</label>
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Roles</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="investor">Investor</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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

        {/* Users Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader className="h-8 w-8 animate-spin text-red-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMessageUser(user)}
                          className="p-1 text-purple-600 hover:text-purple-800 transition"
                          title="Send Message"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        {user.status === "pending" && (
                          <button
                            onClick={() => handleApproveUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-1 text-green-600 hover:text-green-800 transition"
                            title="Approve"
                          >
                            {actionLoading === user.id ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                        )}
                        {user.status !== "suspended" && user.role !== "admin" && user.status !== "pending" && (
                          <button
                            onClick={() => confirmSuspend(user)}
                            disabled={actionLoading === user.id}
                            className="p-1 text-yellow-600 hover:text-yellow-800 transition"
                            title="Suspend"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        {user.status === "suspended" && (
                          <button
                            onClick={() => confirmReactivate(user)}
                            disabled={actionLoading === user.id}
                            className="p-1 text-green-600 hover:text-green-800 transition"
                            title="Reactivate"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        {user.role !== "admin" && (
                          <button
                            onClick={() => confirmDelete(user)}
                            disabled={actionLoading === user.id}
                            className="p-1 text-red-600 hover:text-red-800 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedUser.user.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedUser.user.name}</h2>
                  <p className="text-sm text-gray-500">{selectedUser.user.email}</p>
                </div>
              </div>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p>{getRoleBadge(selectedUser.user.role)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p>{getStatusBadge(selectedUser.user.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-900">{new Date(selectedUser.user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-gray-900">{new Date(selectedUser.user.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Profile Details based on role */}
              {selectedUser.profile && selectedUser.user.role === "investor" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Investor Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Investor Type</p>
                      <p className="text-gray-900 capitalize">{selectedUser.profile.investorType || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Investment Range</p>
                      <p className="text-gray-900">
                        {selectedUser.profile.investmentRangeMin && selectedUser.profile.investmentRangeMax
                          ? `$${selectedUser.profile.investmentRangeMin} - $${selectedUser.profile.investmentRangeMax}`
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="text-gray-900">{selectedUser.profile.company || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Title</p>
                      <p className="text-gray-900">{selectedUser.profile.title || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.profile && selectedUser.user.role === "mentor" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mentor Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Expertise</p>
                      <p className="text-gray-900">{selectedUser.profile.expertise?.join(", ") || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Years of Experience</p>
                      <p className="text-gray-900">{selectedUser.profile.yearsOfExperience || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="text-gray-900">{selectedUser.profile.company || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mentoring Type</p>
                      <p className="text-gray-900 capitalize">{selectedUser.profile.mentoringType || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.profile && selectedUser.user.role === "entrepreneur" && selectedUser.profile.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Startups</h3>
                  {selectedUser.profile.map((startup, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 mb-2">
                      <p className="font-medium text-gray-900">{startup.startupName}</p>
                      <p className="text-sm text-gray-500">{startup.sector} • {startup.fundingStage}</p>
                      <p className="text-sm text-gray-500">Funding Required: ${startup.fundingRequired?.toLocaleString() || "Not specified"}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* NDAs */}
              {selectedUser.ndas && selectedUser.ndas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Signed NDAs</h3>
                  {selectedUser.ndas.map((nda, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 mb-2">
                      <p className="font-medium text-gray-900">{nda.ndaStartup?.startupName || "Unknown Startup"}</p>
                      <p className="text-sm text-gray-500">Signed: {new Date(nda.signedAt).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Expires: {nda.expiresAt ? new Date(nda.expiresAt).toLocaleDateString() : "Never"}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                {selectedUser.user.status === "pending" && (
                  <button
                    onClick={() => {
                      handleApproveUser(selectedUser.user.id);
                      setShowUserModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Approve User
                  </button>
                )}
                {selectedUser.user.status !== "suspended" && selectedUser.user.role !== "admin" && selectedUser.user.status !== "pending" && (
                  <button
                    onClick={() => {
                      confirmSuspend(selectedUser.user);
                      setShowUserModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    Suspend User
                  </button>
                )}
                {selectedUser.user.status === "suspended" && (
                  <button
                    onClick={() => {
                      confirmReactivate(selectedUser.user);
                      setShowUserModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Reactivate User
                  </button>
                )}
                {selectedUser.user.role !== "admin" && (
                  <button
                    onClick={() => {
                      confirmDelete(selectedUser.user);
                      setShowUserModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete User
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

export default AdminDashboard;