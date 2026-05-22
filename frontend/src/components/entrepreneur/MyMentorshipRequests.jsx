import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MessageSquare,
  Loader,
  AlertCircle,
  Eye,
  User
} from "lucide-react";

const MyMentorshipRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await API.get("/mentor/my-requests");
      setRequests(response.data.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setMessage({ type: "error", text: "Error loading your requests" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return { icon: <Clock className="h-4 w-4" />, text: "Pending", color: "bg-yellow-100 text-yellow-800" };
      case "accepted":
        return { icon: <CheckCircle className="h-4 w-4" />, text: "Accepted", color: "bg-green-100 text-green-800" };
      case "rejected":
        return { icon: <XCircle className="h-4 w-4" />, text: "Rejected", color: "bg-red-100 text-red-800" };
      case "completed":
        return { icon: <CheckCircle className="h-4 w-4" />, text: "Completed", color: "bg-blue-100 text-blue-800" };
      default:
        return { icon: <Clock className="h-4 w-4" />, text: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/entrepreneur-dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Mentorship Requests</h1>
            <p className="text-gray-600 mt-1">
              Track your mentorship requests
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
            <MessageSquare className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Mentorship Requests</h3>
          <p className="text-gray-600">
            You haven't sent any mentorship requests yet.
          </p>
          <button
            onClick={() => navigate("/entrepreneur/find-mentors")}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Find Mentors
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const status = getStatusBadge(request.status);
            return (
              <div key={request.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {request.mentor?.name?.charAt(0) || "M"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{request.mentor?.name}</h3>
                        <p className="text-sm text-gray-500">Mentor</p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                      {status.icon}
                      <span>{status.text}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Topic:</p>
                    <p className="font-medium text-gray-900">{request.topic}</p>
                  </div>

                  {request.message && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Your Message:</p>
                      <p className="text-gray-700">{request.message}</p>
                    </div>
                  )}

                  {request.preferredDate && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Preferred: {new Date(request.preferredDate).toLocaleString()}</span>
                    </div>
                  )}

                  {request.scheduledDate && (
                    <div className="flex items-center text-sm text-green-600 mb-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Scheduled: {new Date(request.scheduledDate).toLocaleString()}</span>
                    </div>
                  )}

                  {request.meetingLink && (
                    <div className="mt-3">
                      <a
                        href={request.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Join Meeting
                      </a>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => navigate(`/entrepreneur/mentor/${request.mentorId}`)}
                      className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Mentor Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyMentorshipRequests;