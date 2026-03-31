import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./layout/Navbar";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import EntrepreneurDashboard from "./components/EntrepreneurDashboard";
import InvestorDashboard from "./components/InvestorDashboard";
import MentorDashboard from "./components/MentorDashboard";
import AdminDashboard from "./components/AdminDashboard";

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
        <Route path="/entrepreneur-dashboard" element={
          isAuthenticated && user?.role === "entrepreneur" ? <EntrepreneurDashboard /> : <Navigate to="/login" />
        } />
        <Route path="/investor-dashboard" element={
          isAuthenticated && user?.role === "investor" ? <InvestorDashboard /> : <Navigate to="/login" />
        } />
        <Route path="/mentor-dashboard" element={
          isAuthenticated && user?.role === "mentor" ? <MentorDashboard /> : <Navigate to="/login" />
        } />
        <Route path="/admin-dashboard" element={
          isAuthenticated && user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />
        } />
        <Route path="/" element={
          isAuthenticated ? <Navigate to={getDashboardByRole()} /> : <Dashboard />
        } />
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