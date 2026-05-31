import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import { 
  Briefcase, 
  Building2, 
  DollarSign, 
  Users, 
  FileText,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Loader
} from "lucide-react";

const EditStartup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    startupName: "",
    sector: "technology",
    fundingStage: "idea",
    fundingRequired: "",
    description: "",
    teamSize: "",
    isWomenLed: false,
    website: "",
  });

  // Fetch startup data
  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const response = await API.get("/entrepreneur/startup");
        if (response.data.data) {
          const startup = response.data.data;
          setFormData({
            startupName: startup.startupName || "",
            sector: startup.sector || "technology",
            fundingStage: startup.fundingStage || "idea",
            fundingRequired: startup.fundingRequired || "",
            description: startup.description || "",
            teamSize: startup.teamSize || "",
            isWomenLed: startup.isWomenLed || false,
            website: startup.website || "",
          });
        }
      } catch (error) {
        if (error.response?.status === 404) {
          navigate("/startup/create");
        } else {
          setMessage({ type: "error", text: "Error fetching startup data" });
        }
      } finally {
        setFetching(false);
      }
    };
    fetchStartup();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await API.put(`/entrepreneur/startup/${id}`, formData);
      setMessage({ type: "success", text: response.data.message });
      setTimeout(() => {
        navigate("/entrepreneur-dashboard");
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Error updating startup" 
      });
    } finally {
      setLoading(false);
    }
  };

  const sectors = [
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "agriculture", label: "Agriculture" },
    { value: "ecommerce", label: "E-Commerce" },
    { value: "clean_energy", label: "Clean Energy" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "transportation", label: "Transportation" },
    { value: "other", label: "Other" },
  ];

  const fundingStages = [
    { value: "idea", label: "Idea Stage" },
    { value: "prototype", label: "Prototype / MVP" },
    { value: "early_revenue", label: "Early Revenue" },
    { value: "growth", label: "Growth" },
    { value: "expansion", label: "Expansion" },
  ];

  if (fetching) {
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
          onClick={() => navigate("/entrepreneur-dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Startup Profile</h1>
            <p className="text-gray-600 mt-1">Update your business information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === "success" 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.type === "success" && <CheckCircle className="h-5 w-5 mr-2" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Startup Name *
                </label>
                <input
                  type="text"
                  name="startupName"
                  value={formData.startupName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your startup name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourstartup.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Sector *
                </label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sectors.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Funding Stage *
                </label>
                <select
                  name="fundingStage"
                  value={formData.fundingStage}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fundingStages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Funding Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              Funding Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Funding Required (USD)
                </label>
                <input
                  type="number"
                  name="fundingRequired"
                  value={formData.fundingRequired}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50000"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Team Size
                </label>
                <input
                  type="number"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Number of team members"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-purple-600 mr-2" />
              About Your Startup
            </h2>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your startup..."
              />
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 text-yellow-600 mr-2" />
              Additional Information
            </h2>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isWomenLed"
                checked={formData.isWomenLed}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-gray-700">
                This startup is women-led / women-founded
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? "Updating..." : "Update Startup"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStartup;