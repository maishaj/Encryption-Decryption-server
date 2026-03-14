const express = require('express');
const router = express.Router();
const multer = require('multer');
const playfairController = require('../controllers/playfairController');

// Set up where uploaded files will be stored temporarily
const upload = multer({ dest: 'uploads/' });

// This route will handle: POST http://localhost:3000/api/playfair/encrypt
router.post('/encrypt', upload.single('file'), playfairController.encrypt);
router.post('/decrypt', upload.single('file'), playfairController.decrypt);

module.exports = router;