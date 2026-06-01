import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import NotificationBell from "../components/common/NotificationBell";
import FloatingAssistant from "../components/FloatingAssistant";
import {
  Briefcase,
  LogOut,
  User,
  Menu,
  X,
  PlusCircle,
  FolderOpen,
  Settings,
  Users,
  Search,
  GraduationCap,
  Shield,
  FileText,
  Clock,
  Heart,
  BookOpen,
  UserCircle,
  MessageCircle,
  Building2,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const userName = user?.name || "";
  const userRole = user?.role || "";

  // Fetch unread message count
  useEffect(() => {
    if (user && userRole !== "admin") {
      const fetchUnreadCount = async () => {
        try {
          const response = await API.get("/chat/unread-count");
          setUnreadCount(response.data.data.unreadCount);
        } catch (error) {
          console.error("Error fetching unread count:", error);
        }
      };
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user, userRole]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-80 transition"
          >
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">FundMate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user && userRole !== "admin" && (
              <Link
                to="/messages"
                className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1 relative"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <>
                {userRole === "entrepreneur" && (
                  <>
                    <Link to="/startup/create">Create Startup</Link>
                    <Link to="/startup/mine">My Startup</Link>
                    <Link to="/entrepreneur/find-mentors">Find Mentors</Link>
                    <Link to="/entrepreneur/mentorship-requests">
                      My Mentorship
                    </Link>
                    <Link to="/investors">Find Investors</Link>
                  </>
                )}

                {userRole === "investor" && (
                  <>
                    <Link
                      to="/investor/preferences"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Preferences</span>
                    </Link>
                    <Link
                      to="/investor/startups"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Search className="h-4 w-4" />
                      <span>Find Startups</span>
                    </Link>
                    <Link
                      to="/investor/nda-requests"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <FileText className="h-4 w-4" />
                      <span>My NDA Requests</span>
                    </Link>
                  </>
                )}

                {userRole === "mentor" && (
                  <>
                    <Link
                      to="/mentor/requests"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Requests</span>
                    </Link>
                    <Link
                      to="/mentor/mentees"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Users className="h-4 w-4" />
                      <span>My Mentees</span>
                    </Link>
                    <Link
                      to="/resources"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Resources</span>
                    </Link>
                    <Link
                      to="/mentor/profile-setup"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <UserCircle className="h-4 w-4" />
                      <span>Profile Setup</span>
                    </Link>
                  </>
                )}

                {userRole === "admin" && (
                  <>
                    <Link
                      to="/admin-dashboard"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/admin/startups"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Startups</span>
                    </Link>
                    <Link
                      to="/admin/ndas"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <FileText className="h-4 w-4" />
                      <span>NDAs</span>
                    </Link>
                    <Link
                      to="/admin/analytics"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Analytics</span>
                    </Link>
                    <Link
                      to="/admin/mentorships"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Mentorships</span>
                    </Link>
                    <Link
                      to="/admin/broadcast"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Broadcast</span>
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                  {/* Notification Bell - Only for non-admin users */}
                  {userRole !== "admin" && <NotificationBell />}

                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {userName || "User"}
                      </p>
                      {userRole && (
                        <p className="text-gray-500 text-xs capitalize">
                          {userRole}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition duration-200"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {userName || "User"}
                    </p>
                    {userRole && (
                      <p className="text-sm text-gray-500 capitalize">
                        {userRole}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  to="/"
                  className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>

                {/* Mobile Messages with Badge - Only for non-admin */}
                {userRole !== "admin" && (
                  <Link
                    to="/messages"
                    className="flex items-center justify-between py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5" />
                      <span>Messages</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                {userRole === "entrepreneur" && (
                  <>
                    <Link
                      to="/startup/create"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Startup
                    </Link>
                    <Link
                      to="/startup/mine"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Startup
                    </Link>

                    <Link
                      to="/investors"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Find Investors
                    </Link>
                  </>
                )}

                {userRole === "investor" && (
                  <>
                    <Link
                      to="/investor/preferences"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Preferences
                    </Link>
                    <Link
                      to="/investor/startups"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Find Startups
                    </Link>
                    <Link
                      to="/investor/nda-requests"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My NDA Requests
                    </Link>
                  </>
                )}

                {userRole === "mentor" && (
                  <>
                    <Link
                      to="/mentor/requests"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Requests
                    </Link>
                    <Link
                      to="/mentor/mentees"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Mentees
                    </Link>
                    <Link
                      to="/mentor/resources"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Resources
                    </Link>
                    <Link
                      to="/mentor/profile-setup"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile Setup
                    </Link>
                  </>
                )}
                {userRole === "admin" && (
                  <>
                    <Link
                      to="/admin-dashboard"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/startups"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Startups
                    </Link>
                    <Link
                      to="/admin/ndas"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      NDAs
                    </Link>
                    <Link
                      to="/admin/analytics"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Analytics
                    </Link>
                    <Link
                      to="/admin/mentorships"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mentorships
                    </Link>
                    <Link
                      to="/admin/broadcast"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Broadcast
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-3 text-red-600 hover:text-red-700 border-t border-gray-100 mt-4"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="block py-3 text-center text-gray-700 hover:text-blue-600 transition duration-200 border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-center hover:from-blue-700 hover:to-indigo-700 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      <FloatingAssistant />
    </nav>
  );
};

export default Navbar;
