import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Briefcase, LogOut, User, Menu, X, LayoutDashboard, PlusCircle, FolderOpen, Inbox, Settings, Users, Search, GraduationCap, Shield } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userName = user?.name || "";
  const userRole = user?.role || "";

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">FundMate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                {/* <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link> */}
                
                {userRole === "entrepreneur" && (
                  <>
                    <Link
                      to="/startup/create"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Create Startup</span>
                    </Link>
                    <Link
                      to="/startup/mine"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span>My Startup</span>
                    </Link>
                    <Link
                      to="/connections/incoming"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Inbox className="h-4 w-4" />
                      <span>Requests</span>
                    </Link>
                    <Link
                      to="/investors"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Users className="h-4 w-4" />
                      <span>Find Investors</span>
                    </Link>
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
                      to="/investor/matches"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Search className="h-4 w-4" />
                      <span>Find Startups</span>
                    </Link>
                  </>
                )}
                
                {userRole === "mentor" && (
                  <>
                    <Link
                      to="/mentor/requests"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Inbox className="h-4 w-4" />
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
                      to="/mentor/resources"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>Resources</span>
                    </Link>
                  </>
                )}
                
                {userRole === "admin" && (
                  <>
                    <Link
                      to="/admin/users"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </Link>
                    <Link
                      to="/admin/reports"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Reports</span>
                    </Link>
                  </>
                )}
                
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{userName || "User"}</p>
                      {userRole && (
                        <p className="text-gray-500 text-xs capitalize">{userRole}</p>
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
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                    <p className="font-medium text-gray-900">{userName || "User"}</p>
                    {userRole && (
                      <p className="text-sm text-gray-500 capitalize">{userRole}</p>
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
                      to="/connections/incoming"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Requests
                    </Link>
                    <Link
                      to="/investor-dashboard"
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
                      to="/investor/matches"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Find Startups
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
                  </>
                )}
                
                {userRole === "admin" && (
                  <>
                    <Link
                      to="/admin/users"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Users
                    </Link>
                    <Link
                      to="/admin/reports"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Reports
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
    </nav>
  );
};

export default Navbar;