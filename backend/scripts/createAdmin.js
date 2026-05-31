import bcrypt from "bcrypt";
import { sequelize, User } from "../models/index.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: "admin@gmail.com" } });
    
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      console.log("To reset password, delete this user first");
      process.exit(0);
    }

    // Hash password "admin123"
    const hashedPassword = await bcrypt.hash("admin123", 10);
    console.log("Hashed password created:", hashedPassword);

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log("========================================");
    console.log("Admin user created successfully!");
    console.log("Email: admin@gmail.com");
    console.log("Password: admin123");
    console.log("User ID:", admin.id);
    console.log("========================================");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    console.error("Error details:", error.message);
    process.exit(1);
  }
};

createAdmin();