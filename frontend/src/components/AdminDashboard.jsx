import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name}</p>
      
      <div style={{ marginTop: "20px" }}>
        <h3>User Management</h3>
        <button>View All Users</button>
        <button>Approve Pending Users</button>
        <button>Suspend Users</button>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <h3>Startup Management</h3>
        <button>Review Startups</button>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <h3>Reports</h3>
        <button>View Access Logs</button>
        <button>View NDA Compliance</button>
      </div>
      
      <button 
        onClick={handleLogout}
        style={{ marginTop: "40px", padding: "10px 20px" }}
      >
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard;