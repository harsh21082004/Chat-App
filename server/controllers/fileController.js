const mongoose = require("mongoose");

let gridFsBucket;

mongoose.connection.once("open", () => {
  gridFsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "fs", // Updated to match your actual bucket name
  });
});

exports.getImage = async (req, res) => {
  try {
    if (!gridFsBucket) {
      return res.status(500).json({ message: "GridFSBucket is not initialized" });
    }

    const fileCollection = mongoose.connection.db.collection("fs.files"); // Ensure this matches your bucket
    const file = await fileCollection.findOne({ filename: req.params.filename });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.set("Content-Type", file.contentType);

    const readStream = gridFsBucket.openDownloadStream(file._id);
    readStream.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: error.message });
  }
};
