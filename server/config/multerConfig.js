const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const dotenv = require("dotenv");

dotenv.config();

const storage = new GridFsStorage({
  url: process.env.MONGO_URI, // Make sure this is correct
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (request, file) => {
    const match = ["image/png", "image/jpg"];
    console.log(file)

    if (match.indexOf(file.mimeType) === -1) {
      return `${Date.now()}-file-${file.originalname}`;
    }

    return {
      bucketName: "uploads",
      filename: `${Date.now()}-file-${file.originalname}`
    }
  }
});

const upload = multer({ storage });

module.exports = upload;
