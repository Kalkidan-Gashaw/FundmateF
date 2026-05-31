import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MentorProfile = sequelize.define("MentorProfile", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  expertise: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  industry: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  currentRole: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  mentoringType: {
    type: DataTypes.ENUM("paid", "volunteer", "both"),
    defaultValue: "volunteer",
  },
  totalSessions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5,
    },
  },
}, {
  timestamps: true,
});

export default MentorProfile;