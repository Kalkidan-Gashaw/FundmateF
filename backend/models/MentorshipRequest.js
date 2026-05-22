import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MentorshipRequest = sequelize.define("MentorshipRequest", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  entrepreneurId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  mentorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  startupId: {  // ADD THIS FIELD
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "StartupProfiles",
      key: "id",
    },
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected", "completed", "cancelled"),
    defaultValue: "pending",
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  preferredDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: "Duration in minutes",
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5,
    },
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default MentorshipRequest;