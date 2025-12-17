const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.body.folder || 'general';
    const dir = path.join(uploadDir, folder);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const name = file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + name);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Upload to S3 (if configured)
const uploadToS3 = async (file, folder) => {
  if (process.env.ImageUploadOnS3Server !== '1') {
    return null;
  }

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION
  });

  const fileContent = fs.readFileSync(file.path);
  const fileName = path.basename(file.path);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${folder}/${fileName}`,
      Body: fileContent,
      ContentType: file.mimetype,
      ACL: 'public-read'
    }
  });

  try {
    await upload.done();
    // Delete local file after upload
    fs.unlinkSync(file.path);
    // Construct the URL manually as v3 doesn't return Location directly
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const key = `${folder}/${fileName}`;
    const location = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    return location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};

// File upload helper
const uploadFile = (fieldName, maxCount = 1) => {
  return upload.single(fieldName);
};

const uploadFiles = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Process uploaded file
const processUploadedFile = async (file, folder = 'general') => {
  if (!file) {
    return null;
  }

  // If S3 is enabled, upload to S3
  if (process.env.ImageUploadOnS3Server === '1') {
    return await uploadToS3(file, folder);
  }

  // Otherwise, return local path
  const filePath = file.path.replace(uploadDir, '').replace(/\\/g, '/');
  const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
  return `${baseUrl}/uploads${filePath}`;
};

module.exports = {
  uploadFile,
  uploadFiles,
  processUploadedFile
};