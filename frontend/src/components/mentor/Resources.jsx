import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  Eye,
  Heart,
  TrendingUp,
  Upload,
  Search,
  Filter,
  X
} from "lucide-react";

const Resources = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const resources = [
    {
      id: 1,
      title: "Startup Pitch Deck Template",
      type: "document",
      category: "Pitching",
      description: "A comprehensive pitch deck template for early-stage startups",
      downloads: 245,
      views: 1234,
      author: "FundMate Team",
      url: "#"
    },
    {
      id: 2,
      title: "Business Model Canvas Guide",
      type: "document",
      category: "Strategy",
      description: "Step-by-step guide to creating your business model canvas",
      downloads: 189,
      views: 892,
      author: "FundMate Team",
      url: "#"
    },
    {
      id: 3,
      title: "Fundraising Strategy Workshop",
      type: "video",
      category: "Fundraising",
      description: "Learn how to raise capital from angels and VCs",
      duration: "45 min",
      views: 2341,
      author: "John Smith",
      url: "#"
    },
    {
      id: 4,
      title: "Market Research Template",
      type: "document",
      category: "Research",
      description: "Template for conducting market research",
      downloads: 156,
      views: 567,
      author: "FundMate Team",
      url: "#"
    },
    {
      id: 5,
      title: "Financial Projections Template",
      type: "document",
      category: "Finance",
      description: "Excel template for financial projections",
      downloads: 234,
      views: 789,
      author: "FundMate Team",
      url: "#"
    },
    {
      id: 6,
      title: "Customer Discovery Interview Guide",
      type: "video",
      category: "Product",
      description: "How to conduct effective customer interviews",
      duration: "30 min",
      views: 456,
      author: "Sarah Johnson",
      url: "#"
    }
  ];

  const categories = ["all", "Pitching", "Strategy", "Fundraising", "Research", "Finance", "Product"];

  const filteredResources = resources.filter(resource => {
    const matchesTab = activeTab === "all" || resource.category === activeTab;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTypeIcon = (type) => {
    if (type === "document") return <FileText className="h-5 w-5 text-blue-600" />;
    if (type === "video") return <Video className="h-5 w-5 text-purple-600" />;
    return <LinkIcon className="h-5 w-5 text-green-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/mentor-dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mentorship Resources</h1>
              <p className="text-gray-600 mt-1">
                Share and access resources to help entrepreneurs grow
              </p>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            <Upload className="h-4 w-4" />
            <span>Share Resource</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === category
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">
            Try adjusting your search or check back later for new resources.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getTypeIcon(resource.type)}
                  </div>
                  <span className="text-xs text-gray-400">{resource.category}</span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {resource.views} views
                  </div>
                  {resource.downloads && (
                    <div className="flex items-center">
                      <Download className="h-3 w-3 mr-1" />
                      {resource.downloads} downloads
                    </div>
                  )}
                  {resource.duration && (
                    <div className="flex items-center">
                      <Video className="h-3 w-3 mr-1" />
                      {resource.duration}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                    <Heart className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popular Resources Section */}
      <div className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
          Most Popular Resources
        </h2>
        <div className="space-y-3">
          {resources.slice(0, 3).map((resource) => (
            <div key={resource.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center space-x-3">
                {getTypeIcon(resource.type)}
                <div>
                  <p className="font-medium text-gray-900">{resource.title}</p>
                  <p className="text-xs text-gray-500">{resource.category}</p>
                </div>
              </div>
              <button className="text-purple-600 hover:text-purple-700 text-sm">View →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;