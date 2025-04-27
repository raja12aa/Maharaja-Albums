const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for all origins (adjust as needed)
app.use(cors());

// Network shared partition path (adjust as needed)
const networkSharePath = '\\\\Mahhyyy27\\g';

// Check if network share path exists
try {
  if (!fs.existsSync(networkSharePath)) {
    console.error(`Network share path does not exist: ${networkSharePath}`);
    process.exit(1);
  }
} catch (err) {
  console.error('Error accessing network share path:', err);
  process.exit(1);
}

// Configure multer storage with timestamped filenames on network share
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, networkSharePath);
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${timestamp}${ext}`);
  }
});

const upload = multer({ storage: storage });

// Endpoint to handle file uploads
app.post('/upload', upload.array('files'), (req, res) => {
  const customerDetails = req.body;
  // You can process customerDetails here or save to DB if needed

  res.json({
    message: 'Files uploaded successfully',
    files: req.files.map(f => f.filename),
    customerDetails: customerDetails
  });
});

// Serve static files (your frontend)
app.use(express.static(path.join(__dirname)));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});