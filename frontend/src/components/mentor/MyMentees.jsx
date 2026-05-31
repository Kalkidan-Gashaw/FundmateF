import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Users,
  Calendar,
  MessageSquare,
  Video,
  Star,
  Loader,
  AlertCircle,
  CheckCircle,
  Mail,
  Clock,
  MessageCircle
} from "lucide-react";

const MyMentees = () => {
  const navigate = useNavigate();
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchMentees();
  }, []);

  const fetchMentees = async () => {
    try {
      const response = await API.get("/mentor/active-mentees");
      setMentees(response.data.data);
    } catch (error) {
      console.error("Error fetching mentees:", error);
      setMessage({ type: "error", text: "Error loading mentees" });
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (entrepreneur) => {
    // Store the selected user in localStorage or state management
    // Then navigate to chat page with the user ID
    navigate(`/messages?userId=${entrepreneur.id}&name=${encodeURIComponent(entrepreneur.name)}&role=${entrepreneur.role}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      );
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

  return (
    <div className="max-w-5xl mx-auto">
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
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Mentees</h1>
            <p className="text-gray-600 mt-1">
              Manage your active mentorship relationships
            </p>
          </div>
        </div>
      </div>

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

      {mentees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Mentees Yet</h3>
          <p className="text-gray-600">
            You haven't accepted any mentorship requests yet. Check your pending requests.
          </p>
          <button
            onClick={() => navigate("/mentor/pending-requests")}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            View Pending Requests
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {mentees.map((mentee) => (
            <div key={mentee.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {mentee.entrepreneur?.name?.charAt(0) || "E"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{mentee.entrepreneur?.name}</h3>
                      <p className="text-sm text-gray-500">{mentee.entrepreneur?.email}</p>
                      {mentee.entrepreneur?.startup && (
                        <p className="text-sm text-purple-600 mt-1">
                          {mentee.entrepreneur.startup.startupName} • {mentee.entrepreneur.startup.sector}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {renderStars(mentee.rating || 0)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Started: {new Date(mentee.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{mentee.duration} min sessions</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Topic: {mentee.topic}</span>
                  </div>
                </div>

                {mentee.scheduledDate && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center text-green-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">Next Session: {new Date(mentee.scheduledDate).toLocaleString()}</span>
                    </div>
                    {mentee.meetingLink && (
                      <a
                        href={mentee.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 mt-2 hover:underline"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleStartChat(mentee.entrepreneur)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Send Message</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule Session</span>
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

export default MyMentees;