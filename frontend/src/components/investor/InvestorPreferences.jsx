import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Briefcase,
  MapPin,
  Building2,
  FileText,
  TrendingUp,
  Users,
  Loader
} from "lucide-react";

const InvestorPreferences = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState(null);
  const [hasPreferences, setHasPreferences] = useState(false);
  
  const [formData, setFormData] = useState({
    investorType: "angel",
    investmentRangeMin: "",
    investmentRangeMax: "",
    preferredSectors: [],
    preferredStages: [],
    preferredLocations: [],
    investmentThesis: "",
    company: "",
    title: "",
    yearsOfExperience: "",
  });

  // Fetch existing preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await API.get("/investor/preferences");
        if (response.data.data) {
          const prefs = response.data.data;
          setFormData({
            investorType: prefs.investorType || "angel",
            investmentRangeMin: prefs.investmentRangeMin || "",
            investmentRangeMax: prefs.investmentRangeMax || "",
            preferredSectors: prefs.preferredSectors || [],
            preferredStages: prefs.preferredStages || [],
            preferredLocations: prefs.preferredLocations || [],
            investmentThesis: prefs.investmentThesis || "",
            company: prefs.company || "",
            title: prefs.title || "",
            yearsOfExperience: prefs.yearsOfExperience || "",
          });
          setHasPreferences(true);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error fetching preferences:", error);
        }
      } finally {
        setFetching(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (name === "preferredSectors") {
        const newValue = checked 
          ? [...formData.preferredSectors, value]
          : formData.preferredSectors.filter(item => item !== value);
        setFormData({ ...formData, [name]: newValue });
      } else if (name === "preferredStages") {
        const newValue = checked 
          ? [...formData.preferredStages, value]
          : formData.preferredStages.filter(item => item !== value);
        setFormData({ ...formData, [name]: newValue });
      } else if (name === "preferredLocations") {
        const newValue = checked 
          ? [...formData.preferredLocations, value]
          : formData.preferredLocations.filter(item => item !== value);
        setFormData({ ...formData, [name]: newValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await API.post("/investor/preferences", formData);
      setMessage({ type: "success", text: response.data.message });
      setHasPreferences(true);
      setTimeout(() => {
        navigate("/investor-dashboard");
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Error saving preferences" 
      });
    } finally {
      setLoading(false);
    }
  };

  const investorTypes = [
    { value: "angel", label: "Angel Investor" },
    { value: "vc", label: "Venture Capital" },
    { value: "corporate", label: "Corporate VC" },
    { value: "fund", label: "Investment Fund" },
    { value: "individual", label: "Individual Investor" },
  ];

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
  ];

  const stages = [
    { value: "idea", label: "Idea Stage" },
    { value: "prototype", label: "Prototype / MVP" },
    { value: "early_revenue", label: "Early Revenue" },
    { value: "growth", label: "Growth" },
    { value: "expansion", label: "Expansion" },
  ];

  const locations = [
    { value: "north_america", label: "North America" },
    { value: "europe", label: "Europe" },
    { value: "asia", label: "Asia" },
    { value: "africa", label: "Africa" },
    { value: "south_america", label: "South America" },
    { value: "australia", label: "Australia" },
  ];

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
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
          <div className="p-3 bg-green-100 rounded-xl">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investment Preferences</h1>
            <p className="text-gray-600 mt-1">
              {hasPreferences ? "Update your investment criteria" : "Set up your investment criteria"}
            </p>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Investor Type */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 text-green-600 mr-2" />
              Investor Type
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {investorTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, investorType: type.value })}
                  className={`p-3 rounded-xl border transition ${
                    formData.investorType === type.value
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Investment Range */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              Investment Range (USD)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1">Minimum</label>
                <input
                  type="number"
                  name="investmentRangeMin"
                  value={formData.investmentRangeMin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 10000"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Maximum</label>
                <input
                  type="number"
                  name="investmentRangeMax"
                  value={formData.investmentRangeMax}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 500000"
                />
              </div>
            </div>
          </div>

          {/* Preferred Sectors */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 text-green-600 mr-2" />
              Preferred Sectors
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sectors.map((sector) => (
                <label key={sector.value} className="flex items-center space-x-2 p-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferredSectors"
                    value={sector.value}
                    checked={formData.preferredSectors.includes(sector.value)}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-gray-700">{sector.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Stages */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Preferred Funding Stages
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stages.map((stage) => (
                <label key={stage.value} className="flex items-center space-x-2 p-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferredStages"
                    value={stage.value}
                    checked={formData.preferredStages.includes(stage.value)}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-gray-700">{stage.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Locations */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              Preferred Locations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {locations.map((location) => (
                <label key={location.value} className="flex items-center space-x-2 p-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferredLocations"
                    value={location.value}
                    checked={formData.preferredLocations.includes(location.value)}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-gray-700">{location.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1">Company/Firm</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Title/Position</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Managing Partner"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Years in investing"
                />
              </div>
            </div>
          </div>

          {/* Investment Thesis */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-green-600 mr-2" />
              Investment Thesis
            </h2>
            <textarea
              name="investmentThesis"
              value={formData.investmentThesis}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe your investment philosophy, what you look for in startups, and your value-add as an investor..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-teal-700 transition disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? "Saving..." : hasPreferences ? "Update Preferences" : "Save Preferences"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestorPreferences;