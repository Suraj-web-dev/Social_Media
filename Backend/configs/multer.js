import multer from "multer";

// Use memory storage for direct buffer handling with ImageKit
const storage = multer.memoryStorage();

// File filter to allow images and videos
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(null, false); // Safely ignore non-media files without throwing 500 error
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB maximum file size
    fieldSize: 50 * 1024 * 1024,
  },
  fileFilter,
});

export default upload;
