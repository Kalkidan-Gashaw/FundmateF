import Resource from "../models/Resource.js";
import User from "../models/User.js";
import { Op } from "sequelize";

// Get all resources (public + mentor's own)
export const getAllResources = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, type, search } = req.query;
    
    const whereConditions = {
      [Op.or]: [
        { isPublic: true },
        { authorId: userId }
      ]
    };
    
    if (category && category !== "all") {
      whereConditions.category = category;
    }
    
    if (type && type !== "all") {
      whereConditions.type = type;
    }
    
    if (search && search.trim() !== "") {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } },
      ];
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
      order: [["views", "DESC"]],
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

// Create a new resource (only mentors)
export const createResource = async (req, res) => {
  try {
    const userId = req.user.id;
    const resourceData = req.body;
    
    const resource = await Resource.create({
      ...resourceData,
      authorId: userId,
    });
    
    res.status(201).json({
      success: true,
      message: "Resource created successfully",
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