const AuthUser = require('../models/AuthUser');
const UserData = require('../models/UserData');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const Grid = require("gridfs-stream");

const conn = mongoose.connection;
let gfs;

// Initialize GridFS when MongoDB connects
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads"); // Matches bucketName from multer config
});


// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const email1 = process.env.EMAIL
const pass = process.env.EMAIL_PASS;



exports.register = async (req, res) => {

  const { phone, firstName, lastName, email } = req.body;
  const name = firstName + " " + lastName;
  try {

    let fileUrl;

    if (req.file) {
      fileUrl = `/api/auth/file/${req.file.filename}`;
    }

    // Check if user exists in UserData
    const User = await UserData.findOne({ phone: phone });

    // Check if user exists in AuthUser
    const User1 = await AuthUser.findOne({ phone: phone });

    if (User) {
      return res.status(400).json({ message: 'User already exists, please login' });
    }

    if (User1 && User1.isVerified === false) {
      return res.status(200).json({ message: 'User not verified, please verify' });
    }

    // Update AuthUser fields if not verified
    const authUser = await AuthUser.findByIdAndUpdate(
      User1._id, // Find by User1's _id
      {
        isVerified: false,
      },
      { new: true } // Return the updated document
    );

    // Create new UserData entry
    const userData = new UserData({ name, email, profilePhoto: fileUrl, phone });
    await userData.save();

    // Sign JWT for userData details
    const token = jwt.sign(
      { _id: userData._id, name: userData.name, email: userData.email, profilePhoto: userData.profilePhoto, phone: userData.phone },
      'secret123',
      { expiresIn: '30m' }
    );

    return res.status(200).json({ message: 'User registered', token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadFile = async (request, response) => {
  if (!request.file) {
    return response.status(404).json('File not found');
  }

  const imageUrl = `${url}/file/${request.file.filename}`;

  return response.status(200).json(imageUrl);
}



exports.login = async (req, res) => {

  const { phone } = req.body;
  console.log(phone)

  try {

    const authUser = await AuthUser.findOne({ phone: phone });

    const userData = await UserData.findOne({ phone: phone });
    console.log(phone, authUser, userData)

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!authUser) {
      return res.status(404).json({ message: 'Verification Failed' });
    }

    const User = await AuthUser.findByIdAndUpdate(
      authUser._id, // Find by User1's _id
      {
        isVerified: true,
      },
      { new: true } // Return the updated document
    );

    const user = jwt.sign(
      { isVerified: User.isVerified, phone: User.phone },
      'secret123',
      { expiresIn: '10m' }
    );

    const token = jwt.sign({ _id: userData._id, name: userData.name, email: userData.email, profilePhoto: userData.profilePhoto, phone: userData.phone }, 'secret123', { expiresIn: '3600m' });


    return res.status(200).json({ message: 'User logged in', token: token, user: user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


exports.addAuthUser = async (req, res) => {

  try {

    const { phone } = req.body;
    console.log(phone)

    const authUser = await AuthUser.findOne({ phone });
    console.log(authUser)

    let user;

    if (authUser) {
      await AuthUser.findByIdAndUpdate(authUser._id, {
        phone: phone,
        isVerified: false
      }, { new: true });

      return res.status(200).json({ success: "OTP sent successfully." });

    }

    const authUser1 = new AuthUser({ phone: phone });
    await authUser1.save();

    return res.status(200).json({ success: "OTP sent successfully." });

  } catch (error) {
    throw new Error(error.message);
  }
}

// Verify OTP
exports.verifyUser = async (req, res) => {


  const { phone } = req.body;

  try {
    const authUser = await AuthUser.findOne({ phone });

    if (!authUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    authUser.isVerified = true;
    await authUser.save();

    // Create a corresponding UserData model if verified
    // const userData = new UserData({ authUser: authUser._id, name: mobileNumber });
    // await userData.save();

    const user = jwt.sign({ isVerified: authUser.isVerified, phone: authUser.phone }, 'secret123', { expiresIn: '10m' });

    return res.status(200).json({ message: 'User verified', user: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAuthUser = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    if(!token) return res.status(401).json({ message: 'Unauthorized' });
    const users = await UserData.find();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.getUserDetails = async (req, res) => {

  
  try {
    const token = req.headers['authorization'].split(' ')[1];

    const decoded = jwt.verify(token, 'secret123');

    const user = await UserData.findById(decoded._id).select('-__v  -createdAt -updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error:', error);
  }
};