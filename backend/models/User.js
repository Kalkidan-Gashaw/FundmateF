import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("entrepreneur", "investor", "mentor", "admin"),
    allowNull: false,
    defaultValue: "entrepreneur",
  },
  status: {
    type: DataTypes.ENUM("pending", "active", "suspended"),
    defaultValue: "pending",
  },
}, {
  timestamps: true,
});

// Hash password before saving
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

// Method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Association
export const associateUser = (models) => {
  User.hasOne(models.StartupProfile, { foreignKey: "userId" });
  User.hasOne(models.InvestorProfile, { foreignKey: "userId" });
};

export default User;