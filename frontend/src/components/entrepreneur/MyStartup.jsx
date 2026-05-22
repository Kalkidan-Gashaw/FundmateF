import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { 
  ArrowLeft,
  Building2,
  DollarSign,
  Users,
  Globe,
  FileText,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  TrendingUp,
  Target,
  Briefcase
} from "lucide-react";

const MyStartup = () => {
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const response = await API.get("/entrepreneur/startup");
        setStartup(response.data.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setError("You haven't created a startup profile yet");
        } else {
          setError("Error fetching startup data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStartup();
  }, []);

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      under_review: { label: "Under Review", className: "bg-yellow-100 text-yellow-800" },
      funded: { label: "Funded", className: "bg-blue-100 text-blue-800" }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Startup Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/startup/create")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Your Startup
          </button>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{startup.startupName}</h1>
              <p className="text-gray-600 mt-1">Your startup profile</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/startup/edit/${startup.id}`)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span className="text-gray-600">Status:</span>
          <span className="ml-2">{getStatusBadge(startup.status)}</span>
        </div>
        <div className="text-sm text-gray-500">
          Created {new Date(startup.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              About
            </h2>
            <p className="text-gray-700 leading-relaxed">{startup.description}</p>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 text-purple-600 mr-2" />
              Business Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Website</p>
                {startup.website ? (
                  <a 
                    href={startup.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {startup.website}
                  </a>
                ) : (
                  <p className="font-medium text-gray-900">Not specified</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Profile Views</span>
                <span className="font-bold text-xl text-gray-900">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Investor Matches</span>
                <span className="font-bold text-xl text-gray-900">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Connection Requests</span>
                <span className="font-bold text-xl text-gray-900">5</span>
              </div>
            </div>
          </div>

          {/* Contact Info (from user) */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              Founder Contact
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-700">{startup.User?.email || "Not available"}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Next Steps</h2>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Profile created
              </li>
              <li className="flex items-center text-sm text-gray-700">
                {startup.description ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                )}
                Add detailed description
              </li>
              <li className="flex items-center text-sm text-gray-700">
                {startup.website ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                )}
                Add your website
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                Upload pitch deck
              </li>
            </ul>
            <button
              onClick={() => navigate(`/startup/edit/${startup.id}`)}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Complete Your Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStartup;