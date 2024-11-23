const router = require('express').Router();
const multer = require('multer');
// Multer storage configuration
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });
const {
    createUserByAdmin
  } = require('../controller/controller.js');

// Create a new event feed comment
router.post('/create/:id',upload.fields([{name:'picture',maxCount:1},{name:'nid_picture',maxCount:1}]), createUserByAdmin);


module.exports = router;
