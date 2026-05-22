import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  Briefcase,
  Building2,
  DollarSign,
  Users,
  Globe,
  FileText,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const CreateStartup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingStartup, setExistingStartup] = useState(null);
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

  // Check if user already has a startup
  useEffect(() => {
    const checkExistingStartup = async () => {
      try {
        const response = await API.get("/entrepreneur/startup");
        if (response.data.data) {
          setExistingStartup(response.data.data);
        }
      } catch (error) {
        // 404 means no startup found, that's fine
        if (error.response?.status !== 404) {
          console.error("Error checking startup:", error);
        }
      }
    };
    checkExistingStartup();
  }, []);

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
      const response = await API.post("/entrepreneur/startup", formData);
      setMessage({ type: "success", text: response.data.message });
      setTimeout(() => {
        navigate("/entrepreneur-dashboard");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error creating startup",
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

  if (existingStartup) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You Already Have a Startup
          </h2>
          <p className="text-gray-600 mb-6">
            You have already created a startup profile:{" "}
            {existingStartup.startupName}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/entrepreneur-dashboard")}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate(`/startup/edit/${existingStartup.id}`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Startup
            </button>
          </div>
        </div>
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
            <h1 className="text-3xl font-bold text-gray-900">
              Create Your Startup Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Tell investors about your business
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" && (
              <CheckCircle className="h-5 w-5 mr-2" />
            )}
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
                placeholder="Describe your startup, what problem you solve, your solution, and what makes you unique..."
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
              <span>{loading ? "Creating..." : "Create Startup"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStartup;
