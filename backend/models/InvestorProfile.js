import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const InvestorProfile = sequelize.define("InvestorProfile", {
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
  investorType: {
    type: DataTypes.ENUM("angel", "vc", "corporate", "fund", "individual"),
    defaultValue: "angel",
  },
  investmentRangeMin: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  investmentRangeMax: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  preferredSectors: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  preferredStages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  preferredLocations: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  portfolioSize: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  investmentThesis: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

export default InvestorProfile;