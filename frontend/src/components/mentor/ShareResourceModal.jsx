import { useState, useEffect } from "react";
import { X, Upload, Loader, CheckCircle, AlertCircle, Users } from "lucide-react";
import API from "../../services/api";

const ShareResourceModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "document",
    category: "",
    description: "",
    url: "",
    duration: "",
    menteeId: "",
  });
  const [mentees, setMentees] = useState([]);
  const [loadingMentees, setLoadingMentees] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const categories = [
    "Pitching", "Strategy", "Fundraising", "Research", "Finance", "Product", "Marketing", "Sales", "Operations", "Legal"
  ];

  useEffect(() => {
    if (isOpen) {
      fetchMentees();
    }
  }, [isOpen]);

  const fetchMentees = async () => {
    setLoadingMentees(true);
    try {
      const response = await API.get("/mentor/active-mentees");
      setMentees(response.data.data || []);
    } catch (error) {
      console.error("Error fetching mentees:", error);
    } finally {
      setLoadingMentees(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.url.trim() || !formData.category) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    if (!formData.menteeId) {
      setMessage({ type: "error", text: "Please select a mentee to share with" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await API.post("/resources", formData);
      setMessage({ type: "success", text: response.data.message });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error sharing resource",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Upload className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Share a Resource</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg flex items-center ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {message.type === "success" ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">Share with Mentee *</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="menteeId"
                value={formData.menteeId}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                <option value="">Select a mentee...</option>
                {loadingMentees ? (
                  <option disabled>Loading mentees...</option>
                ) : mentees.length === 0 ? (
                  <option disabled>No active mentees found</option>
                ) : (
                  mentees.map((mentee) => (
                    <option key={mentee.id} value={mentee.entrepreneur?.id}>
                      {mentee.entrepreneur?.name} - {mentee.topic}
                    </option>
                  ))
                )}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The resource will appear in your chat with this mentee.
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Resource title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe what this resource contains..."
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">URL/Link *</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://..."
            />
          </div>

          {formData.type === "video" && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 30 min, 1 hour"
              />
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
            >
              {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              <span>{loading ? "Sharing..." : "Share Resource"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareResourceModal;