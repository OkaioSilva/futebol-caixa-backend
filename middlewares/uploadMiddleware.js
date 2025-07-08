const multer = require('multer');
const bucket = require('../config/firebase');

const upload = multer({ storage: multer.memoryStorage() });

const handleUpload = (req, res, next) => {
  if (!req.file) return next();
  
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err) => next(err));
  blobStream.on('finish', () => {
    req.file.publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    next();
  });

  blobStream.end(req.file.buffer);
};

module.exports = { upload, handleUpload };