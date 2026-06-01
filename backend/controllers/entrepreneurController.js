import StartupProfile from "../models/StartupProfile.js";
import InvestorProfile from "../models/InvestorProfile.js";
import NDA from "../models/NDA.js";
import User from "../models/User.js";
import { Op } from "sequelize";

// Create startup profile
export const createStartupProfile = async (req, res) => {
  try {
    const startupData = req.body;
    const userId = req.user.id;
    
    // Check if user already has a startup
    const existingStartup = await StartupProfile.findOne({ where: { userId } });
    if (existingStartup) {
      return res.status(400).json({
        success: false,
        message: "You already have a startup profile",
      });
    }
    
    const startup = await StartupProfile.create({
      userId,
      status: "active",
      ...startupData,
    });
    
    res.status(201).json({
      success: true,
      message: "Startup profile created successfully",
      data: startup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get my startup profile
export const getMyStartup = async (req, res) => {
  try {
    const startup = await StartupProfile.findOne({ 
      where: { userId: req.user.id }
    });
    
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup profile not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: startup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update startup profile
export const updateStartupProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const startup = await StartupProfile.findOne({ 
      where: { id, userId: req.user.id }
    });
    
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }
    
    await startup.update(req.body);
    
    res.status(200).json({
      success: true,
      message: "Startup profile updated successfully",
      data: startup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Find investors based on entrepreneur's startup
export const findInvestors = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get entrepreneur's startup profile
    const startup = await StartupProfile.findOne({ where: { userId } });
    
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Please create your startup profile first",
      });
    }

    console.log("Startup sector:", startup.sector);
    console.log("Startup stage:", startup.fundingStage);
    console.log("Startup funding:", startup.fundingRequired);

    // Find investors that match startup criteria
    const investors = await InvestorProfile.findAll({
      include: [
        {
          model: User,
         as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    console.log("Total investors in DB:", investors.length);

    // Filter and calculate match score
    const investorsWithScore = investors.map((investor) => {
      let score = 0;
      let maxScore = 0;
      
      // Check if investor has preferred sectors
      const hasSectorMatch = investor.preferredSectors?.includes(startup.sector);
      if (hasSectorMatch) {
        score += 40;
      }
      maxScore += 40;
      
      // Check if investor has preferred stages
      const hasStageMatch = investor.preferredStages?.includes(startup.fundingStage);
      if (hasStageMatch) {
        score += 40;
      }
      maxScore += 40;
      
      // Funding amount match
      const funding = parseFloat(startup.fundingRequired) || 0;
      const minRange = parseFloat(investor.investmentRangeMin) || 0;
      const maxRange = parseFloat(investor.investmentRangeMax) || Infinity;
      
      if (funding >= minRange && funding <= maxRange) {
        score += 20;
      } else if (funding <= maxRange) {
        score += 10;
      }
      maxScore += 20;
      
      const matchPercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      
      // Only return investors with at least some match (optional)
      // if (matchPercentage > 0) {
        return {
          ...investor.toJSON(),
          matchScore: matchPercentage,
        };
      // }
      // return null;
    }).filter(inv => inv !== null);
    
    // Sort by match score
    investorsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    console.log("Matched investors:", investorsWithScore.length);

    res.status(200).json({
      success: true,
      count: investorsWithScore.length,
      data: investorsWithScore,
      startup: startup,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search investors with filters
export const searchInvestors = async (req, res) => {
  try {
    const { investorType, minInvestment, maxInvestment, search } = req.query;
    
    console.log("Search params:", { investorType, minInvestment, maxInvestment, search }); // Debug log
    
    const whereConditions = {};
    const userWhereConditions = {};
    
    // Search by investor name - FIX THIS
    if (search && search.trim() !== "") {
      userWhereConditions.name = { [Op.iLike]: `%${search.trim()}%` };
    }
    
    // Filter by investor type
    if (investorType && investorType !== "all") {
      whereConditions.investorType = investorType;
    }
    
    // Filter by investment range
    if (minInvestment) {
      whereConditions.investmentRangeMax = { [Op.gte]: parseFloat(minInvestment) };
    }
    
    if (maxInvestment) {
      whereConditions.investmentRangeMin = { [Op.lte]: parseFloat(maxInvestment) };
    }
    
    const investors = await InvestorProfile.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
         as: "user",
          where: Object.keys(userWhereConditions).length > 0 ? userWhereConditions : undefined,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    
    console.log("Found investors:", investors.length); // Debug log
    
    res.status(200).json({
      success: true,
      count: investors.length,
      data: investors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get investor by ID (InvestorProfile ID) - ADD THIS FUNCTION
export const getInvestorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("=== getInvestorById called ===");
    console.log("Investor ID:", id);
    
    const investor = await InvestorProfile.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "createdAt"],
        },
      ],
    });
    
    if (!investor) {
      console.log("Investor not found");
      return res.status(404).json({
        success: false,
        message: "Investor not found",
      });
    }
    
    console.log("Investor found:", investor.user?.name);
    
    res.status(200).json({
      success: true,
      data: investor,
    });
  } catch (error) {
    console.error("Error in getInvestorById:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get investors who expressed interest in entrepreneur's startups (signed NDAs)
export const getInterestedInvestors = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all startups owned by this entrepreneur
    const startups = await StartupProfile.findAll({
      where: { userId },
      attributes: ['id', 'startupName']
    });
    
    if (startups.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    const startupIds = startups.map(s => s.id);
    
    // Find investors who have signed NDAs for these startups
    const ndas = await NDA.findAll({
      where: {
        startupId: { [Op.in]: startupIds },
        status: 'signed'
      },
      include: [
        {
          model: User,
          as: 'investor',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: StartupProfile,
          as: 'ndaStartup',  // Changed from "startup" to "ndaStartup"
          attributes: ['startupName']
        }
      ],
      order: [['signedAt', 'DESC']]
    });
    
    // Get unique investors (remove duplicates)
    const investorsMap = new Map();
    ndas.forEach(nda => {
      if (nda.investor && !investorsMap.has(nda.investor.id)) {
        investorsMap.set(nda.investor.id, {
          id: nda.investor.id,
          name: nda.investor.name,
          email: nda.investor.email,
          role: nda.investor.role,
          startupName: nda.ndaStartup?.startupName || 'Your startup',
          signedAt: nda.signedAt
        });
      }
    });
    
    res.status(200).json({
      success: true,
      data: Array.from(investorsMap.values())
    });
  } catch (error) {
    console.error('Error fetching interested investors:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// Get investor by User ID
export const getInvestorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("Looking for investor with User ID:", userId);
    
    const investor = await InvestorProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    
    if (!investor) {
      return res.status(404).json({
        success: false,
        message: "Investor not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: investor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
