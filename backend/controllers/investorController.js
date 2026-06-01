import InvestorProfile from "../models/InvestorProfile.js";
import StartupProfile from "../models/StartupProfile.js";
import User from "../models/User.js";
import NDA from "../models/NDA.js";
import { Op } from "sequelize";

// Create or update investor preferences
export const savePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferencesData = req.body;

    let investorProfile = await InvestorProfile.findOne({ where: { userId } });

    if (investorProfile) {
      await investorProfile.update(preferencesData);
      return res.status(200).json({
        success: true,
        message: "Preferences updated successfully",
        data: investorProfile,
      });
    } else {
      investorProfile = await InvestorProfile.create({
        userId,
        ...preferencesData,
      });
      return res.status(201).json({
        success: true,
        message: "Preferences saved successfully",
        data: investorProfile,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get investor preferences
export const getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const investorProfile = await InvestorProfile.findOne({ 
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!investorProfile) {
      return res.status(404).json({
        success: false,
        message: "Investor preferences not found",
      });
    }

    res.status(200).json({
      success: true,
      data: investorProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update specific preferences
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const investorProfile = await InvestorProfile.findOne({ where: { userId } });

    if (!investorProfile) {
      return res.status(404).json({
        success: false,
        message: "Investor preferences not found",
      });
    }

    await investorProfile.update(updateData);

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: investorProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Find startups based on investor preferences
export const findStartups = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get investor preferences
    const investorProfile = await InvestorProfile.findOne({ where: { userId } });
    
    if (!investorProfile) {
      return res.status(404).json({
        success: false,
        message: "Please set your investment preferences first",
      });
    }

    // Build filter conditions
    const whereConditions = { status: "active" };
    
    // Filter by sector
    if (investorProfile.preferredSectors && investorProfile.preferredSectors.length > 0) {
      whereConditions.sector = { [Op.in]: investorProfile.preferredSectors };
    }
    
    // Filter by funding stage
    if (investorProfile.preferredStages && investorProfile.preferredStages.length > 0) {
      whereConditions.fundingStage = { [Op.in]: investorProfile.preferredStages };
    }
    
    // Filter by funding required
    if (investorProfile.investmentRangeMin && investorProfile.investmentRangeMax) {
      whereConditions.fundingRequired = {
        [Op.between]: [investorProfile.investmentRangeMin, investorProfile.investmentRangeMax],
      };
    } else if (investorProfile.investmentRangeMin) {
      whereConditions.fundingRequired = {
        [Op.gte]: investorProfile.investmentRangeMin,
      };
    } else if (investorProfile.investmentRangeMax) {
      whereConditions.fundingRequired = {
        [Op.lte]: investorProfile.investmentRangeMax,
      };
    }

    // Find matching startups
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

    // Get all NDAs signed by this investor
    const signedNdas = await NDA.findAll({
      where: {
        investorId: userId,
        status: "signed",
      },
      attributes: ["startupId"],
    });
    
    const signedStartupIds = new Set(signedNdas.map(nda => nda.startupId));

    // Calculate match score for each startup
    const processedStartups = startups.map((startup) => {
      const hasNDA = signedStartupIds.has(startup.id);
      
      // Calculate match score (0-100)
      let score = 0;
      let maxScore = 0;
      
      // Sector match (30 points)
      if (investorProfile.preferredSectors?.includes(startup.sector)) {
        score += 30;
      }
      maxScore += 30;
      
      // Stage match (30 points)
      if (investorProfile.preferredStages?.includes(startup.fundingStage)) {
        score += 30;
      }
      maxScore += 30;
      
      // Funding amount match (40 points)
      const funding = parseFloat(startup.fundingRequired) || 0;
      const minRange = parseFloat(investorProfile.investmentRangeMin) || 0;
      const maxRange = parseFloat(investorProfile.investmentRangeMax) || Infinity;
      
      if (funding >= minRange && funding <= maxRange) {
        score += 40; // Perfect match
      } else if (funding <= maxRange) {
        score += 20; // Within max only
      }
      maxScore += 40;
      
      const matchPercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      
      // Return data based on NDA status
      if (hasNDA) {
        return {
          ...startup.toJSON(),
          matchScore: matchPercentage,
        };
      } else {
        // Return without description
        return {
          id: startup.id,
          startupName: startup.startupName,
          sector: startup.sector,
          fundingStage: startup.fundingStage,
          fundingRequired: startup.fundingRequired,
          teamSize: startup.teamSize,
          isWomenLed: startup.isWomenLed,
          owner: startup.owner,
          matchScore: matchPercentage,
          description: null,
          requiresNDA: true,
        };
      }
    });
    
    // Sort by match score (highest first)
    processedStartups.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      count: processedStartups.length,
      data: processedStartups,
      preferences: investorProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search startups with filters
export const searchStartups = async (req, res) => {
  try {
    const { sector, fundingStage, minFunding, maxFunding, search } = req.query;
    const userId = req.user.id;
    
    const whereConditions = { status: "active" };
    
    if (search && search.trim() !== "") {
      whereConditions[Op.or] = [
        { startupName: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }
    
    if (sector && sector !== "all") {
      whereConditions.sector = sector;
    }
    
    if (fundingStage && fundingStage !== "all") {
      whereConditions.fundingStage = fundingStage;
    }
    
    if (minFunding) {
      whereConditions.fundingRequired = { 
        [Op.gte]: parseFloat(minFunding) 
      };
    }
    
    if (maxFunding) {
      whereConditions.fundingRequired = { 
        ...whereConditions.fundingRequired,
        [Op.lte]: parseFloat(maxFunding) 
      };
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
    
    const signedNdas = await NDA.findAll({
      where: {
        investorId: userId,
        status: "signed",
      },
      attributes: ["startupId"],
    });
    
    const signedStartupIds = new Set(signedNdas.map(nda => nda.startupId));
    
    const processedStartups = startups.map((startup) => {
      const hasNDA = signedStartupIds.has(startup.id);
      
      if (hasNDA) {
        return startup.toJSON();
      } else {
        return {
          id: startup.id,
          startupName: startup.startupName,
          sector: startup.sector,
          fundingStage: startup.fundingStage,
          fundingRequired: startup.fundingRequired,
          teamSize: startup.teamSize,
          isWomenLed: startup.isWomenLed,
          User: startup.owner,
          description: null,
          requiresNDA: true,
        };
      }
    });
    
    res.status(200).json({
      success: true,
      count: processedStartups.length,
      data: processedStartups,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get startup by ID with NDA check
export const getStartupById = async (req, res) => {
  try {
    const { id } = req.params;
    const investorId = req.user.id;
    
    const startup = await StartupProfile.findOne({
      where: { id, status: "active" },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }
    
    const nda = await NDA.findOne({
      where: { investorId, startupId: id, status: "signed" }
    });
    
    const hasNDA = !!nda;
    
    if (hasNDA) {
      res.status(200).json({
        success: true,
        hasNDA: true,
        data: startup,
      });
    } else {
      const limitedData = {
        id: startup.id,
        startupName: startup.startupName,
        sector: startup.sector,
        fundingStage: startup.fundingStage,
        fundingRequired: startup.fundingRequired,
        teamSize: startup.teamSize,
        isWomenLed: startup.isWomenLed,
        website: startup.website,
        User: startup.owner,
      };
      res.status(200).json({
        success: true,
        hasNDA: false,
        data: limitedData,
        message: "Sign NDA to view full details including description",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Investor signs NDA
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

    // Check if startup exists and is active
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

    // Check if NDA already exists
    let existingNDA = await NDA.findOne({
      where: {
        investorId,
        startupId,
      },
    });

    if (existingNDA) {
      // Update existing NDA
      await existingNDA.update({
        status: "signed",
        signedAt: new Date(),
        expiresAt: expiresAt,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });
      
      return res.status(200).json({
        success: true,
        message: "NDA signed successfully. You can now view confidential information.",
        data: existingNDA,
      });
    }

    // Create new NDA
    const nda = await NDA.create({
      investorId,
      startupId,
      status: "signed",
      signedAt: new Date(),
      expiresAt: expiresAt,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

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

// Get startups investor has shown interest in (signed NDAs) - for chat list
export const getConnectedStartups = async (req, res) => {
  try {
    const investorId = req.user.id;
    
    const ndas = await NDA.findAll({
      where: {
        investorId,
        status: "signed"
      },
      include: [
        {
          model: StartupProfile,
          as: "ndaStartup",
          attributes: ["id", "startupName", "sector"],
          include: [
            {
              model: User,
              as: "owner",
              attributes: ["id", "name", "email"]
            }
          ]
        }
      ],
      order: [["signedAt", "DESC"]]
    });
    
    const connectedStartups = ndas
      .filter(nda => nda.ndaStartup && nda.ndaStartup.owner)
      .map(nda => ({
        id: nda.ndaStartup.owner.id,
        name: nda.ndaStartup.owner.name,
        email: nda.ndaStartup.owner.email,
        role: "entrepreneur",
        startupName: nda.ndaStartup.startupName,
        signedAt: nda.signedAt
      }));
    
    res.status(200).json({
      success: true,
      data: connectedStartups
    });
  } catch (error) {
    console.error("Error fetching connected startups:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all startups (for debugging)
export const getAllStartups = async (req, res) => {
  try {
    const startups = await StartupProfile.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    
    res.status(200).json({
      success: true,
      count: startups.length,
      data: startups,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};