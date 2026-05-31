import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Save,
  User,
  Briefcase,
  Award,
  Clock,
  DollarSign,
  Heart,
  Loader,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  GraduationCap,
  BookOpen,
  Users
} from "lucide-react";

const MentorProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState(null);
  const [newExpertise, setNewExpertise] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  
  const [formData, setFormData] = useState({
    expertise: [],
    industry: [],
    bio: "",
    yearsOfExperience: "",
    currentRole: "",
    company: "",
    isAvailable: true,
    hourlyRate: "",
    mentoringType: "volunteer",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await API.get("/mentor/profile");
      if (response.data.data) {
        const profile = response.data.data;
        setFormData({
          expertise: profile.expertise || [],
          industry: profile.industry || [],
          bio: profile.bio || "",
          yearsOfExperience: profile.yearsOfExperience || "",
          currentRole: profile.currentRole || "",
          company: profile.company || "",
          isAvailable: profile.isAvailable !== undefined ? profile.isAvailable : true,
          hourlyRate: profile.hourlyRate || "",
          mentoringType: profile.mentoringType || "volunteer",
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error fetching profile:", error);
      }
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, newExpertise.trim()],
      });
      setNewExpertise("");
    }
  };

  const removeExpertise = (exp) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter(e => e !== exp),
    });
  };

  const addIndustry = () => {
    if (newIndustry.trim() && !formData.industry.includes(newIndustry.trim())) {
      setFormData({
        ...formData,
        industry: [...formData.industry, newIndustry.trim()],
      });
      setNewIndustry("");
    }
  };

  const removeIndustry = (ind) => {
    setFormData({
      ...formData,
      industry: formData.industry.filter(i => i !== ind),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await API.post("/mentor/profile", formData);
      setMessage({ type: "success", text: response.data.message });
      setTimeout(() => {
        navigate("/mentor-dashboard");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error saving profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const expertiseSuggestions = [
    "Business Strategy", "Fundraising", "Marketing", "Product Development",
    "Sales", "Operations", "Legal", "Finance", "HR", "Technology",
    "Pitch Deck Review", "Market Research", "Growth Hacking", "Branding",
    "Leadership", "Team Building", "Customer Discovery", "MVP Development"
  ];

  const industrySuggestions = [
    "Technology", "Healthcare", "Finance", "Education", "E-commerce",
    "SaaS", "AI/ML", "Blockchain", "CleanTech", "AgriTech",
    "EdTech", "FinTech", "HealthTech", "Real Estate", "Transportation"
  ];

  if (fetching) {
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
          onClick={() => navigate("/mentor-dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <GraduationCap className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentor Profile Setup</h1>
            <p className="text-gray-600 mt-1">
              Set up your mentor profile to start helping entrepreneurs
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
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 text-purple-600 mr-2" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Current Role / Title
                </label>
                <input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Senior Product Manager"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Company / Organization
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Google, Microsoft, or Your Own Startup"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Number of years"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Bio / About You
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell entrepreneurs about your background, expertise, and how you can help them..."
            />
          </div>

          {/* Expertise Areas */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Expertise Areas
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.expertise.map((exp) => (
                <span key={exp} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {exp}
                  <button type="button" onClick={() => removeExpertise(exp)} className="ml-2 hover:text-purple-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newExpertise}
                onChange={(e) => setNewExpertise(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addExpertise()}
                placeholder="Add expertise (e.g., Fundraising, Marketing)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="button" onClick={addExpertise} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {expertiseSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (!formData.expertise.includes(suggestion)) {
                      setFormData({
                        ...formData,
                        expertise: [...formData.expertise, suggestion],
                      });
                    }
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Industry Focus */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Industry Focus
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.industry.map((ind) => (
                <span key={ind} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {ind}
                  <button type="button" onClick={() => removeIndustry(ind)} className="ml-2 hover:text-blue-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addIndustry()}
                placeholder="Add industry (e.g., Technology, Healthcare)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="button" onClick={addIndustry} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {industrySuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (!formData.industry.includes(suggestion)) {
                      setFormData({
                        ...formData,
                        industry: [...formData.industry, suggestion],
                      });
                    }
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Mentoring Preferences */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 text-purple-600 mr-2" />
              Mentoring Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mentoring Type
                </label>
                <select
                  name="mentoringType"
                  value={formData.mentoringType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="volunteer">Volunteer (Free)</option>
                  <option value="paid">Paid</option>
                  <option value="both">Both (Free & Paid)</option>
                </select>
              </div>
              {formData.mentoringType !== "volunteer" && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Hourly Rate (USD)
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 50"
                  />
                </div>
              )}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label className="text-gray-700">Available for mentorship requests</label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorProfileSetup;