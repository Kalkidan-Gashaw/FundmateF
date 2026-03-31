import express from "express";
import sequelize from "./config/database.js";
import authRoutes from "./Routes/authRoutes.js";
import cors from "cors";

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Test database connection
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    
    // Create tables if they don't exist
    await sequelize.sync({ alter: true });
    console.log("Database synced");
  } catch (err) {
    console.log("Error:", err);
  }
};

syncDatabase();

app.listen(PORT, () => {
  console.log("server is listening on port " + PORT);
});