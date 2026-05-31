import User from "../models/User.js";
import StartupProfile from "../models/StartupProfile.js";
import InvestorProfile from "../models/InvestorProfile.js";
import MentorProfile from "../models/MentorProfile.js";
import NDA from "../models/NDA.js";
import MentorshipRequest from "../models/MentorshipRequest.js";
import { Op } from "sequelize";
import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";
import Broadcast from "../models/Broadcast.js";
import Notification from "../models/Notification.js";
import Setting from "../models/Setting.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalEntrepreneurs = await User.count({ where: { role: "entrepreneur" } });
    const totalInvestors = await User.count({ where: { role: "investor" } });
    const totalMentors = await User.count({ where: { role: "mentor" } });
    const pendingUsers = await User.count({ where: { status: "pending" } });
    const suspendedUsers = await User.count({ where: { status: "suspended" } });
    const activeUsers = await User.count({ where: { status: "active" } });
    
    const totalStartups = await StartupProfile.count();
    const totalNDAs = await NDA.count();
    const totalMentorships = await MentorshipRequest.count({ where: { status: "accepted" } });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          entrepreneurs: totalEntrepreneurs,
          investors: totalInvestors,
          mentors: totalMentors,
          pending: pendingUsers,
          suspended: suspendedUsers,
          active: activeUsers,
        },
        startups: {
          total: totalStartups,
        },
        ndas: {
          total: totalNDAs,
        },
        mentorships: {
          total: totalMentorships,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all users with filters
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    
    const whereConditions = {};
    
    if (role && role !== "all") {
      whereConditions.role = role;
    }
    
    if (status && status !== "all") {
      whereConditions.status = status;
    }
    
    if (search && search.trim() !== "") {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { email: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    
    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single user by ID with full details
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Get additional data based on role
    let additionalData = null;
    
    if (user.role === "entrepreneur") {
      additionalData = await StartupProfile.findAll({
        where: { userId: user.id },
      });
    } else if (user.role === "investor") {
      additionalData = await InvestorProfile.findOne({
        where: { userId: user.id },
      });
    } else if (user.role === "mentor") {
      additionalData = await MentorProfile.findOne({
        where: { userId: user.id },
      });
    }
    
    // Get NDAs signed (if investor)
    let ndas = [];
    if (user.role === "investor") {
      ndas = await NDA.findAll({
        where: { investorId: user.id },
        include: [{ model: StartupProfile, as: "ndaStartup", attributes: ["startupName"] }],
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user,
        profile: additionalData,
        ndas: ndas,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve user (change status from pending to active)
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    if (user.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `User status is ${user.status}, not pending`,
      });
    }
    
    await user.update({ status: "active" });
    
    res.status(200).json({
      success: true,
      message: "User approved successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Suspend user
export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot suspend admin user",
      });
    }
    
    if (user.status === "suspended") {
      return res.status(400).json({
        success: false,
        message: "User is already suspended",
      });
    }
    
    await user.update({ status: "suspended" });
    
    res.status(200).json({
      success: true,
      message: "User suspended successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reactivate user (from suspended to active)
export const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    if (user.status !== "suspended") {
      return res.status(400).json({
        success: false,
        message: `User status is ${user.status}, not suspended`,
      });
    }
    
    await user.update({ status: "active" });
    
    res.status(200).json({
      success: true,
      message: "User reactivated successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin user",
      });
    }
    
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllStartups = async (req, res) => {
  try {
    const { sector, status, search } = req.query;
    
    const whereConditions = {};
    
    if (sector && sector !== "all") {
      whereConditions.sector = sector;
    }
    
    if (status && status !== "all") {
      whereConditions.status = status;
    }
    
    if (search && search.trim() !== "") {
      whereConditions[Op.or] = [
        { startupName: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }
    
    const startups = await StartupProfile.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    
    res.status(200).json({
      success: true,
      count: startups.length,
      data: startups,
    });
  } catch (error) {
    console.error("Error fetching startups:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add this function
export const updateStartupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const startup = await StartupProfile.findByPk(id);
    
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }
    
    await startup.update({ status });
    
    res.status(200).json({
      success: true,
      message: `Startup status updated to ${status}`,
      data: startup,
    });
  } catch (error) {
    console.error("Error updating startup status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get all NDAs with filters
export const getAllNDAs = async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    
    const whereConditions = {};
    
    if (status && status !== "all") {
      whereConditions.status = status;
    }
    
    if (startDate && endDate) {
      whereConditions.signedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.signedAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereConditions.signedAt = { [Op.lte]: new Date(endDate) };
    }
    
    const ndas = await NDA.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: "investor",
          attributes: ["id", "name", "email"],
        },
        {
          model: StartupProfile,
          as: "ndaStartup",
          attributes: ["id", "startupName", "sector", "fundingStage"],
          include: [
            {
              model: User,
              as: "owner",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      order: [["signedAt", "DESC"]],
    });
    
    // Calculate statistics
    const totalNDAs = ndas.length;
    const activeNDAs = ndas.filter(nda => nda.status === "signed" && (!nda.expiresAt || new Date(nda.expiresAt) > new Date())).length;
    const expiredNDAs = ndas.filter(nda => nda.expiresAt && new Date(nda.expiresAt) < new Date()).length;
    
    res.status(200).json({
      success: true,
      count: ndas.length,
      statistics: {
        total: totalNDAs,
        active: activeNDAs,
        expired: expiredNDAs,
      },
      data: ndas,
    });
  } catch (error) {
    console.error("Error fetching NDAs:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get NDA by ID
export const getNDAById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const nda = await NDA.findByPk(id, {
      include: [
        {
          model: User,
          as: "investor",
          attributes: ["id", "name", "email"],
        },
        {
          model: StartupProfile,
          as: "ndaStartup",
          attributes: ["id", "startupName", "sector", "fundingStage", "description"],
          include: [
            {
              model: User,
              as: "owner",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });
    
    if (!nda) {
      return res.status(404).json({
        success: false,
        message: "NDA not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: nda,
    });
  } catch (error) {
    console.error("Error fetching NDA:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Revoke NDA
export const revokeNDA = async (req, res) => {
  try {
    const { id } = req.params;
    
    const nda = await NDA.findByPk(id);
    
    if (!nda) {
      return res.status(404).json({
        success: false,
        message: "NDA not found",
      });
    }
    
    await nda.update({ status: "revoked" });
    
    res.status(200).json({
      success: true,
      message: "NDA revoked successfully",
      data: nda,
    });
  } catch (error) {
    console.error("Error revoking NDA:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get NDA statistics summary
export const getNDAStats = async (req, res) => {
  try {
    const totalNDAs = await NDA.count();
    const activeNDAs = await NDA.count({
      where: {
        status: "signed",
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      }
    });
    const expiredNDAs = await NDA.count({
      where: {
        status: "signed",
        expiresAt: { [Op.lt]: new Date() }
      }
    });
    const revokedNDAs = await NDA.count({ where: { status: "revoked" } });
    
    // Get monthly NDA signings for chart
    const monthlyData = await NDA.findAll({
      attributes: [
        [sequelize.fn("DATE_TRUNC", "month", sequelize.col("signedAt")), "month"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"]
      ],
      where: {
        status: "signed"
      },
      group: [sequelize.fn("DATE_TRUNC", "month", sequelize.col("signedAt"))],
      order: [[sequelize.fn("DATE_TRUNC", "month", sequelize.col("signedAt")), "ASC"]],
      limit: 12,
    });
    
    res.status(200).json({
      success: true,
      data: {
        total: totalNDAs,
        active: activeNDAs,
        expired: expiredNDAs,
        revoked: revokedNDAs,
        monthlyTrend: monthlyData,
      },
    });
  } catch (error) {
    console.error("Error fetching NDA stats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get platform analytics data
export const getAnalytics = async (req, res) => {
  try {
    // User registration trends (last 6 months)
    const userTrends = await User.findAll({
      attributes: [
        [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        Sequelize.col("role"),
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
      group: [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")), "role"],
      order: [[Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")), "ASC"]],
    });

    // Startup creation trends (last 6 months)
    const startupTrends = await StartupProfile.findAll({
      attributes: [
        [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
      group: [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt"))],
      order: [[Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")), "ASC"]],
    });

    // NDA signing trends (last 6 months)
    const ndaTrends = await NDA.findAll({
      attributes: [
        [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("signedAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      where: {
        signedAt: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
      group: [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("signedAt"))],
      order: [[Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("signedAt")), "ASC"]],
    });

    // Mentorship statistics
    const mentorshipStats = await MentorshipRequest.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    // Investment statistics
    const startupsWithFunding = await StartupProfile.findAll({
      where: {
        fundingRequired: { [Op.ne]: null },
        status: "active",
      },
      attributes: ["fundingRequired"],
    });

    const totalFundingSeeking = startupsWithFunding.reduce((sum, s) => sum + (parseFloat(s.fundingRequired) || 0), 0);
    
    const fundedStartups = await StartupProfile.count({
      where: { status: "funded" },
    });

    // User role distribution
    const roleDistribution = await User.findAll({
      attributes: [
        "role",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["role"],
    });

    // Daily active users (last 30 days)
    const activeUsers = await User.count({
      where: {
        status: "active",
        updatedAt: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        userTrends,
        startupTrends,
        ndaTrends,
        mentorshipStats,
        investmentStats: {
          totalFundingSeeking,
          fundedStartups,
          averageFunding: startupsWithFunding.length ? totalFundingSeeking / startupsWithFunding.length : 0,
        },
        roleDistribution,
        activeUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get daily activity
export const getDailyActivity = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const dailyUsers = await User.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("createdAt")), "date"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - days)),
        },
      },
      group: [Sequelize.fn("DATE", Sequelize.col("createdAt"))],
      order: [[Sequelize.fn("DATE", Sequelize.col("createdAt")), "ASC"]],
    });

    const dailyStartups = await StartupProfile.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("createdAt")), "date"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - days)),
        },
      },
      group: [Sequelize.fn("DATE", Sequelize.col("createdAt"))],
      order: [[Sequelize.fn("DATE", Sequelize.col("createdAt")), "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        dailyUsers,
        dailyStartups,
      },
    });
  } catch (error) {
    console.error("Error fetching daily activity:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get all mentorship requests with filters
export const getAllMentorships = async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    
    const whereConditions = {};
    
    if (status && status !== "all") {
      whereConditions.status = status;
    }
    
    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereConditions.createdAt = { [Op.lte]: new Date(endDate) };
    }
    
    const mentorships = await MentorshipRequest.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: "entrepreneur",
          attributes: ["id", "name", "email"],
          include: [
            {
              model: StartupProfile,
              as: "startupProfile",  // Changed from "startup" to "startupProfile"
              attributes: ["startupName", "sector"],
            },
          ],
        },
        {
          model: User,
          as: "mentor",
          attributes: ["id", "name", "email"],
          include: [
            {
              model: MentorProfile,
              as: "mentorProfile",
              attributes: ["expertise", "rating", "totalSessions"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    
    // Calculate statistics
    const stats = {
      total: mentorships.length,
      pending: mentorships.filter(m => m.status === "pending").length,
      accepted: mentorships.filter(m => m.status === "accepted").length,
      completed: mentorships.filter(m => m.status === "completed").length,
      rejected: mentorships.filter(m => m.status === "rejected").length,
      averageRating: 0,
    };
    
    const completedWithRating = mentorships.filter(m => m.status === "completed" && m.rating);
    if (completedWithRating.length > 0) {
      stats.averageRating = completedWithRating.reduce((sum, m) => sum + (m.rating || 0), 0) / completedWithRating.length;
    }
    
    res.status(200).json({
      success: true,
      data: mentorships,
      stats,
    });
  } catch (error) {
    console.error("Error fetching mentorships:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get mentorship by ID
export const getMentorshipById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mentorship = await MentorshipRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: "entrepreneur",
          attributes: ["id", "name", "email"],
          include: [
            {
              model: StartupProfile,
              as: "startup",
              attributes: ["startupName", "sector", "description"],
            },
          ],
        },
        {
          model: User,
          as: "mentor",
          attributes: ["id", "name", "email"],
          include: [
            {
              model: MentorProfile,
              as: "mentorProfile",
              attributes: ["expertise", "bio", "rating", "totalSessions", "company", "currentRole"],
            },
          ],
        },
      ],
    });
    
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: "Mentorship request not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: mentorship,
    });
  } catch (error) {
    console.error("Error fetching mentorship:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update mentorship status (admin override)
export const updateMentorshipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    
    const mentorship = await MentorshipRequest.findByPk(id);
    
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: "Mentorship request not found",
      });
    }
    
    await mentorship.update({ 
      status,
      feedback: adminNote ? `[Admin Note] ${adminNote}\n\n${mentorship.feedback || ''}` : mentorship.feedback,
    });
    
    res.status(200).json({
      success: true,
      message: `Mentorship status updated to ${status}`,
      data: mentorship,
    });
  } catch (error) {
    console.error("Error updating mentorship status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete mentorship request
export const deleteMentorship = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mentorship = await MentorshipRequest.findByPk(id);
    
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: "Mentorship request not found",
      });
    }
    
    await mentorship.destroy();
    
    res.status(200).json({
      success: true,
      message: "Mentorship request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting mentorship:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Send broadcast message
// export const sendBroadcast = async (req, res) => {
//   try {
//     const { title, message, targetRole, scheduledFor } = req.body;
//     const adminId = req.user.id;

//     // Build recipient query
//     const recipientWhere = { status: "active" };
//     if (targetRole && targetRole !== "all") {
//       recipientWhere.role = targetRole;
//     }

//     // Get recipient count
//     const recipientCount = await User.count({
//       where: recipientWhere,
//     });

//     if (recipientCount === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No recipients found for the selected criteria",
//       });
//     }

//     // Create broadcast record
//     const broadcast = await Broadcast.create({
//       title,
//       message,
//       targetRole: targetRole || "all",
//       status: scheduledFor ? "scheduled" : "sent",
//       scheduledFor: scheduledFor || null,
//       sentAt: scheduledFor ? null : new Date(),
//       sentBy: adminId,
//       recipientCount,
//     });

//     // If sending immediately (not scheduled), create notifications for all recipients
//     if (!scheduledFor) {
//       // Get all recipient users
//       const recipients = await User.findAll({
//         where: recipientWhere,
//         attributes: ["id"],
//       });

//       // Create notification for each recipient (you'll need a Notification model)
//       // For now, we'll just log it
//       console.log(`Broadcast "${title}" sent to ${recipientCount} users`);
//     }

//     res.status(201).json({
//       success: true,
//       message: scheduledFor ? "Broadcast scheduled successfully" : "Broadcast sent successfully",
//       data: broadcast,
//     });
//   } catch (error) {
//     console.error("Error sending broadcast:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Get all broadcasts
export const getAllBroadcasts = async (req, res) => {
  try {
    const broadcasts = await Broadcast.findAll({
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: broadcasts,
    });
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get broadcast by ID
export const getBroadcastById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const broadcast = await Broadcast.findByPk(id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    
    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Broadcast not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: broadcast,
    });
  } catch (error) {
    console.error("Error fetching broadcast:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete broadcast
export const deleteBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    
    const broadcast = await Broadcast.findByPk(id);
    
    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Broadcast not found",
      });
    }
    
    await broadcast.destroy();
    
    res.status(200).json({
      success: true,
      message: "Broadcast deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting broadcast:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Send broadcast message
export const sendBroadcast = async (req, res) => {
  try {
    const { title, message, targetRole, scheduledFor } = req.body;
    const adminId = req.user.id;

    // Build recipient query
    const recipientWhere = { status: "active" };
    if (targetRole && targetRole !== "all") {
      recipientWhere.role = targetRole;
    }

    // Get all recipient users
    const recipients = await User.findAll({
      where: recipientWhere,
      attributes: ["id"],
    });

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No recipients found for the selected criteria",
      });
    }

    // Create notifications for each recipient
    const notifications = recipients.map(recipient => ({
      userId: recipient.id,
      title: title,
      message: message,
      type: "broadcast",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Bulk insert notifications
    await Notification.bulkCreate(notifications);

    // Create broadcast record
    const broadcast = await Broadcast.create({
      title,
      message,
      targetRole: targetRole || "all",
      status: scheduledFor ? "scheduled" : "sent",
      scheduledFor: scheduledFor || null,
      sentAt: scheduledFor ? null : new Date(),
      sentBy: adminId,
      recipientCount: recipients.length,
    });

    res.status(201).json({
      success: true,
      message: scheduledFor ? `Broadcast scheduled to ${recipients.length} users` : `Broadcast sent to ${recipients.length} users`,
      data: broadcast,
    });
  } catch (error) {
    console.error("Error sending broadcast:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get all settings by category
export const getSettings = async (req, res) => {
  try {
    const { category } = req.query;
    
    const whereConditions = {};
    if (category && category !== "all") {
      whereConditions.category = category;
    }
    
    const settings = await Setting.findAll({
      where: whereConditions,
      order: [["category", "ASC"], ["order", "ASC"]],
    });
    
    // Group by category
    const groupedSettings = {};
    settings.forEach(setting => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = [];
      }
      groupedSettings[setting.category].push(setting);
    });
    
    res.status(200).json({
      success: true,
      data: settings,
      grouped: groupedSettings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new setting
export const createSetting = async (req, res) => {
  try {
    const { category, key, value, label, order } = req.body;
    
    // Check if key already exists in category
    const existing = await Setting.findOne({
      where: { category, key }
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `${key} already exists in this category`,
      });
    }
    
    const setting = await Setting.create({
      category,
      key,
      value,
      label: label || key,
      order: order || 0,
    });
    
    res.status(201).json({
      success: true,
      message: "Setting created successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Error creating setting:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update setting
export const updateSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { value, label, order, isActive } = req.body;
    
    const setting = await Setting.findByPk(id);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }
    
    await setting.update({ value, label, order, isActive });
    
    res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete setting
export const deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;
    
    const setting = await Setting.findByPk(id);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }
    
    await setting.destroy();
    
    res.status(200).json({
      success: true,
      message: "Setting deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting setting:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get NDA template
export const getNDATemplate = async (req, res) => {
  try {
    let ndaTemplate = await Setting.findOne({
      where: { category: "nda_template", key: "content" }
    });
    
    if (!ndaTemplate) {
      // Create default NDA template
      ndaTemplate = await Setting.create({
        category: "nda_template",
        key: "content",
        value: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into between the Startup and the Investor.

1. CONFIDENTIAL INFORMATION
The Investor acknowledges that the Startup possesses certain confidential information regarding its business, technology, financials, and operations.

2. OBLIGATIONS
The Investor agrees to:
- Not disclose any Confidential Information to third parties
- Use Confidential Information solely for evaluating a potential investment
- Protect Confidential Information with reasonable care

3. TERM
This Agreement shall remain in effect for a period of 2 years from the date of signing.

4. GOVERNING LAW
This Agreement shall be governed by the laws of Ethiopia.`,
        label: "NDA Template",
      });
    }
    
    res.status(200).json({
      success: true,
      data: ndaTemplate,
    });
  } catch (error) {
    console.error("Error fetching NDA template:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update NDA template
export const updateNDATemplate = async (req, res) => {
  try {
    const { content } = req.body;
    
    let ndaTemplate = await Setting.findOne({
      where: { category: "nda_template", key: "content" }
    });
    
    if (ndaTemplate) {
      await ndaTemplate.update({ value: content });
    } else {
      ndaTemplate = await Setting.create({
        category: "nda_template",
        key: "content",
        value: content,
        label: "NDA Template",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "NDA template updated successfully",
      data: ndaTemplate,
    });
  } catch (error) {
    console.error("Error updating NDA template:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Initialize default settings
export const initializeSettings = async (req, res) => {
  try {
    const defaultSectors = [
      { key: "technology", label: "Technology", order: 1 },
      { key: "healthcare", label: "Healthcare", order: 2 },
      { key: "finance", label: "Finance", order: 3 },
      { key: "education", label: "Education", order: 4 },
      { key: "agriculture", label: "Agriculture", order: 5 },
      { key: "ecommerce", label: "E-Commerce", order: 6 },
      { key: "clean_energy", label: "Clean Energy", order: 7 },
      { key: "manufacturing", label: "Manufacturing", order: 8 },
      { key: "transportation", label: "Transportation", order: 9 },
      { key: "other", label: "Other", order: 10 },
    ];
    
    const defaultStages = [
      { key: "idea", label: "Idea Stage", order: 1 },
      { key: "prototype", label: "Prototype / MVP", order: 2 },
      { key: "early_revenue", label: "Early Revenue", order: 3 },
      { key: "growth", label: "Growth", order: 4 },
      { key: "expansion", label: "Expansion", order: 5 },
    ];
    
    const defaultExpertise = [
      { key: "business_strategy", label: "Business Strategy", order: 1 },
      { key: "fundraising", label: "Fundraising", order: 2 },
      { key: "marketing", label: "Marketing", order: 3 },
      { key: "product_development", label: "Product Development", order: 4 },
      { key: "sales", label: "Sales", order: 5 },
      { key: "operations", label: "Operations", order: 6 },
      { key: "legal", label: "Legal", order: 7 },
      { key: "finance", label: "Finance", order: 8 },
      { key: "hr", label: "HR", order: 9 },
      { key: "technology", label: "Technology", order: 10 },
    ];
    
    // Create sectors
    for (const sector of defaultSectors) {
      await Setting.findOrCreate({
        where: { category: "sector", key: sector.key },
        defaults: {
          category: "sector",
          key: sector.key,
          value: sector.label,
          label: sector.label,
          order: sector.order,
        },
      });
    }
    
    // Create funding stages
    for (const stage of defaultStages) {
      await Setting.findOrCreate({
        where: { category: "funding_stage", key: stage.key },
        defaults: {
          category: "funding_stage",
          key: stage.key,
          value: stage.label,
          label: stage.label,
          order: stage.order,
        },
      });
    }
    
    // Create expertise
    for (const exp of defaultExpertise) {
      await Setting.findOrCreate({
        where: { category: "expertise", key: exp.key },
        defaults: {
          category: "expertise",
          key: exp.key,
          value: exp.label,
          label: exp.label,
          order: exp.order,
        },
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Default settings initialized",
    });
  } catch (error) {
    console.error("Error initializing settings:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};