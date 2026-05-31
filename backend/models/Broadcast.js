import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Broadcast = sequelize.define("Broadcast", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  targetRole: {
    type: DataTypes.ENUM("all", "entrepreneur", "investor", "mentor"),
    defaultValue: "all",
  },
  status: {
    type: DataTypes.ENUM("draft", "sent", "scheduled"),
    defaultValue: "sent",
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sentBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  recipientCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

export default Broadcast;