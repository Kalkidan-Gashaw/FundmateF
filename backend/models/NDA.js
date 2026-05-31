import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const NDA = sequelize.define("NDA", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  investorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  startupId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("signed", "expired"),
    defaultValue: "signed",
  },
  signedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["investorId", "startupId"],
    },
  ],
});

export default NDA;