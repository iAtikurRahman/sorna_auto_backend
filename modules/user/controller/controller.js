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

    const {id} = req.query.id;

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

module.exports = {
  createUserByAdmin,
};
