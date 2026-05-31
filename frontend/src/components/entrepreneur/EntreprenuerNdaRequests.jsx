import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Send,
  Loader,
  AlertCircle,
  Mail,
  Building2,
  Calendar,
  User,
  FileText
} from "lucide-react";

const EntrepreneurNdaRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [startup, setStartup] = useState(null);

  useEffect(() => {
    fetchStartupAndRequests();
  }, []);

  const fetchStartupAndRequests = async () => {
    setLoading(true);
    try {
      // Get entrepreneur's startup
      const startupRes = await API.get("/entrepreneur/startup");
      if (startupRes.data.data) {
        setStartup(startupRes.data.data);
      }

      // Get NDA requests for entrepreneur's startup
      const requestsRes = await API.get("/nda/entrepreneur/requests");
      setRequests(requestsRes.data.data);
    } catch (error) {
      if (error.response?.status === 404) {
        navigate("/startup/create");
      } else {
        console.error("Error fetching requests:", error);
        setMessage({ type: "error", text: "Error loading requests" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ndaId) => {
    setProcessingId(ndaId);
    try {
      const response = await API.put(`/nda/entrepreneur/approve/${ndaId}`, {
        responseMessage: responseMessage || "Your request has been approved. Please sign the NDA to view confidential information.",
      });
      setMessage({ type: "success", text: response.data.message });
      setSelectedRequest(null);
      setResponseMessage("");
      fetchStartupAndRequests();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error approving request" });
    } finally {
      setProcessingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReject = async (ndaId) => {
    setProcessingId(ndaId);
    try {
      const response = await API.put(`/nda/entrepreneur/reject/${ndaId}`, {
        responseMessage: responseMessage || "We regret to inform you that your request has been declined at this time.",
      });
      setMessage({ type: "success", text: response.data.message });
      setSelectedRequest(null);
      setResponseMessage("");
      fetchStartupAndRequests();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error rejecting request" });
    } finally {
      setProcessingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center"><Clock className="h-3 w-3 mr-1" />Pending</span>;
      case "approved":
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center"><CheckCircle className="h-3 w-3 mr-1" />Approved</span>;
      case "signed":
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center"><Shield className="h-3 w-3 mr-1" />NDA Signed</span>;
      case "rejected":
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center"><XCircle className="h-3 w-3 mr-1" />Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === "pending");
  const allRequests = requests;

  return (
    <div className="max-w-5xl mx-auto">
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
          <div className="p-3 bg-blue-100 rounded-xl">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NDA Access Requests</h1>
            <p className="text-gray-600 mt-1">
              Manage investor requests to access your startup's confidential information
            </p>
          </div>
        </div>
      </div>

      {/* Startup Info Banner */}
      {startup && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Your Startup</p>
              <p className="font-semibold text-gray-900">{startup.startupName}</p>
            </div>
          </div>
        </div>
      )}

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Requests</p>
              <p className="text-3xl font-bold text-blue-600">{allRequests.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setRequests(allRequests);
          }}
          className="pb-3 px-4 font-medium text-blue-600 border-b-2 border-blue-600"
        >
          All Requests ({allRequests.length})
        </button>
      </div>

      {/* Requests List */}
      {allRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Shield className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No NDA Requests</h3>
          <p className="text-gray-600">
            No investors have requested access to your confidential information yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {request.investor?.name?.charAt(0) || "I"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{request.investor?.name}</h3>
                      <p className="text-sm text-gray-500">{request.investor?.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Requested on {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {/* Request Message */}
                {request.requestMessage && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Investor's Message:
                    </p>
                    <p className="text-gray-700">{request.requestMessage}</p>
                  </div>
                )}

                {/* Your Response (if any) */}
                {request.startupResponseMessage && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1 flex items-center">
                      <Send className="h-4 w-4 mr-1" />
                      Your Response:
                    </p>
                    <p className="text-gray-700">{request.startupResponseMessage}</p>
                  </div>
                )}

                {/* Action Buttons for Pending Requests */}
                {request.status === "pending" && (
                  <div className="mt-4">
                    {selectedRequest === request.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Response Message (Optional)
                          </label>
                          <textarea
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add a message for the investor..."
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {processingId === request.id ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            <span>Approve & Send NDA</span>
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {processingId === request.id ? <Loader className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(null);
                              setResponseMessage("");
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setSelectedRequest(request.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Review Request</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Signed NDA Info */}
                {request.status === "signed" && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center text-green-600">
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        NDA signed on {new Date(request.signedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {request.expiresAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(request.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">About NDA Requests</h3>
            <p className="text-sm text-gray-600 mt-1">
              When an investor requests access to your confidential information:
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• You can review their request and reason for access</li>
              <li>• Approve or reject based on your discretion</li>
              <li>• Once approved, the investor must sign an NDA</li>
              <li>• After signing, they can view full details</li>
              <li>• All signed NDAs are legally binding and tracked</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurNdaRequests;