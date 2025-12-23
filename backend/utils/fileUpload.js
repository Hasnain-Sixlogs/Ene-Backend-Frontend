const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

// Initialize GCS with error handling
let storage = null;
let bucket = null;
const bucketName = process.env.GCS_BUCKET_NAME || 'ene-uploads';

try {
  // Try to load service account credentials
  let credentials = null;
  
  // Option 1: Use credentials from environment variable as JSON string (MOST SECURE - for production)
  if (process.env.GCP_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);
      console.log('✅ Using GCS credentials from GCP_SERVICE_ACCOUNT_JSON environment variable');
    } catch (err) {
      console.warn('Failed to parse GCP_SERVICE_ACCOUNT_JSON:', err.message);
    }
  }
  
  // Option 2: Use credentials from file path (for Cloud Run secrets mount)
  if (!credentials && process.env.GCP_SERVICE_ACCOUNT_KEY && fs.existsSync(process.env.GCP_SERVICE_ACCOUNT_KEY)) {
    try {
      credentials = JSON.parse(fs.readFileSync(process.env.GCP_SERVICE_ACCOUNT_KEY, 'utf8'));
      console.log('✅ Using GCS credentials from file:', process.env.GCP_SERVICE_ACCOUNT_KEY);
    } catch (err) {
      console.warn('Failed to parse service account key from file:', err.message);
    }
  }
  
  // Option 3: Use local config file (ONLY for local development - NOT recommended for production)
  if (!credentials) {
    const keyPath = path.resolve(__dirname, '../config/gcp-service-account.json');
    if (fs.existsSync(keyPath)) {
      try {
        credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        console.warn('⚠️  Using GCS credentials from local file (not recommended for production)');
      } catch (err) {
        console.warn('Failed to load service account key from config:', err.message);
      }
    }
  }
  
  // Initialize Storage with credentials object (more reliable than keyFilename)
  if (credentials) {
    storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID || credentials.project_id,
      credentials: credentials,
    });
    bucket = storage.bucket(bucketName);
    console.log('✅ GCS initialized successfully');
  } else if (process.env.GCP_PROJECT_ID) {
    // Option 4: Try Application Default Credentials (for Cloud Run with service account)
    try {
      storage = new Storage({
        projectId: process.env.GCP_PROJECT_ID,
      });
      bucket = storage.bucket(bucketName);
      console.log('✅ GCS initialized with Application Default Credentials');
    } catch (adcError) {
      console.warn('Application Default Credentials not available:', adcError.message);
      throw adcError; // Re-throw to be caught by outer catch
    }
  } else {
    console.warn('⚠️  GCS credentials not found. GCS uploads will be disabled.');
    console.warn('   Set GCP_SERVICE_ACCOUNT_JSON (recommended) or GCP_SERVICE_ACCOUNT_KEY environment variable');
    throw new Error('GCS credentials not available');
  }
} catch (error) {
  console.warn('GCS initialization failed, will use local storage:', error.message);
  console.warn('Error details:', error.code, error.message);
  storage = null;
  bucket = null;
}

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
  if (!bucket) {
    throw new Error('GCS bucket not initialized');
  }
  
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

  // Check if GCS is properly initialized
  if (!bucket || !storage) {
    console.warn('GCS not initialized, falling back to local storage');
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
        console.error('GCS upload error:', err.message);
        // Don't reject, return null to fall back to local storage
        // This allows uploads to continue even if GCS fails
        console.warn('Falling back to local storage due to GCS error');
        resolve(null);
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
    console.error('GCS upload error:', error.message);
    // Return null instead of throwing to allow fallback to local storage
    console.warn('Falling back to local storage due to GCS error');
    return null;
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

  // If GCS is enabled, try to upload to GCS first
  if (process.env.ImageUploadOnGCS === '1') {
    const gcsPath = await uploadToGCS(file, folder);
    // If GCS upload succeeded, return the GCS path
    if (gcsPath) {
      return gcsPath;
    }
    // If GCS upload failed (returned null), fall through to local storage
    console.log('GCS upload failed or not available, using local storage');
  }

  // Return local path (fallback or when GCS is disabled)
  // Get relative path from uploads directory using path.relative for reliable path handling
  const uploadDirAbsolute = path.resolve(uploadDir);
  const filePathAbsolute = path.resolve(file.path);
  
  // Get relative path (e.g., "general/filename.png")
  let relativePath = path.relative(uploadDirAbsolute, filePathAbsolute);
  // Normalize path separators to forward slashes
  relativePath = relativePath.replace(/\\/g, '/');
  // Ensure path starts with /
  if (!relativePath.startsWith('/')) {
    relativePath = '/' + relativePath;
  }
  
  // Construct URL: baseUrl + /uploads + relativePath
  const baseUrl = (process.env.BASE_URL || 'https://ene-backend-454164503170.us-south1.run.app').replace(/\/$/, '');
  return `${baseUrl}/uploads${relativePath}`;
};

// Get signed URL from file path (for non-expiring access - generates fresh URL on-demand)
// Store file path in database, call this function when you need to access the file
// This way URLs never expire because they're generated fresh each time
const getFileUrl = async (filePath) => {
  try {
    // If it's already a URL (local or signed), return as is
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    // If GCS is not initialized or disabled, return local path as-is
    if (!bucket || process.env.ImageUploadOnGCS !== '1') {
      return filePath;
    }
    
    // If it's a GCS path (gs://bucket/path or just path)
    if (filePath.startsWith('gs://')) {
      // Extract path from gs://bucket/path format
      const pathParts = filePath.replace('gs://', '').split('/');
      const fileName = pathParts.slice(1).join('/');
      return await getSignedUrl(fileName);
    }
    
    // If it's already a full GCS path (folder/filename) and doesn't start with http
    // Assume it's a GCS file path
    try {
      return await getSignedUrl(filePath);
    } catch (gcsError) {
      // If GCS URL generation fails, return the path as-is (might be local)
      console.warn('Failed to generate GCS signed URL, returning path as-is:', gcsError.message);
      return filePath;
    }
  } catch (error) {
    console.error('Error getting file URL:', error.message);
    // Return the original path as fallback
    return filePath;
  }
};

module.exports = {
  uploadFile,
  uploadFiles,
  processUploadedFile,
  getSignedUrl,
  getFileUrl // Use this to get fresh signed URL from stored file path (never expires)
};