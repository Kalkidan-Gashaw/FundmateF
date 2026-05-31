import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail, sendWelcomeEmail } from "../services/emailService.js";
import { Op } from "sequelize";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    console.log("Signup attempt for:", email);

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Check existing user
    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let userRole = role || "entrepreneur";
    
    if (userRole === "admin") {
      if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Invalid admin secret" });
      }
    }

    // Generate token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    console.log("Generated token:", verificationToken);
    console.log("Token expires:", verificationExpires);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      status: "unverified",
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    console.log("User created. Token in DB:", user.emailVerificationToken);

    // Send email (will log to console if email not configured)
    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log("Verifying token:", token);

    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
      },
    });

    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid verification link. Please register again." 
      });
    }

    if (user.emailVerificationExpires && new Date(user.emailVerificationExpires) < new Date()) {
      return res.status(400).json({ 
        message: "Verification link has expired. Please register again." 
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ 
        success: true,
        message: "Email already verified. You can now log in.",
      });
    }

    await user.update({
      isEmailVerified: true,
      status: user.role === "investor" || user.role === "mentor" ? "pending" : "active",
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    await user.update({
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(200).json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Allow admin login without email verification
    if (user.role !== "admin" && !user.isEmailVerified) {
      return res.status(403).json({ 
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        needsVerification: true,
        email: user.email,
      });
    }
    
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended." });
    }
    
    if (user.status === "pending") {
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "24h" }
    );
    
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};