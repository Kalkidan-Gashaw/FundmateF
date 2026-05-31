import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const StartupProfile = sequelize.define("StartupProfile", {
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
  startupName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sector: {
    type: DataTypes.ENUM(
      "technology",
      "healthcare",
      "finance",
      "education",
      "agriculture",
      "ecommerce",
      "clean_energy",
      "manufacturing",
      "transportation",
      "other"
    ),
    allowNull: false,
  },
  fundingStage: {
    type: DataTypes.ENUM(
      "idea",
      "prototype",
      "early_revenue",
      "growth",
      "expansion"
    ),
    allowNull: false,
  },
  fundingRequired: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  teamSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isWomenLed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM("draft", "active", "under_review", "funded"),
    defaultValue: "draft",
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// Association - define after model
export const associateStartupProfile = (models) => {
  StartupProfile.belongsTo(models.User, { foreignKey: "userId", as: "User" });
};

export default StartupProfile;