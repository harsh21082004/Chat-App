const mongoose = require("mongoose");

let gridFsBucket;

mongoose.connection.once("open", () => {
  gridFsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads", // Updated to match your actual bucket name
  });
});

exports.getImage = async (req, res) => {
  try {
    if (!gridFsBucket) {
      return res.status(500).json({ message: "GridFSBucket is not initialized" });
    }

    console.log(req.params)

    const fileCollection = mongoose.connection.db.collection("uploads.files"); // Ensure this matches your bucket
    const file = await fileCollection.findOne({ filename: req.params.filename });
    console.log(file)

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

exports.getFiles = async (req, res) => {
  const { filename } = req.params;
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

  try {
    const filesCollection = db.collection('uploads.files');
    const fileDoc = await filesCollection.findOne({ filename });

    if (!fileDoc) {
      return res.status(404).json({ error: 'File not found' });
    }

    const range = req.headers.range;
    const contentType = fileDoc.contentType || 'application/octet-stream';
    const fileSize = fileDoc.length;

    // 🔄 If it's a video/audio file and range is present
    if (range && contentType.startsWith('video/')) {
      const start = Number(range.replace(/\D/g, ''));
      const CHUNK_SIZE = 1 * 1e6; // 1MB chunks
      const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
      const contentLength = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': contentType,
      });

      const downloadStream = bucket.openDownloadStreamByName(filename, { start, end: end + 1 });
      downloadStream.pipe(res);

    } else {
      // 🧾 For PDFs, images, full downloads (or missing range)
      res.set({
        'Content-Type': contentType,
        'Content-Length': fileSize,
      });

      bucket.openDownloadStreamByName(filename).pipe(res);
    }

  } catch (error) {
    console.error('Error streaming file:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

