import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  User,
  Building2,
  DollarSign,
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
  TrendingUp,
  Heart,
  MapPin
} from "lucide-react";

const InvestorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchInvestorProfile();
    }
  }, [id]);

  const fetchInvestorProfile = async () => {
    setLoading(true);
    try {
      console.log("Fetching investor with ID:", id);
      const response = await API.get(`/entrepreneur/investor/${id}`);
      console.log("Response:", response.data);
      setInvestor(response.data.data);
    } catch (error) {
      console.error("Error fetching investor:", error);
      setError(error.response?.data?.message || "Error loading investor profile");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    navigate(`/messages?userId=${investor.user?.id}&name=${encodeURIComponent(investor.user?.name)}&role=investor`);
  };

  const getInvestorTypeLabel = (type) => {
    const types = {
      angel: "Angel Investor",
      vc: "Venture Capital",
      corporate: "Corporate VC",
      fund: "Investment Fund",
      individual: "Individual Investor"
    };
    return types[type] || type;
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

  const getStageLabel = (stage) => {
    const stages = {
      idea: "Idea Stage",
      prototype: "Prototype / MVP",
      early_revenue: "Early Revenue",
      growth: "Growth",
      expansion: "Expansion"
    };
    return stages[stage] || stage;
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
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !investor) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Investor Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The investor profile you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/investors")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Investors
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
          onClick={() => navigate("/investors")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Investors
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-green-600 to-teal-600"></div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-lg">
              {investor.user?.name?.charAt(0) || "I"}
            </div>
            <div className="md:ml-6 mt-4 md:mt-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{investor.user?.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {getInvestorTypeLabel(investor.investorType)}
                    </span>
                    
                    {investor.isVerified && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleStartChat}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Contact Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                Contact Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{investor.user?.email}</span>
                </div>
                {investor.company && (
                  <div className="flex items-center text-gray-600">
                    <Building2 className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{investor.company}</span>
                  </div>
                )}
                {investor.title && (
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{investor.title}</span>
                  </div>
                )}
                {investor.yearsOfExperience && (
                  <div className="flex items-center text-gray-600">
                    <Award className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{investor.yearsOfExperience} years experience</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                  <span>Member since {investor.createdAt ? new Date(investor.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Investment Preferences */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-gray-500" />
                Investment Preferences
              </h2>
              <div className="space-y-4">
                {investor.investmentRangeMin && investor.investmentRangeMax && (
                  <div>
                    <p className="text-sm text-gray-500">Investment Range</p>
                    <p className="font-medium text-gray-900">
                      ${Number(investor.investmentRangeMin).toLocaleString()} - ${Number(investor.investmentRangeMax).toLocaleString()}
                    </p>
                  </div>
                )}
                {investor.preferredSectors && investor.preferredSectors.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Preferred Sectors</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {investor.preferredSectors.slice(0, 4).map((sector) => (
                        <span key={sector} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {getSectorLabel(sector)}
                        </span>
                      ))}
                      {investor.preferredSectors.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{investor.preferredSectors.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {investor.preferredStages && investor.preferredStages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Preferred Stages</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {investor.preferredStages.map((stage) => (
                        <span key={stage} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {getStageLabel(stage)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        

         

         
        </div>
      </div>
    </div>
  );
};

export default InvestorProfile;