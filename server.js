const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get upload directory from environment variable
const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept all file types (you can add restrictions here)
        cb(null, true);
    }
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'File Upload API',
        endpoints: {
            upload: 'POST /upload',
            files: 'GET /files'
        }
    });
});

// Upload single file
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                originalName: req.file.originalname,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype,
                path: req.file.path
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
});

// Upload multiple files
app.post('/upload-multiple', upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const uploadedFiles = req.files.map(file => ({
            originalName: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            path: file.path
        }));

        res.json({
            success: true,
            message: `${req.files.length} file(s) uploaded successfully`,
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading files',
            error: error.message
        });
    }
});

// Get list of uploaded files
app.get('/files', (req, res) => {
    try {
        fs.readdir(uploadDir, (err, files) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error reading upload directory',
                    error: err.message
                });
            }

            const fileList = files.map(filename => {
                const filePath = path.join(uploadDir, filename);
                const stats = fs.statSync(filePath);
                return {
                    filename,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            });

            res.json({
                success: true,
                uploadDir,
                files: fileList
            });
        });
    } catch (error) {
        console.error('Error getting files:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting file list',
            error: error.message
        });
    }
});

// Download a specific file
app.get('/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading file',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Upload directory: ${uploadDir}`);
    console.log(`API endpoints:`);
    console.log(`  GET  / - API info`);
    console.log(`  POST /upload - Upload single file`);
    console.log(`  POST /upload-multiple - Upload multiple files`);
    console.log(`  GET  /files - List uploaded files`);
    console.log(`  GET  /download/:filename - Download a file`);
});
