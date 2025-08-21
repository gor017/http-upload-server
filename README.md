# File Upload API

A simple Node.js API for file uploads with configurable upload directory via environment variables.

## Features

- ✅ Single file upload
- ✅ Multiple file upload (up to 10 files)
- ✅ List uploaded files
- ✅ Download files
- ✅ Configurable upload directory via .env
- ✅ File size limits (10MB default)
- ✅ Unique filename generation
- ✅ CORS enabled
- ✅ Error handling
- ✅ MSI Installer support

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp env.example .env
   ```

3. **Configure your .env file:**
   ```env
   # File upload directory path (use absolute path)
   UPLOAD_DIR=C:/Users/yevat/http-upload/uploads
   
   # Server port
   PORT=3000
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## Building MSI Installer

This project supports building Windows MSI installers. There are two methods available:

### Method 1: WiX Toolset (True MSI)

**Prerequisites:**
- Install [WiX Toolset](https://wixtoolset.org/releases/)
- Add WiX binaries to your PATH

**Build steps:**
```bash
# Install build dependencies
npm install

# Build MSI installer
npm run build-installer
```

### Method 2: Electron Builder (NSIS Installer)

**Build steps:**
```bash
# Install build dependencies
npm install

# Build NSIS installer
npm run build-installer nsis
```

### Build Options

- **WiX MSI**: Creates a proper Windows MSI installer with full Windows integration
- **NSIS Installer**: Creates an NSIS-based installer (similar to MSI but more flexible)

### Installer Features

Both installer types include:
- ✅ Desktop shortcut
- ✅ Start menu shortcut
- ✅ Proper uninstall support
- ✅ Installation directory selection
- ✅ Automatic server startup

## API Endpoints

### 1. Get API Info
```
GET /
```
Returns API information and available endpoints.

### 2. Upload Single File
```
POST /upload
Content-Type: multipart/form-data
```
**Form field:** `file`

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "originalName": "example.jpg",
    "filename": "file-1703123456789-123456789.jpg",
    "size": 1024,
    "mimetype": "image/jpeg",
    "path": "./uploads/file-1703123456789-123456789.jpg"
  }
}
```

### 3. Upload Multiple Files
```
POST /upload-multiple
Content-Type: multipart/form-data
```
**Form field:** `files` (array)

**Response:**
```json
{
  "success": true,
  "message": "2 file(s) uploaded successfully",
  "files": [
    {
      "originalName": "file1.jpg",
      "filename": "files-1703123456789-123456789.jpg",
      "size": 1024,
      "mimetype": "image/jpeg",
      "path": "./uploads/files-1703123456789-123456789.jpg"
    }
  ]
}
```

### 4. List Uploaded Files
```
GET /files
```
**Response:**
```json
{
  "success": true,
  "uploadDir": "./uploads",
  "files": [
    {
      "filename": "file-1703123456789-123456789.jpg",
      "size": 1024,
      "created": "2023-12-21T10:30:56.789Z",
      "modified": "2023-12-21T10:30:56.789Z"
    }
  ]
}
```

### 5. Download File
```
GET /download/:filename
```
Downloads the specified file from the upload directory.

## Usage Examples

### Using cURL

**Upload single file:**
```bash
curl -X POST -F "file=@/path/to/your/file.jpg" http://localhost:3000/upload
```

**Upload multiple files:**
```bash
curl -X POST -F "files=@/path/to/file1.jpg" -F "files=@/path/to/file2.pdf" http://localhost:3000/upload-multiple
```

**List files:**
```bash
curl http://localhost:3000/files
```

**Download file:**
```bash
curl -O http://localhost:3000/download/filename.jpg
```

### Using JavaScript/Fetch

```javascript
// Upload single file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));

// Upload multiple files
const formData = new FormData();
Array.from(fileInput.files).forEach(file => {
  formData.append('files', file);
});

fetch('http://localhost:3000/upload-multiple', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## Configuration

### Environment Variables

- `UPLOAD_DIR`: Directory where files will be saved (default: `./uploads`)
- `PORT`: Server port (default: `3000`)

### File Upload Settings

- **File size limit:** 10MB (configurable in `server.js`)
- **Max files per upload:** 10 (for multiple uploads)
- **Filename generation:** `{fieldname}-{timestamp}-{random}.{extension}`

## Security Considerations

- The API accepts all file types by default
- You can add file type restrictions in the `fileFilter` function
- Consider implementing authentication for production use
- Validate file contents if needed

## Error Handling

The API includes comprehensive error handling for:
- Missing files
- File size limits
- Directory access issues
- File not found errors
- General server errors

All errors return appropriate HTTP status codes and JSON error messages.

## Distribution

After building the installer, you can distribute:

1. **MSI Installer** (`dist/http-upload-api-setup.msi`) - For enterprise deployment
2. **NSIS Installer** (`dist/HTTP Upload API Setup.exe`) - For general distribution
3. **Portable Executable** (`dist/http-upload.exe`) - For portable use

The installer will:
- Install the application to Program Files
- Create desktop and start menu shortcuts
- Configure the upload directory
- Start the server automatically
- Provide proper uninstall functionality
