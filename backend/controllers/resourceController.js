import Resource from "../models/Resource.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { Op } from "sequelize";

// Get single resource by ID
export const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }
    
    // Increment views
    await resource.increment('views');
    
    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get resources (mentor sees their own, entrepreneur sees resources shared with them)
export const getAllResources = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let whereConditions = {};
    
    if (userRole === 'mentor') {
      // Mentors see their own resources
      whereConditions.authorId = userId;
    } else if (userRole === 'entrepreneur') {
      // Entrepreneurs see resources shared with them (menteeId = their user ID)
      whereConditions.menteeId = userId;
    } else {
      // Investors and admins see public resources
      whereConditions.isPublic = true;
    }
    
    const resources = await Resource.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create resource (for mentors)
export const createResource = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menteeId, ...resourceData } = req.body;
    
    if (!menteeId) {
      return res.status(400).json({
        success: false,
        message: "Please select a mentee to share with",
      });
    }
    
    const resource = await Resource.create({
      ...resourceData,
      authorId: userId,
      menteeId: menteeId,
    });
    
    // Get mentor name
    const mentor = await User.findByPk(userId, {
      attributes: ["name"],
    });
    
    // Create a chat message to the mentee with the ACTUAL resource URL
    const actualResourceUrl = resourceData.url;
    const messageText = `📚 **New Resource Shared**\n\n**${resourceData.title}**\n${resourceData.description || "No description"}\n\n📎 Type: ${resourceData.type}\n📁 Category: ${resourceData.category}\n\n🔗 ${actualResourceUrl}`;
    
    await Message.create({
      senderId: userId,
      receiverId: menteeId,
      message: messageText,
      isRead: false,
    });
    
    res.status(201).json({
      success: true,
      message: "Resource shared successfully. The mentee will see it in chat.",
      data: resource,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a resource (only author)
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;
    
    const resource = await Resource.findOne({
      where: { id, authorId: userId }
    });
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found or you don't have permission",
      });
    }
    
    await resource.update(updateData);
    
    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: resource,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a resource (only author)
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const resource = await Resource.findOne({
      where: { id, authorId: userId }
    });
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found or you don't have permission",
      });
    }
    
    await resource.destroy();
    
    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Increment downloads count
export const incrementDownloads = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findByPk(id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }
    
    await resource.increment('downloads');
    
    res.status(200).json({
      success: true,
      message: "Download count updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get resources by author (my resources)
export const getMyResources = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const resources = await Resource.findAll({
      where: { authorId: userId },
      order: [["createdAt", "DESC"]],
    });
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};