const express = require('express');
const { addAuthUser, verifyUser, register, login, getAuthUser, getUsers, getUserDetails} = require('../controllers/authController');
const { getImage } = require('../controllers/fileController');
const upload = require("../config/multerConfig");
const router = express.Router();

router.post('/add-auth-user', addAuthUser);
router.post('/verify-user', verifyUser);
router.post('/register',upload.single("file"), register);
router.post('/login', login);
router.post('/login-email', addAuthUser);
router.post('/authUser', getAuthUser)
router.get('/users', getUsers)
router.get('/get-user', getUserDetails)
router.get("/file/:filename", getImage);
// router.post('/upload', upload.single("file"), uploadFile)

module.exports = router;
