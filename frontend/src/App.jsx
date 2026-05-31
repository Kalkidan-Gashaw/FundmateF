import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./layout/Navbar";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import InvestorPreferences from "./components/investor/InvestorPreferences";
import EntrepreneurDashboard from "./components/EntrepreneurDashboard";
import InvestorDashboard from "./components/investor/InvestorDashboard";
import MentorDashboard from "./components/MentorDashboard";

import CreateStartup from "./components/entrepreneur/CreateStartup";
import EditStartup from "./components/entrepreneur/EditStartup";
import MyStartup from "./components/entrepreneur/MyStartup";
import FindStartups from "./components/investor/FindStartups";
import StartupDetail from "./components/investor/StartupDetail";

import FindInvestors from "./components/entrepreneur/FindInvestors";
import MyNdaRequests from "./components/investor/MyNdaRequests";

import FindMentors from "./components/entrepreneur/FindMentors";
import RequestMentorship from "./components/entrepreneur/RequestMentorship";
import MyMentorshipRequests from "./components/entrepreneur/MyMentorshipRequests";

import MentorProfileSetup from "./components/mentor/MentorProfileSetup";
import PendingRequests from "./components/mentor/PendingRequests";
import MyMentees from "./components/mentor/MyMentees";
import Resources from "./components/mentor/Resources";
import ChatPage from "./components/chat/ChatPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminStartups from "./components/admin/AdminStartups";
import AdminNDAs from "./components/admin/AdminNDAs";
import AdminAnalytics from "./components/admin/AdminAnalytics";
import AdminMentorships from "./components/admin/AdminMentorships";
import AdminBroadcast from "./components/admin/AdminBroadcast";

import NotificationsPage from "./components/common/NotificationsPage";
import AdminSettings from "./components/admin/AdminSettings";
import EntrepreneurNdaRequests from "./components/entrepreneur/EntreprenuerNdaRequests";
import VerifyEmail from "./components/auth/VerifyEmail";

function AppContent() {
  const { user, loading } = useContext(AuthContext);
  const isAuthenticated = !!user;

  const getDashboardByRole = () => {
    if (!user?.role) return "/login";
    switch (user.role) {
      case "entrepreneur":
        return "/entrepreneur-dashboard";
      case "investor":
        return "/investor-dashboard";
      case "mentor":
        return "/mentor-dashboard";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/login";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route
          path="/entrepreneur-dashboard"
          element={
            isAuthenticated && user?.role === "entrepreneur" ? (
              <EntrepreneurDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/investor-dashboard"
          element={
            isAuthenticated && user?.role === "investor" ? (
              <InvestorDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/mentor-dashboard"
          element={
            isAuthenticated && user?.role === "mentor" ? (
              <MentorDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/startup/create"
          element={
            isAuthenticated && user?.role === "entrepreneur" ? (
              <CreateStartup />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardByRole()} />
            ) : (
              <Dashboard />
            )
          }
        />
        <Route
          path="/startup/edit/:id"
          element={
            isAuthenticated && user?.role === "entrepreneur" ? (
              <EditStartup />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/startup/mine"
          element={
            isAuthenticated && user?.role === "entrepreneur" ? (
              <MyStartup />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/investor/preferences"
          element={
            isAuthenticated && user?.role === "investor" ? (
              <InvestorPreferences />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/investor/startups"
          element={
            isAuthenticated && user?.role === "investor" ? (
              <FindStartups />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/investor/startup/:id"
          element={
            isAuthenticated && user?.role === "investor" ? (
              <StartupDetail />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/investor/nda-requests"
          element={
            isAuthenticated && user?.role === "investor" ? (
              <MyNdaRequests />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/investors"
          element={
            isAuthenticated && user?.role === "entrepreneur" ? (
              <FindInvestors />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/entrepreneur/find-mentors"
          element={
            isAuthenticated && user?.role === "entrepreneur" ? (
              <FindMentors />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/entrepreneur/nda-requests"
          element={
            isAuthenticated && user?.role === "entrepreneur" ? (
              <EntrepreneurNdaRequests />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/entrepreneur/request-mentorship/:mentorId"
          element={
            isAuthenticated && user?.role === "entrepreneur" ? (
              <RequestMentorship />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/entrepreneur/mentorship-requests"
          element={
            isAuthenticated && user?.role === "entrepreneur" ? (
              <MyMentorshipRequests />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/mentor/requests"
          element={
            isAuthenticated && user?.role === "mentor" ? (
              <PendingRequests />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/mentor/mentees"
          element={
            isAuthenticated && user?.role === "mentor" ? (
              <MyMentees />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/mentor/resources"
          element={
            isAuthenticated && user?.role === "mentor" ? (
              <Resources />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/mentor/profile-setup"
          element={
            isAuthenticated && user?.role === "mentor" ? (
              <MentorProfileSetup />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/messages"
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/startups"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminStartups />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/ndas"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminNDAs />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin/analytics"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminAnalytics />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/mentorships"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminMentorships />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/broadcast"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminBroadcast />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin/settings"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminSettings />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
