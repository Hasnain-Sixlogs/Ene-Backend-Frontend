const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

// Initialize GCS
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY || './config/gcp-service-account.json',
});

const bucketName = process.env.GCS_BUCKET_NAME || 'ene-uploads';
const bucket = storage.bucket(bucketName);

// Ensure upload directory exists (for local fallback)
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const multerStorage = multer.diskStorage({
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
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Generate signed URL for secure access (for mobile app)
// GCS maximum expiry is 7 days (604800 seconds)
// Since we generate URLs on-demand, they effectively never expire (fresh URL when needed)
const getSignedUrl = async (fileName, expiryMinutes = null) => {
  try {
    const file = bucket.file(fileName);
    
    // GCS maximum expiry: 7 days (10080 minutes = 604800 seconds)
    // Default: 7 days (maximum allowed by GCS)
    // Configurable via env, but will be capped at 7 days
    const maxExpiryMinutes = 7 * 24 * 60; // 7 days in minutes (GCS maximum)
    const requestedExpiry = expiryMinutes || parseInt(process.env.GCS_SIGNED_URL_EXPIRY_MINUTES) || maxExpiryMinutes;
    
    // Cap at maximum allowed by GCS (7 days)
    const expiryTime = Math.min(requestedExpiry, maxExpiryMinutes);
    
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + (expiryTime * 60 * 1000), // Convert minutes to milliseconds
    });
    
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// Upload to GCS
const uploadToGCS = async (file, folder) => {
  if (process.env.ImageUploadOnGCS !== '1') {
    return null;
  }

  try {
    const fileName = path.basename(file.path);
    const gcsFileName = `${folder}/${fileName}`;
    const fileContent = fs.readFileSync(file.path);

    // Upload to GCS
    const blob = bucket.file(gcsFileName);
    const stream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (err) => {
        console.error('GCS upload error:', err);
        reject(err);
      });

      stream.on('finish', async () => {
        // Delete local file after upload
        fs.unlinkSync(file.path);
        
        // Return GCS file path (not signed URL)
        // Signed URLs will be generated on-demand via getFileUrl() function
        // This ensures URLs never expire - they're generated fresh when needed
        // Store this path in database: e.g., "test/1234567890-image.jpg"
        resolve(gcsFileName);
      });

      stream.end(fileContent);
    });
  } catch (error) {
    console.error('GCS upload error:', error);
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
// Returns file path (not signed URL) - signed URLs generated on-demand via getFileUrl()
const processUploadedFile = async (file, folder = 'general') => {
  if (!file) {
    return null;
  }

  // If GCS is enabled, upload to GCS and return file path
  if (process.env.ImageUploadOnGCS === '1') {
    return await uploadToGCS(file, folder);
  }

  // Otherwise, return local path
  const filePath = file.path.replace(uploadDir, '').replace(/\\/g, '/');
  const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
  return `${baseUrl}/uploads${filePath}`;
};

// Get signed URL from file path (for non-expiring access - generates fresh URL on-demand)
// Store file path in database, call this function when you need to access the file
// This way URLs never expire because they're generated fresh each time
const getFileUrl = async (filePath) => {
  try {
    // If it's a GCS path (gs://bucket/path or just path)
    if (filePath.startsWith('gs://')) {
      // Extract path from gs://bucket/path format
      const pathParts = filePath.replace('gs://', '').split('/');
      const fileName = pathParts.slice(1).join('/');
      return await getSignedUrl(fileName);
    }
    
    // If it's already a full GCS path (folder/filename)
    if (!filePath.startsWith('http')) {
      // Assume it's a GCS file path
      return await getSignedUrl(filePath);
    }
    
    // If it's already a URL (local or signed), return as is
    return filePath;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  uploadFiles,
  processUploadedFile,
  getSignedUrl,
  getFileUrl // Use this to get fresh signed URL from stored file path (never expires)
};