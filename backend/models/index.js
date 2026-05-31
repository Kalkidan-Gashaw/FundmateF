import User from "./User.js";
import StartupProfile from "./StartupProfile.js";
import InvestorProfile from "./InvestorProfile.js";
import Document from "./Document.js";
import sequelize from "../config/database.js";
import NDA from "./NDA.js";
import MentorProfile from "./MentorProfile.js";
import MentorshipRequest from "./MentorshipRequest.js";
import Message from "./Message.js";
import Resource from "./Resource.js";
import Broadcast from "./Broadcast.js";
import Setting from "./Setting.js";
// Define associations

// User to StartupProfile
User.hasOne(StartupProfile, { foreignKey: "userId", as: "startupProfile" });
StartupProfile.belongsTo(User, { foreignKey: "userId", as: "owner" });

// User to InvestorProfile
User.hasOne(InvestorProfile, { foreignKey: "userId", as: "investorProfile" });
InvestorProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

// StartupProfile to Document
StartupProfile.hasMany(Document, { foreignKey: "startupId", as: "documents" });
Document.belongsTo(StartupProfile, { foreignKey: "startupId", as: "startupProfile" });

// NDA associations
NDA.belongsTo(User, { as: "investor", foreignKey: "investorId" });
NDA.belongsTo(StartupProfile, { as: "ndaStartup", foreignKey: "startupId" });
StartupProfile.hasMany(NDA, { as: "ndaRequests", foreignKey: "startupId" });
User.hasMany(NDA, { as: "investorNdas", foreignKey: "investorId" });

// Mentor associations
User.hasOne(MentorProfile, { foreignKey: "userId", as: "mentorProfile" });
MentorProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

// MentorshipRequest associations
User.hasMany(MentorshipRequest, { as: "sentRequests", foreignKey: "entrepreneurId" });
User.hasMany(MentorshipRequest, { as: "receivedRequests", foreignKey: "mentorId" });
MentorshipRequest.belongsTo(User, { as: "entrepreneur", foreignKey: "entrepreneurId" });
MentorshipRequest.belongsTo(User, { as: "mentor", foreignKey: "mentorId" });

// MentorshipRequest to StartupProfile
MentorshipRequest.belongsTo(StartupProfile, { as: "relatedStartup", foreignKey: "startupId" });
StartupProfile.hasMany(MentorshipRequest, { as: "mentorshipRequests", foreignKey: "startupId" });

Resource.belongsTo(User, { as: "author", foreignKey: "authorId" });
User.hasMany(Resource, { as: "resources", foreignKey: "authorId" });

Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });
User.hasMany(Message, { as: "sentMessages", foreignKey: "senderId" });
User.hasMany(Message, { as: "receivedMessages", foreignKey: "receiverId" });

Broadcast.belongsTo(User, { as: "sender", foreignKey: "sentBy" });
User.hasMany(Broadcast, { as: "broadcasts", foreignKey: "sentBy" });


export {
  sequelize,
  User,
  StartupProfile,
  InvestorProfile,
  Document,
  NDA,
  MentorProfile,
  MentorshipRequest,
  Message,
  Resource,
  Broadcast,
  Setting,
};