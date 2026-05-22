import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Send,
  Calendar,
  Clock,
  MessageSquare,
  Target,
  Loader,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  Star,
  Award
} from "lucide-react";

const RequestMentorship = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    topic: "",
    message: "",
    preferredDate: "",
    duration: 60,
  });

  useEffect(() => {
    fetchMentorDetails();
  }, [mentorId]);

  const fetchMentorDetails = async () => {
    try {
      // Fetch mentor by user ID (since mentorId is the user ID now)
      const response = await API.get(`/mentor/user/${mentorId}`);
      setMentor(response.data.data);
    } catch (error) {
      console.error("Error fetching mentor:", error);
      setMessage({ type: "error", text: "Error loading mentor details" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await API.post("/mentor/request", {
        mentorId: mentorId, // This is the user ID
        topic: formData.topic,
        message: formData.message,
        preferredDate: formData.preferredDate,
        duration: formData.duration,
      });

      setMessage({ type: "success", text: response.data.message });
      setTimeout(() => {
        navigate("/entrepreneur/mentorship-requests");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error sending request",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentor Not Found</h2>
          <button
            onClick={() => navigate("/entrepreneur/find-mentors")}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Browse Mentors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/entrepreneur/find-mentors")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Mentors
        </button>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Request Mentorship</h1>
            <p className="text-gray-600 mt-1">
              Send a mentorship request to {mentor.user?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Mentor Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {mentor.user?.name?.charAt(0) || "M"}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{mentor.user?.name}</h2>
            <p className="text-gray-500">{mentor.currentRole || "Mentor"}</p>
            {mentor.company && <p className="text-sm text-gray-400">{mentor.company}</p>}
            <div className="flex items-center mt-1">
              {renderStars(mentor.rating)}
              <span className="ml-2 text-sm text-gray-500">
                {mentor.totalSessions || 0} sessions completed
              </span>
            </div>
          </div>
          <div className="text-right">
            {mentor.mentoringType === "volunteer" ? (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Free Mentorship
              </span>
            ) : mentor.mentoringType === "paid" ? (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                ${mentor.hourlyRate}/hour
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                Free / Paid
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              What would you like mentorship on? *
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Fundraising Strategy, Product Market Fit, Team Building"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Message to Mentor *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={`Hello ${mentor.user?.name},

I'm interested in getting mentorship on ${formData.topic || "my startup"}. 

Please tell me more about your experience and availability.

Best regards,`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Preferred Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="datetime-local"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Duration (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
            >
              {submitting ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span>{submitting ? "Sending..." : "Send Request"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestMentorship;