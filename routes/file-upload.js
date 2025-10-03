const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../database/init');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // VULNERABLE: Using original filename without sanitization
    cb(null, file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// File upload lab main page
router.get('/', (req, res) => {
  res.render('file-upload/index', {
    title: 'File Upload Lab - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Basic file upload (vulnerable)
router.get('/basic', (req, res) => {
  res.render('file-upload/basic', {
    title: 'Basic File Upload - Bug Bounty Lab',
    user: req.session.user || null
  });
});

router.post('/basic', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.render('file-upload/basic', {
      title: 'Basic File Upload - Bug Bounty Lab',
      user: req.session.user || null,
      error: 'No file uploaded'
    });
  }

  const fileInfo = {
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path
  };

  res.render('file-upload/basic', {
    title: 'Basic File Upload - Bug Bounty Lab',
    user: req.session.user || null,
    success: 'File uploaded successfully!',
    fileInfo: fileInfo
  });
});

// File type bypass
router.get('/type-bypass', (req, res) => {
  res.render('file-upload/type-bypass', {
    title: 'File Type Bypass - Bug Bounty Lab',
    user: req.session.user || null
  });
});

router.post('/type-bypass', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.render('file-upload/type-bypass', {
      title: 'File Type Bypass - Bug Bounty Lab',
      user: req.session.user || null,
      error: 'No file uploaded'
    });
  }

  // VULNERABLE: Basic file type checking that can be bypassed
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

  let isValidType = allowedTypes.includes(req.file.mimetype);
  let isValidExtension = allowedExtensions.includes(fileExtension);

  const fileInfo = {
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path,
    extension: fileExtension,
    isValidType: isValidType,
    isValidExtension: isValidExtension
  };

  res.render('file-upload/type-bypass', {
    title: 'File Type Bypass - Bug Bounty Lab',
    user: req.session.user || null,
    success: 'File uploaded successfully!',
    fileInfo: fileInfo,
    validation: {
      typeValid: isValidType,
      extensionValid: isValidExtension
    }
  });
});

// Path traversal in file upload
router.get('/path-traversal', (req, res) => {
  res.render('file-upload/path-traversal', {
    title: 'Path Traversal Upload - Bug Bounty Lab',
    user: req.session.user || null
  });
});

router.post('/path-traversal', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.render('file-upload/path-traversal', {
      title: 'Path Traversal Upload - Bug Bounty Lab',
      user: req.session.user || null,
      error: 'No file uploaded'
    });
  }

  // VULNERABLE: No path traversal protection
  const fileInfo = {
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path
  };

  res.render('file-upload/path-traversal', {
    title: 'Path Traversal Upload - Bug Bounty Lab',
    user: req.session.user || null,
    success: 'File uploaded successfully!',
    fileInfo: fileInfo
  });
});

// File execution (dangerous - for educational purposes)
router.get('/execute', (req, res) => {
  res.render('file-upload/execute', {
    title: 'File Execution - Bug Bounty Lab',
    user: req.session.user || null
  });
});

router.post('/execute', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.render('file-upload/execute', {
      title: 'File Execution - Bug Bounty Lab',
      user: req.session.user || null,
      error: 'No file uploaded'
    });
  }

  // VULNERABLE: File execution without proper validation
  const fileInfo = {
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path
  };

  res.render('file-upload/execute', {
    title: 'File Execution - Bug Bounty Lab',
    user: req.session.user || null,
    success: 'File uploaded successfully!',
    fileInfo: fileInfo,
    warning: 'This file could potentially be executed if the server is misconfigured!'
  });
});

// List uploaded files
router.get('/list', (req, res) => {
  const uploadDir = 'uploads/';
  
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.render('file-upload/list', {
        title: 'Uploaded Files - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'Error reading upload directory',
        files: []
      });
    }

    const fileList = files.map(file => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        modified: stats.mtime
      };
    });

    res.render('file-upload/list', {
      title: 'Uploaded Files - Bug Bounty Lab',
      user: req.session.user || null,
      files: fileList
    });
  });
});

// Serve uploaded files (vulnerable to directory traversal)
router.get('/serve/:filename', (req, res) => {
  const filename = req.params.filename;
  // VULNERABLE: No path traversal protection
  const filePath = path.join('uploads', filename);
  
  res.sendFile(path.resolve(filePath), (err) => {
    if (err) {
      res.status(404).send('File not found');
    }
  });
});

module.exports = router;
