import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { Rocket, Mail, Lock, User, ChevronDown, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "entrepreneur",
    adminSecret: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasNumber: false,
    hasUpperCase: false,
    hasLowerCase: false,
  });

  const validatePassword = (password) => {
    setPasswordErrors({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "password") {
      validatePassword(value);
    }
  };

  const isPasswordValid = () => {
    return passwordErrors.minLength && 
           passwordErrors.hasNumber && 
           passwordErrors.hasUpperCase && 
           passwordErrors.hasLowerCase;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Please enter your full name" });
      return;
    }
    
    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    
    if (!formData.password) {
      setMessage({ type: "error", text: "Please enter a password" });
      return;
    }
    
    if (!isPasswordValid()) {
      setMessage({ type: "error", text: "Please meet all password requirements" });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      const response = await API.post("/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        adminSecret: formData.adminSecret,
      });
      
      setRegisteredEmail(formData.email);
      setMessage({ type: "success", text: response.data.message });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error signing up" });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const validCount = Object.values(passwordErrors).filter(Boolean).length;
    if (validCount === 4) return { text: "Strong", color: "text-green-600", bg: "bg-green-100" };
    if (validCount >= 2) return { text: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { text: "Weak", color: "text-red-600", bg: "bg-red-100" };
  };

  const strength = getPasswordStrength();

  // If registration successful, show verification message
  if (message.type === "success" && registeredEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification link to <strong>{registeredEmail}</strong>
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Please click the link in the email to verify your account. The link expires in 24 hours.
            </p>
            <p className="text-gray-500 text-sm">
              After verifying your email, return to the login page to sign in.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Didn't receive the email? Check your spam folder or{" "}
              <button 
                onClick={() => setMessage(null)}
                className="text-blue-600 hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join FundMate today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {message && message.type !== "success" && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success" 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email Address"
                />
              </div>
            </div>

            <div className="mb-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {formData.password && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Password Strength:</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded ${strength.bg} ${strength.color}`}>
                    {strength.text}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-xs">
                    {passwordErrors.minLength ? 
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" /> : 
                      <XCircle className="h-3 w-3 text-gray-400 mr-2" />
                    }
                    <span className={passwordErrors.minLength ? "text-green-600" : "text-gray-500"}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordErrors.hasUpperCase ? 
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" /> : 
                      <XCircle className="h-3 w-3 text-gray-400 mr-2" />
                    }
                    <span className={passwordErrors.hasUpperCase ? "text-green-600" : "text-gray-500"}>
                      At least one uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordErrors.hasLowerCase ? 
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" /> : 
                      <XCircle className="h-3 w-3 text-gray-400 mr-2" />
                    }
                    <span className={passwordErrors.hasLowerCase ? "text-green-600" : "text-gray-500"}>
                      At least one lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordErrors.hasNumber ? 
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" /> : 
                      <XCircle className="h-3 w-3 text-gray-400 mr-2" />
                    }
                    <span className={passwordErrors.hasNumber ? "text-green-600" : "text-gray-500"}>
                      At least one number
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="mb-6">
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="investor">Investor</option>
                  <option value="mentor">Mentor</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {formData.role === "admin" && (
              <div className="mb-6">
                <input
                  type="password"
                  name="adminSecret"
                  value={formData.adminSecret}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Admin Secret"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (formData.password && !isPasswordValid())}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;