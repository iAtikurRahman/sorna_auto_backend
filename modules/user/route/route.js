const router = require('express').Router();
const multer = require('multer');
// Multer storage configuration
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });
const {
  createUserByAdmin,
  getAllUsers,
  updateUser,
  deleteUser
  } = require('../controller/controller.js');

// Create a new event feed comment
router.post('/create/:id',upload.fields([{name:'picture'},{name:'nid_picture'}]), createUserByAdmin);

router.get('/get/all',getAllUsers);

router.post('/update/:id',upload.fields([{name:'picture'},{name:'nid_picture'}]), updateUser);

router.get('/delete/:id',deleteUser);


module.exports = router;
