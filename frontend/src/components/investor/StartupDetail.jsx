import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import SignNDAModal from "./SignalNDAModal";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Users,
  Target,
  FileText,
  Mail,
  CheckCircle,
  Lock,
  AlertCircle,
  Loader,
  Eye,
  Star,
  Shield,
  Briefcase
} from "lucide-react";

const StartupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);
  const [hasNDA, setHasNDA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [signingNDA, setSigningNDA] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchStartupDetails();
    checkNdaStatus();
  }, [id]);

  const fetchStartupDetails = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/investor/startups/${id}`);
      setStartup(response.data.data);
      if (response.data.message) {
        setMessage({ type: "info", text: response.data.message });
      }
    } catch (error) {
      console.error("Error fetching startup:", error);
      setMessage({ type: "error", text: "Error loading startup details" });
    } finally {
      setLoading(false);
    }
  };

  const checkNdaStatus = async () => {
    try {
      const response = await API.get(`/nda/check/${id}`);
      setHasNDA(response.data.hasAccess);
    } catch (error) {
      console.error("Error checking NDA status:", error);
    }
  };

  const handleSignNDA = async () => {
  setSigningNDA(true);
  try {
    const response = await API.post("/nda/sign", { startupId: id }); // Make sure id is correct
    setHasNDA(true);
    setMessage({ type: "success", text: response.data.message });
    await fetchStartupDetails();
    setShowNDAModal(false);
  } catch (error) {
    console.error("Error signing NDA:", error.response?.data || error);
    setMessage({
      type: "error",
      text: error.response?.data?.message || "Error signing NDA",
    });
  } finally {
    setSigningNDA(false);
  }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Startup Not Found</h2>
          <button
            onClick={() => navigate("/investor/startups")}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* NDA Modal */}
      <SignNDAModal
        isOpen={showNDAModal}
        onClose={() => setShowNDAModal(false)}
        onSign={handleSignNDA}
        signing={signingNDA}
        startupName={startup.startupName}
      />

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/investor/startups")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Search
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{startup.startupName}</h1>
              <p className="text-gray-600 mt-1">
                {getSectorLabel(startup.sector)} • {getFundingStageLabel(startup.fundingStage)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : message.type === "info"
            ? "bg-blue-50 text-blue-800 border border-blue-200"
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message.type === "success" && <CheckCircle className="h-5 w-5 mr-2" />}
          {message.type === "info" && <Eye className="h-5 w-5 mr-2" />}
          {message.text}
        </div>
      )}

      {/* NDA Banner - Show if not signed */}
      {!hasNDA && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start space-x-3">
              <Lock className="h-6 w-6 text-yellow-600 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900">NDA Required for Full Details</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Sign an NDA to view the complete business description, financial details, and founder contact information.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNDAModal(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              <Shield className="h-4 w-4" />
              <span>Sign NDA to View Full Details</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info - Always Visible */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
              Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Sector</p>
                <p className="font-medium text-gray-900">{getSectorLabel(startup.sector)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Funding Stage</p>
                <p className="font-medium text-gray-900">{getFundingStageLabel(startup.fundingStage)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Funding Required</p>
                <p className="font-medium text-gray-900">
                  {startup.fundingRequired ? `$${Number(startup.fundingRequired).toLocaleString()}` : "Not specified"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Team Size</p>
                <p className="font-medium text-gray-900">{startup.teamSize || "Not specified"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Women Led</p>
                <p className="font-medium text-gray-900">{startup.isWomenLed ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>

          {/* Description - Only visible with NDA */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-purple-600 mr-2" />
              About the Business
              {!hasNDA && (
                <span className="ml-2 text-xs text-gray-400 flex items-center">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked - Sign NDA to Read
                </span>
              )}
            </h2>
            {hasNDA ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{startup.description}</p>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <Lock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Full description is confidential</p>
                <p className="text-sm text-gray-400 mt-1">Sign the NDA to read the complete business description</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Founder Contact - Only with NDA */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              Founder
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {startup.User?.name?.charAt(0) || "F"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{startup.User?.name}</p>
                  <p className="text-sm text-gray-500">Founder</p>
                </div>
              </div>
              {hasNDA ? (
                <div className="flex items-center text-gray-600 pt-2 border-t border-gray-100 mt-2">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{startup.User?.email}</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400 pt-2 border-t border-gray-100 mt-2">
                  <Lock className="h-4 w-4 mr-2" />
                  <span className="text-sm">Sign NDA to view contact</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {hasNDA ? (
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  <Mail className="h-4 w-4" />
                  <span>Contact Founder</span>
                </button>
              ) : (
                <button 
                  onClick={() => setShowNDAModal(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Shield className="h-4 w-4" />
                  <span>Sign NDA to Contact</span>
                </button>
              )}
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <Star className="h-4 w-4" />
                <span>Save to Portfolio</span>
              </button>
            </div>
          </div>

          {/* NDA Status Card */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <Shield className="h-5 w-5 text-gray-600 mr-2" />
              NDA Status
            </h3>
            {hasNDA ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Signed and Active</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <Lock className="h-5 w-5 mr-2" />
                <span>Not Signed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupDetail;