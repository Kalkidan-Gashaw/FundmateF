import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  User,
  Building2,
  Briefcase,
  Award,
  Calendar,
  Mail,
  MessageCircle,
  Shield,
  Star,
  Loader,
  AlertCircle,
  CheckCircle,
  Target,
  Clock,
  Heart,
  GraduationCap
} from "lucide-react";

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMentorProfile();
    }
  }, [id]);

  const fetchMentorProfile = async () => {
    setLoading(true);
    try {
      console.log("Fetching mentor with ID:", id);
      const response = await API.get(`/mentor/${id}`);
      console.log("Response:", response.data);
      setMentor(response.data.data);
    } catch (error) {
      console.error("Error fetching mentor:", error);
      setError(error.response?.data?.message || "Error loading mentor profile");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = () => {
    const mentorUserId = mentor.user?.id;
    if (mentorUserId) {
      navigate(`/entrepreneur/request-mentorship/${mentorUserId}`);
    } else {
      console.error("No user ID found for mentor:", mentor);
    }
  };

  const handleStartChat = () => {
    navigate(`/messages?userId=${mentor.user?.id}&name=${encodeURIComponent(mentor.user?.name)}&role=mentor`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
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

  if (error || !mentor) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentor Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The mentor profile you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/entrepreneur/find-mentors")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Mentors
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
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-lg">
              {mentor.user?.name?.charAt(0) || "M"}
            </div>
            <div className="md:ml-6 mt-4 md:mt-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{mentor.user?.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      Mentor
                    </span>
                    <div className="flex items-center">
                      {renderStars(mentor.rating)}
                      <span className="ml-1 text-sm text-gray-500">
                        ({mentor.totalSessions || 0} sessions)
                      </span>
                    </div>
                    {mentor.isAvailable && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Available
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleStartChat}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Message</span>
                  </button>
                  <button
                    onClick={handleRequestMentorship}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Request Mentorship</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Professional Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                Professional Information
              </h2>
              <div className="space-y-3">
                {mentor.currentRole && (
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{mentor.currentRole}</span>
                  </div>
                )}
                {mentor.company && (
                  <div className="flex items-center text-gray-600">
                    <Building2 className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{mentor.company}</span>
                  </div>
                )}
                {mentor.yearsOfExperience && (
                  <div className="flex items-center text-gray-600">
                    <Award className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{mentor.yearsOfExperience} years of experience</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                  <span>Member since {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Expertise */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-gray-500" />
                Expertise Areas
              </h2>
              {mentor.expertise && mentor.expertise.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((exp) => (
                    <span key={exp} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                      {exp}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No expertise areas specified</p>
              )}
            </div>
          </div>

          {/* Bio */}
          {mentor.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-gray-500" />
                About
              </h2>
              <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
            </div>
          )}

          {/* Mentoring Details */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-gray-500" />
              Mentoring Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Mentoring Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {mentor.mentoringType === "volunteer" ? "Free" : 
                   mentor.mentoringType === "paid" ? `$${mentor.hourlyRate}/hour` : 
                   "Free / Paid"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="font-medium text-gray-900">{mentor.totalSessions || 0}</p>
              </div>
            </div>
          </div>

          {/* Connect Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Ready to start learning?</h3>
                  <p className="text-sm text-gray-600">Request mentorship to get guidance from this expert</p>
                </div>
                <button
                  onClick={handleRequestMentorship}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <Heart className="h-4 w-4" />
                  <span>Request Mentorship</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;