import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Eye,
  Loader,
  AlertCircle,
  Building2,
  Calendar
} from "lucide-react";

const MyNdaRequests = () => {
  const navigate = useNavigate();
  const [ndas, setNdas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSignedNDAs();
  }, []);

  const fetchSignedNDAs = async () => {
    setLoading(true);
    try {
      const response = await API.get("/nda/my-ndas");
      console.log("Signed NDAs:", response.data.data); // Debug log
      const mappedNdas = response.data.data.map((nda) => ({
        ...nda,
        startup: nda.ndaStartup || null,
      }));
      setNdas(mappedNdas);
    } catch (error) {
      console.error("Error fetching NDAs:", error);
      setMessage({ type: "error", text: "Error loading your NDAs" });
    } finally {
      setLoading(false);
    }
  };

  const handleViewStartup = async (nda) => {
    // First verify NDA is still valid
    try {
      const checkResponse = await API.get(`/nda/check/${nda.startupId}`);
      if (checkResponse.data.hasAccess) {
        navigate(`/investor/startup/${nda.startupId}`);
      } else {
        setMessage({ type: "error", text: "NDA access expired or invalid" });
        fetchSignedNDAs(); // Refresh list
      }
    } catch (error) {
      console.error("Error checking NDA status:", error);
      navigate(`/investor/startup/${nda.startupId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/investor-dashboard")}
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
            <h1 className="text-3xl font-bold text-gray-900">My Signed NDAs</h1>
            <p className="text-gray-600 mt-1">
              Startups you have signed NDAs with
            </p>
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

      {/* NDAs List */}
      {ndas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Shield className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Signed NDAs Yet</h3>
          <p className="text-gray-600">
            You haven't signed any NDAs yet. Browse startups and sign an NDA to view confidential information.
          </p>
          <button
            onClick={() => navigate("/investor/startups")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Startups
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {ndas.map((nda) => (
            <div
              key={nda.id}
              className="bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden hover:shadow-xl transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {nda.startup?.startupName?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {nda.startup?.startupName || "Unknown Startup"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {nda.startup?.sector || "No sector specified"}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Signed on {new Date(nda.signedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <Shield className="h-3 w-3 mr-1" />
                    <span>Active NDA</span>
                  </div>
                </div>

                {nda.expiresAt && (
                  <div className="mb-4 text-sm text-gray-500">
                    Expires: {new Date(nda.expiresAt).toLocaleDateString()}
                  </div>
                )}

                <div className="mt-4">
                  <button
                    onClick={() => handleViewStartup(nda)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Startup Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNdaRequests;