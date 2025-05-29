const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const dotenv = require("dotenv");

dotenv.config();

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = [
      "image/png", "image/jpeg", "image/jpg", "application/pdf",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "audio/webm", "audio/wav", "audio/mpeg",
      "video/mp4", "video/webm", "video/ogg",
      "video/x-matroska",       // ✅ .mkv
      "video/3gpp",             // ✅ .3gp
      "video/quicktime",        // ✅ .mov
      "video/x-msvideo",
    ];

    if (!match.includes(file.mimetype)) return null;

    // Initialize fileIndex if not already
    if (typeof req.fileIndex === 'undefined') {
      req.fileIndex = 0;
    }

    const fileInfo = {
      bucketName: "uploads",
      filename: `${Date.now()}-file-${file.originalname}`,
    };

    req.fileIndex++; // Move to next file
    return fileInfo;
  },
});

const upload = multer({ storage });

module.exports = upload;
