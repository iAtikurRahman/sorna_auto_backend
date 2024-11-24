const fs = require('fs');
const path = require('path');
const db = require('../../../config/db'); // Assuming you are using MySQL with a configured DB instance
const joi = require('joi');

// create a user by admin
const createUserByAdmin = async (req, res) => {
  try {
    const {
      employee_id,
      access_role,
      name,
      email,
      phone,
      alternative_phone,
      emergency_number,
      designation,
      division,
      district,
      thana,
      country,
      address,
      dob,
      nid,
      marital_status,
      bb_routing_no,
      bank_account_name,
      bank_account_no,
      is_active,
      is_deleted,
      updated_by,
      created_by,
    } = req.body;

    const {id} = req.query;

    // Directory where images will be saved
    const uploadDir = path.join(__dirname, '../../../assets');

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Retrieve uploaded images from req.files
    const images = req.files.picture;
    const nid_images = req.files.nid_picture;

    // Ensure images are arrays
    const imageArray = Array.isArray(images) ? images : [images];
    const nidImageArray = Array.isArray(nid_images) ? nid_images : [nid_images];

    // Validate image upload limits
    if (imageArray.length > 1) {
      return res
        .status(400)
        .json({ success: false, message: 'Only one image allowed to upload' });
    }
    if (nidImageArray.length > 1) {
      return res
        .status(400)
        .json({ success: false, message: 'Only one NID image allowed to upload' });
    }

    // Save images to the "assets" folder
    const uploadedImageURLs = [];
    const uploadedNidImageURLs = [];

    try {
      for (const imageFile of imageArray) {
        const imagePath = path.join(uploadDir, `${Date.now()}_${imageFile.originalname}`);
        fs.writeFileSync(imagePath, imageFile.buffer);
        uploadedImageURLs.push(`/assets/${path.basename(imagePath)}`);
      }

      for (const nidImageFile of nidImageArray) {
        const nidImagePath = path.join(uploadDir, `${Date.now()}_${nidImageFile.originalname}`);
        fs.writeFileSync(nidImagePath, nidImageFile.buffer);
        uploadedNidImageURLs.push(`/assets/${path.basename(nidImagePath)}`);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error saving images on the server',
        error: error.message,
      });
    }

    // SQL Insert Query
    const insertQuery = `
      INSERT INTO users (
        employee_id,
        access_role,
        name,
        email,
        picture,
        phone,
        alternative_phone,
        emergency_number,
        designation,
        division,
        district,
        thana,
        country,
        address,
        dob,
        nid,
        nid_picture,
        marital_status,
        bb_routing_no,
        bank_account_name,
        bank_account_no,
        is_active,
        is_deleted,
        updated_by,
        updated_at,
        created_by,
        created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP
      )`;

    const [insertResult] = await db.execute(insertQuery, [
      employee_id,
      access_role,
      name,
      email,
      uploadedImageURLs[0],
      phone,
      alternative_phone,
      emergency_number,
      designation,
      division,
      district,
      thana,
      country,
      address,
      dob,
      nid,
      uploadedNidImageURLs[0],
      marital_status,
      bb_routing_no,
      bank_account_name,
      bank_account_no,
      is_active,
      is_deleted,
      updated_by,
      created_by,
    ]);

    res.status(200).json({
      success: true,
      message: 'User created successfully',
      data: { id: insertResult.insertId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Invalid request',
      error: error.message,
    });
  }
};

// create a user by admin
const getAllUsers = async (req, res) => {
  try {
    // Extract page and limit from query parameters
    const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
    const userId = parseInt(req.query.user_id) || 1;  // Default to page 1 if not provided
    const limit = 10;  // Default to limit of 10 if not provided
    const offset = (page - 1) * limit;  // Calculate the offset

    // SQL Query to fetch users with pagination
    const getUsersQuery = `
      SELECT id, employee_id, access_role, name, email, phone, alternative_phone, 
             emergency_number, designation, division, district, thana, country, address, 
             dob, nid, marital_status, bb_routing_no, bank_account_name, bank_account_no, 
             is_active, is_deleted, updated_by, created_by, updated_at, created_at
      FROM users
      LIMIT ? OFFSET ?`;

    // Execute the query with limit and offset
    const [users] = await db.query(getUsersQuery, [limit, offset]);

    // Get the total number of users for pagination
    const [totalUsersResult] = await db.execute('SELECT COUNT(*) AS total FROM users');
    const totalUsers = totalUsersResult[0].total;

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      lastPage: totalPages,
      data: users     
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

//update user
const updateUser = async (req, res) => {
  try {
    const {
      employee_id,
      access_role,
      name,
      email,
      phone,
      alternative_phone,
      emergency_number,
      designation,
      division,
      district,
      thana,
      country,
      address,
      dob,
      nid,
      marital_status,
      bb_routing_no,
      bank_account_name,
      bank_account_no,
      is_active,
      is_deleted,
      updated_by,
    } = req.body;

    const { id } = req.params;  // Assuming 'id' is part of the URL path

    // Directory where images will be saved
    const uploadDir = path.join(__dirname, '../../../assets');

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Retrieve uploaded images from req.files
    const images = req.files?.picture;
    const nid_images = req.files?.nid_picture;

    // Handle image arrays if they exist
    const imageArray = Array.isArray(images) ? images : images ? [images] : [];
    const nidImageArray = Array.isArray(nid_images) ? nid_images : nid_images ? [nid_images] : [];

    // Validate image upload limits
    if (imageArray.length > 1) {
      return res
        .status(400)
        .json({ success: false, message: 'Only one image allowed to upload' });
    }
    if (nidImageArray.length > 1) {
      return res
        .status(400)
        .json({ success: false, message: 'Only one NID image allowed to upload' });
    }

    // Prepare arrays to hold image URLs
    const uploadedImageURLs = [];
    const uploadedNidImageURLs = [];

    try {
      // Save new images if they are provided
      for (const imageFile of imageArray) {
        const imagePath = path.join(uploadDir, `${Date.now()}_${imageFile.originalname}`);
        fs.writeFileSync(imagePath, imageFile.buffer);
        uploadedImageURLs.push(`/assets/${path.basename(imagePath)}`);
      }

      for (const nidImageFile of nidImageArray) {
        const nidImagePath = path.join(uploadDir, `${Date.now()}_${nidImageFile.originalname}`);
        fs.writeFileSync(nidImagePath, nidImageFile.buffer);
        uploadedNidImageURLs.push(`/assets/${path.basename(nidImagePath)}`);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error saving images on the server',
        error: error.message,
      });
    }

    // SQL Update Query
    const updateQuery = `
      UPDATE users
      SET 
        employee_id = ?, 
        access_role = ?, 
        name = ?, 
        email = ?, 
        picture = ?, 
        phone = ?, 
        alternative_phone = ?, 
        emergency_number = ?, 
        designation = ?, 
        division = ?, 
        district = ?, 
        thana = ?, 
        country = ?, 
        address = ?, 
        dob = ?, 
        nid = ?, 
        nid_picture = ?, 
        marital_status = ?, 
        bb_routing_no = ?, 
        bank_account_name = ?, 
        bank_account_no = ?, 
        is_active = ?, 
        is_deleted = ?, 
        updated_by = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`;

    // Check if images are provided, otherwise retain old values
    const updatedImageURL = uploadedImageURLs[0] || null;
    const updatedNidImageURL = uploadedNidImageURLs[0] || null;

    const [updateResult] = await db.execute(updateQuery, [
      employee_id,
      access_role,
      name,
      email,
      updatedImageURL,
      phone,
      alternative_phone,
      emergency_number,
      designation,
      division,
      district,
      thana,
      country,
      address,
      dob,
      nid,
      updatedNidImageURL,
      marital_status,
      bb_routing_no,
      bank_account_name,
      bank_account_no,
      is_active,
      is_deleted,
      updated_by,
      id, // The ID to identify the user being updated
    ]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

//delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params; // Assuming 'id' is part of the URL path

    // SQL Delete Query
    const deleteQuery = `DELETE FROM users WHERE id = ?`;

    const [deleteResult] = await db.execute(deleteQuery, [id]);

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};



module.exports = {
  createUserByAdmin,
  getAllUsers,
  updateUser,
  deleteUser
};
