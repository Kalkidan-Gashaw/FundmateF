import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MessageSquare,
  Loader,
  AlertCircle,
  User,
  Briefcase,
  Send,
  Video,
  MessageCircle
} from "lucide-react";

const PendingRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await API.get("/mentor/pending-requests");
      setRequests(response.data.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setMessage({ type: "error", text: "Error loading requests" });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setProcessingId(requestId);
    try {
      const response = await API.put(`/mentor/accept/${requestId}`, {
        scheduledDate,
        meetingLink,
      });
      setMessage({ type: "success", text: response.data.message });
      setSelectedRequest(null);
      setScheduledDate("");
      setMeetingLink("");
      fetchRequests();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error accepting request" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      const response = await API.put(`/mentor/reject/${requestId}`, {
        rejectionReason: "Unfortunately, I'm unable to take on this mentorship at this time.",
      });
      setMessage({ type: "success", text: response.data.message });
      fetchRequests();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error rejecting request" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleStartChat = (entrepreneur) => {
    navigate(`/messages?userId=${entrepreneur.id}&name=${encodeURIComponent(entrepreneur.name)}&role=${entrepreneur.role}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/mentor-dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Requests</h1>
            <p className="text-gray-600 mt-1">
              Review and respond to mentorship requests
            </p>
          </div>
        </div>
      </div>

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

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Clock className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">
            You don't have any pending mentorship requests at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {request.entrepreneur?.name?.charAt(0) || "E"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{request.entrepreneur?.name}</h3>
                      <p className="text-sm text-gray-500">Entrepreneur</p>
                      {request.entrepreneur?.startup && (
                        <p className="text-xs text-gray-400">
                          {request.entrepreneur.startup.startupName} • {request.entrepreneur.startup.sector}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-500">Topic:</p>
                  <p className="font-medium text-gray-900">{request.topic}</p>
                </div>

                {request.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Message from entrepreneur:</p>
                    <p className="text-gray-700">{request.message}</p>
                  </div>
                )}

                {request.preferredDate && (
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Preferred: {new Date(request.preferredDate).toLocaleString()}</span>
                  </div>
                )}

                {/* Chat Button for Pending Requests */}
                <div className="mb-4">
                  <button
                    onClick={() => handleStartChat(request.entrepreneur)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Message Entrepreneur</span>
                  </button>
                </div>

                {selectedRequest === request.id ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Schedule Date & Time</label>
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Meeting Link (Zoom/Google Meet)</label>
                      <input
                        type="url"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAccept(request.id)}
                        disabled={processingId === request.id}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        {processingId === request.id ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        <span>Confirm & Accept</span>
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(null);
                          setScheduledDate("");
                          setMeetingLink("");
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => setSelectedRequest(request.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Accept & Schedule</span>
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRequests;