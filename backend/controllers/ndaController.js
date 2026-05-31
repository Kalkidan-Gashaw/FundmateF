import NDA from "../models/NDA.js";
import StartupProfile from "../models/StartupProfile.js";
import User from "../models/User.js";
import { Op } from "sequelize";

// Investor signs NDA for a startup
export const signNDA = async (req, res) => {
  try {
    const { startupId } = req.body;
    const investorId = req.user.id;

    console.log("Sign NDA request:", { investorId, startupId });

    if (!startupId) {
      return res.status(400).json({
        success: false,
        message: "startupId is required",
      });
    }

    // Check if startup exists
    const startup = await StartupProfile.findOne({
      where: { id: startupId, status: "active" }
    });

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    // Set expiration date (2 years from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    // Check if NDA already exists (using upsert pattern)
    const [nda, created] = await NDA.findOrCreate({
      where: {
        investorId,
        startupId,
      },
      defaults: {
        investorId,
        startupId,
        status: "signed",
        signedAt: new Date(),
        expiresAt: expiresAt,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
        userAgent: req.headers["user-agent"],
      },
    });

    if (!created) {
      // Update existing NDA
      await nda.update({
        status: "signed",
        signedAt: new Date(),
        expiresAt: expiresAt,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });
      
      return res.status(200).json({
        success: true,
        message: "NDA signed successfully. You can now view confidential information.",
        data: nda,
      });
    }

    console.log("NDA created successfully:", nda.id);

    res.status(201).json({
      success: true,
      message: "NDA signed successfully. You can now view confidential information.",
      data: nda,
    });
  } catch (error) {
    console.error("Error signing NDA:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check if investor has access (signed NDA) for a startup
export const checkAccess = async (req, res) => {
  try {
    const { startupId } = req.params;
    const investorId = req.user.id;

    console.log("Checking NDA access for:", { investorId, startupId });

    const nda = await NDA.findOne({
      where: {
        investorId,
        startupId,
        status: "signed",
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ],
      },
    });

    const hasAccess = !!nda;
    console.log("Has access:", hasAccess);

    res.status(200).json({
      success: true,
      hasAccess: hasAccess,
      ndaId: nda?.id || null,
    });
  } catch (error) {
    console.error("Error checking NDA access:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get investor's signed NDAs
export const getMySignedNDAs = async (req, res) => {
  try {
    const investorId = req.user.id;

    const ndas = await NDA.findAll({
      where: {
        investorId,
        status: "signed",
      },
      include: [
        { 
          model: StartupProfile, 
          as: "ndaStartup",
          attributes: ["id", "startupName", "sector", "fundingStage", "description"],
          include: [
            {
              model: User,
              as: "owner",
              attributes: ["id", "name", "email"],
            }
          ]
        },
      ],
      order: [["signedAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: ndas,
    });
  } catch (error) {
    console.error("Error fetching signed NDAs:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check NDA status for a specific startup (detailed)
export const checkNDAStatus = async (req, res) => {
  try {
    const { startupId } = req.params;
    const investorId = req.user.id;

    const nda = await NDA.findOne({
      where: {
        investorId,
        startupId,
      },
    });

    if (!nda) {
      return res.status(200).json({
        success: true,
        hasSigned: false,
        status: null,
        message: "No NDA found for this startup",
      });
    }

    const isExpired = nda.expiresAt && new Date(nda.expiresAt) < new Date();
    const isSigned = nda.status === "signed" && !isExpired;

    res.status(200).json({
      success: true,
      hasSigned: isSigned,
      status: nda.status,
      signedAt: nda.signedAt,
      expiresAt: nda.expiresAt,
      isExpired: isExpired,
    });
  } catch (error) {
    console.error("Error checking NDA status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all NDAs (for admin/debugging)
export const getAllNDAs = async (req, res) => {
  try {
    const ndas = await NDA.findAll({
      include: [
        {
          model: StartupProfile,
          as: "ndaStartup",
          attributes: ["id", "startupName"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: ndas.length,
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