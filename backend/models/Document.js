import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Document = sequelize.define("Document", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  startupId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "StartupProfiles",
      key: "id",
    },
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileType: {
    type: DataTypes.ENUM(
      "pitch_deck",
      "business_plan",
      "financials",
      "other"
    ),
    allowNull: false,
  },
  isConfidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default Document;