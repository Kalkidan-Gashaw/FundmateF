import { Link } from "react-router-dom";
import {
  Rocket,
  Briefcase,
  DollarSign,
  Target,
  CheckCircle,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Calendar,
  MessageSquare,
  Award,
  Globe,
  FileText
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16 md:py-24 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-6">
          <Rocket className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Connect <span className="text-blue-600">Startups</span> with <span className="text-green-600">Investors</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          The perfect platform for entrepreneurs to find funding and for investors to discover the next big thing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-50 transition duration-200 font-medium text-lg"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 px-4">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
          <div className="text-gray-600">Startups</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <div className="text-3xl font-bold text-green-600 mb-2">20+</div>
          <div className="text-gray-600">Investors</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <div className="text-3xl font-bold text-purple-600 mb-2">$50k+</div>
          <div className="text-gray-600">Funds Raised</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <div className="text-3xl font-bold text-yellow-600 mb-2">30+</div>
          <div className="text-gray-600">Successful Matches</div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 mb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Briefcase className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">For Entrepreneurs</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Create startup profile
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Find perfect investors
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Manage connections
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <DollarSign className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">For Investors</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Discover promising startups
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Smart matching algorithm
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Track portfolio
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Target className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Matching</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Industry-specific matching
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Funding stage compatibility
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Success rate tracking
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose FundMate?</h2>
            <p className="text-gray-600 mb-6">
              We provide a secure and efficient platform for connecting startups with the right investors and mentors.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <span>Secure & Verified Profiles</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <span>Smart Matchmaking Algorithm</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                <span>Secure Communication</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <span>Expert Mentorship Program</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl text-center">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-bold text-gray-900">Trusted Platform</p>
            </div>
            <div className="bg-white p-4 rounded-xl text-center">
              <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-gray-900">Global Network</p>
            </div>
            <div className="bg-white p-4 rounded-xl text-center">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-bold text-gray-900">NDA Protection</p>
            </div>
            <div className="bg-white p-4 rounded-xl text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-bold text-gray-900">Schedule Meetings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;