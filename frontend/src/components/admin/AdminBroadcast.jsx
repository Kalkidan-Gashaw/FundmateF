import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Send,
  Calendar,
  Users,
  Loader,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  Clock,
  Mail,
  Plus,
  X,
  MessageCircle,
  User
} from "lucide-react";

// Move SendModal outside as a separate component
const SendModal = ({ isOpen, onClose, onSend, loading }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [scheduledFor, setScheduledFor] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !message.trim()) return;
    onSend({ title, message, targetRole, scheduledFor });
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setTargetRole("all");
    setScheduledFor("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Send Broadcast Message</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Important Platform Update"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="entrepreneur">Entrepreneurs Only</option>
              <option value="investor">Investors Only</option>
              <option value="mentor">Mentors Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="8"
              placeholder="Type your broadcast message here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            <p className="text-xs text-gray-500 mt-1">{message.length} characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !message.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{scheduledFor ? "Schedule Broadcast" : "Send Now"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal - separate component
const DeleteModal = ({ isOpen, onClose, onConfirm, broadcast, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Broadcast</h3>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete "{broadcast?.title}"?<br />
            This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin mx-auto" /> : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminBroadcast = () => {
  const navigate = useNavigate();
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    checkAdminAccess();
    fetchBroadcasts();
  }, []);

  const checkAdminAccess = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.role !== "admin") {
      navigate("/dashboard");
    }
  };

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin/broadcasts");
      setBroadcasts(response.data.data);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      setMessage({ type: "error", text: "Error loading broadcasts" });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (data) => {
    setSending(true);
    try {
      const response = await API.post("/admin/broadcasts", data);
      setMessage({ type: "success", text: response.data.message });
      setShowSendModal(false);
      fetchBroadcasts();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error sending broadcast" });
    } finally {
      setSending(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!selectedBroadcast) return;

    setDeleting(true);
    try {
      await API.delete(`/admin/broadcasts/${selectedBroadcast.id}`);
      setMessage({ type: "success", text: "Broadcast deleted successfully" });
      setShowDeleteModal(false);
      setSelectedBroadcast(null);
      fetchBroadcasts();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error deleting broadcast" });
    } finally {
      setDeleting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const openDeleteModal = (broadcast) => {
    setSelectedBroadcast(broadcast);
    setShowDeleteModal(true);
  };

  const getTargetRoleLabel = (role) => {
    switch (role) {
      case "all": return "All Users";
      case "entrepreneur": return "Entrepreneurs Only";
      case "investor": return "Investors Only";
      case "mentor": return "Mentors Only";
      default: return role;
    }
  };

  const getStatusBadge = (broadcast) => {
    if (broadcast.status === "sent") {
      return { text: "Sent", color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> };
    }
    return { text: "Scheduled", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3 mr-1" /> };
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SendModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSend={handleSend}
        loading={sending}
      />
      
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBroadcast(null);
        }}
        onConfirm={handleDelete}
        broadcast={selectedBroadcast}
        loading={deleting}
      />

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
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Broadcast Messages</h1>
              <p className="text-gray-600 mt-1">Send announcements to all users or specific roles</p>
            </div>
          </div>
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Broadcast</span>
          </button>
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

      {/* Broadcasts List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-xl font-bold text-white flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Message History
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center p-12">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No broadcast messages sent yet</p>
              <button
                onClick={() => setShowSendModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Send Your First Broadcast
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {broadcasts.map((broadcast) => {
                const status = getStatusBadge(broadcast);
                return (
                  <div key={broadcast.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{broadcast.title}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.icon}
                            {status.text}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3 whitespace-pre-wrap">{broadcast.message}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{getTargetRoleLabel(broadcast.targetRole)}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            <span>Sent to {broadcast.recipientCount} recipients</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{formatDate(broadcast.sentAt || broadcast.scheduledFor || broadcast.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>By: {broadcast.sender?.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openDeleteModal(broadcast)}
                          className="p-1 text-red-600 hover:text-red-800 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcast;