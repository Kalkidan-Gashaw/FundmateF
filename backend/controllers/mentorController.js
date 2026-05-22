import MentorProfile from "../models/MentorProfile.js";
import MentorshipRequest from "../models/MentorshipRequest.js";
import User from "../models/User.js";
import StartupProfile from "../models/StartupProfile.js";
import { Op } from "sequelize";
import sequelize from "../config/database.js";

// ============ Mentor Profile Controllers ============

// Create or update mentor profile
export const saveMentorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    let mentorProfile = await MentorProfile.findOne({ where: { userId } });

    if (mentorProfile) {
      await mentorProfile.update(profileData);
      return res.status(200).json({
        success: true,
        message: "Mentor profile updated successfully",
        data: mentorProfile,
      });
    } else {
      mentorProfile = await MentorProfile.create({
        userId,
        ...profileData,
      });
      return res.status(201).json({
        success: true,
        message: "Mentor profile created successfully",
        data: mentorProfile,
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

// Get mentor profile
export const getMentorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const mentorProfile = await MentorProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
         as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: mentorProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all mentors (for entrepreneurs)
export const getAllMentors = async (req, res) => {
  try {
    const { expertise, search } = req.query;
    
    const whereConditions = { isAvailable: true };
    const userWhereConditions = {};
    
    if (search && search.trim() !== "") {
      userWhereConditions.name = { [Op.iLike]: `%${search.trim()}%` };
    }
    
    if (expertise && expertise !== "all") {
      whereConditions.expertise = { [Op.contains]: [expertise] };
    }
    
    const mentors = await MentorProfile.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
         as: "user",
          where: Object.keys(userWhereConditions).length > 0 ? userWhereConditions : undefined,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["rating", "DESC"]],
    });
    
    res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get mentor by ID
export const getMentorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mentor = await MentorProfile.findOne({
      where: { id },
      include: [
        {
          model: User,
         as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: mentor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============ Mentorship Request Controllers ============

// Entrepreneur requests mentorship
export const requestMentorship = async (req, res) => {
  try {
    const { mentorId, topic, message, preferredDate, duration } = req.body;
    const entrepreneurId = req.user.id;

    // Validate that the mentor exists and has role 'mentor'
    const mentor = await User.findOne({
      where: { 
        id: mentorId,
        role: 'mentor'
      }
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found or invalid mentor ID",
      });
    }

    // Validate that entrepreneur exists
    const entrepreneur = await User.findOne({
      where: { 
        id: entrepreneurId,
        role: 'entrepreneur'
      }
    });

    if (!entrepreneur) {
      return res.status(404).json({
        success: false,
        message: "User not found or not an entrepreneur",
      });
    }

    // Check if request already exists
    const existingRequest = await MentorshipRequest.findOne({
      where: {
        entrepreneurId,
        mentorId,
        status: { [Op.in]: ["pending", "accepted"] },
      },
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending or accepted request with this mentor",
      });
    }
    
    const mentorshipRequest = await MentorshipRequest.create({
      entrepreneurId,
      mentorId,
      topic,
      message,
      preferredDate,
      duration: duration || 60,
      status: "pending",
    });
    
    res.status(201).json({
      success: true,
      message: "Mentorship request sent successfully",
      data: mentorshipRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get entrepreneur's mentorship requests
export const getMyRequests = async (req, res) => {
  try {
    const entrepreneurId = req.user.id;
    
    const requests = await MentorshipRequest.findAll({
      where: { entrepreneurId },
      include: [
        {
          model: User,
          as: "mentor",
          attributes: ["id", "name", "email"],
          include: [
            {
              model: MentorProfile,
              as: "mentorProfile",
              attributes: ["expertise", "bio", "rating"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    
    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get mentor's pending requests
export const getPendingRequests = async (req, res) => {
  try {
    const mentorId = req.user.id;
    
    const requests = await MentorshipRequest.findAll({
      where: {
        mentorId,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: "entrepreneur",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    
    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get mentor's active mentees
export const getActiveMentees = async (req, res) => {
  try {
    const mentorId = req.user.id;
    
    const requests = await MentorshipRequest.findAll({
      where: {
        mentorId,
        status: { [Op.in]: ["accepted", "completed"] },
      },
      include: [
        {
          model: User,
          as: "entrepreneur",
          attributes: ["id", "name", "email"],
          include: [
            {
              model: StartupProfile,
              as: "startupProfile",
              attributes: ["startupName", "sector", "fundingStage"],
            },
          ],
        },
      ],
      order: [["scheduledDate", "ASC"]],
    });
    
    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mentor accepts mentorship request
export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { scheduledDate, meetingLink } = req.body;
    const mentorId = req.user.id;
    
    const request = await MentorshipRequest.findOne({
      where: { id: requestId, mentorId, status: "pending" },
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found or already processed",
      });
    }
    
    await request.update({
      status: "accepted",
      scheduledDate,
      meetingLink,
    });
    
    // Update mentor's session count
    await MentorProfile.update(
      { totalSessions: sequelize.literal('"totalSessions" + 1') },
      { where: { userId: mentorId } }
    );
    
    res.status(200).json({
      success: true,
      message: "Mentorship request accepted",
      data: request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mentor rejects mentorship request
export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    const mentorId = req.user.id;
    
    const request = await MentorshipRequest.findOne({
      where: { id: requestId, mentorId, status: "pending" },
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found or already processed",
      });
    }
    
    await request.update({
      status: "rejected",
      feedback: rejectionReason,
    });
    
    res.status(200).json({
      success: true,
      message: "Mentorship request rejected",
      data: request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Complete mentorship session and provide feedback
export const completeSession = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { feedback, rating } = req.body;
    const userId = req.user.id;
    
    const request = await MentorshipRequest.findOne({
      where: {
        id: requestId,
        [Op.or]: [{ entrepreneurId: userId }, { mentorId: userId }],
        status: "accepted",
      },
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }
    
    await request.update({
      status: "completed",
      feedback,
      rating,
    });
    
    // Update mentor rating if feedback from entrepreneur
    if (req.user.role === "entrepreneur" && rating) {
      const mentorProfile = await MentorProfile.findOne({
        where: { userId: request.mentorId },
      });
      
      const newRating = (mentorProfile.rating + rating) / 2;
      await mentorProfile.update({ rating: newRating });
    }
    
    res.status(200).json({
      success: true,
      message: "Session completed successfully",
      data: request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get mentor by user ID
export const getMentorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const mentor = await MentorProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
         as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: mentor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};