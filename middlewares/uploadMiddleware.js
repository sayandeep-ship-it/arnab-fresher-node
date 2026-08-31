const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload directory
const uploadDirectory = path.join(
  __dirname,
  '..',
  'uploads',
  'loyalty'
);

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const filename = `loyalty-${Date.now()}${extension}`;

    cb(null, filename);
  },
});

// Image filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  const allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) ||
    (
      file.mimetype === 'application/octet-stream' &&
      allowedExtensions.includes(extension)
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only JPG, JPEG, PNG and WEBP images are allowed'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;