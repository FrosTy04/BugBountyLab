const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Directory Traversal Lab main page
router.get('/', (req, res) => {
  res.render('directory-traversal/index', {
    title: 'Directory Traversal Lab - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Basic directory traversal
router.get('/basic', (req, res) => {
  res.render('directory-traversal/basic', {
    title: 'Basic Directory Traversal - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Vulnerable file serving
router.get('/serve', (req, res) => {
  const { file } = req.query;
  
  if (!file) {
    return res.render('directory-traversal/basic', {
      title: 'Basic Directory Traversal - Bug Bounty Lab',
      user: req.session.user || null,
      error: 'No file specified'
    });
  }

  // VULNERABLE: No path traversal protection
  const filePath = path.join('uploads', file);
  const resolvedPath = path.resolve(filePath);
  
  // Check if file exists
  fs.access(resolvedPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.render('directory-traversal/basic', {
        title: 'Basic Directory Traversal - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'File not found',
        requestedFile: file,
        resolvedPath: resolvedPath
      });
    }

    // Read file content
    fs.readFile(resolvedPath, 'utf8', (err, data) => {
      if (err) {
        return res.render('directory-traversal/basic', {
          title: 'Basic Directory Traversal - Bug Bounty Lab',
          user: req.session.user || null,
          error: 'Error reading file',
          requestedFile: file,
          resolvedPath: resolvedPath
        });
      }

      res.render('directory-traversal/basic', {
        title: 'Basic Directory Traversal - Bug Bounty Lab',
        user: req.session.user || null,
        success: 'File read successfully',
        requestedFile: file,
        resolvedPath: resolvedPath,
        fileContent: data
      });
    });
  });
});

// Local File Inclusion (LFI)
router.get('/lfi', (req, res) => {
  res.render('directory-traversal/lfi', {
    title: 'Local File Inclusion - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Vulnerable LFI endpoint
router.get('/include', (req, res) => {
  const { page } = req.query;
  
  if (!page) {
    return res.render('directory-traversal/lfi', {
      title: 'Local File Inclusion - Bug Bounty Lab',
      user: req.session.user || null,
      error: 'No page specified'
    });
  }

  // VULNERABLE: No path traversal protection
  const pagePath = path.join('views', page + '.ejs');
  const resolvedPath = path.resolve(pagePath);
  
  // Check if file exists
  fs.access(resolvedPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.render('directory-traversal/lfi', {
        title: 'Local File Inclusion - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'Page not found',
        requestedPage: page,
        resolvedPath: resolvedPath
      });
    }

    // Try to read the file
    fs.readFile(resolvedPath, 'utf8', (err, data) => {
      if (err) {
        return res.render('directory-traversal/lfi', {
          title: 'Local File Inclusion - Bug Bounty Lab',
          user: req.session.user || null,
          error: 'Error reading page',
          requestedPage: page,
          resolvedPath: resolvedPath
        });
      }

      res.render('directory-traversal/lfi', {
        title: 'Local File Inclusion - Bug Bounty Lab',
        user: req.session.user || null,
        success: 'Page included successfully',
        requestedPage: page,
        resolvedPath: resolvedPath,
        pageContent: data
      });
    });
  });
});

// Remote File Inclusion (RFI) simulation
router.get('/rfi', (req, res) => {
  res.render('directory-traversal/rfi', {
    title: 'Remote File Inclusion - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Vulnerable RFI endpoint (simulated)
router.get('/remote-include', (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.render('directory-traversal/rfi', {
      title: 'Remote File Inclusion - Bug Bounty Lab',
      user: req.session.user || null,
      error: 'No URL specified'
    });
  }

  // VULNERABLE: No URL validation
  res.render('directory-traversal/rfi', {
    title: 'Remote File Inclusion - Bug Bounty Lab',
    user: req.session.user || null,
    warning: 'RFI attempt detected',
    requestedUrl: url,
    note: 'In a real scenario, this would attempt to include content from the remote URL'
  });
});

// File download with traversal
router.get('/download', (req, res) => {
  res.render('directory-traversal/download', {
    title: 'File Download Traversal - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Vulnerable file download
router.get('/download-file', (req, res) => {
  const { file } = req.query;
  
  if (!file) {
    return res.status(400).send('No file specified');
  }

  // VULNERABLE: No path traversal protection
  const filePath = path.join('uploads', file);
  const resolvedPath = path.resolve(filePath);
  
  // Check if file exists
  fs.access(resolvedPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }

    // Send file
    res.download(resolvedPath, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Download failed');
      }
    });
  });
});

// Advanced traversal techniques
router.get('/advanced', (req, res) => {
  res.render('directory-traversal/advanced', {
    title: 'Advanced Directory Traversal - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Multiple traversal techniques
router.get('/multi-traversal', (req, res) => {
  const { file } = req.query;
  
  if (!file) {
    return res.render('directory-traversal/advanced', {
      title: 'Advanced Directory Traversal - Bug Bounty Lab',
      user: req.session.user || null,
      error: 'No file specified'
    });
  }

  // VULNERABLE: Multiple traversal techniques
  let filePath = file;
  
  // Basic traversal
  if (file.includes('../')) {
    filePath = path.join('uploads', file);
  }
  // URL encoding
  else if (file.includes('%2e%2e%2f')) {
    filePath = path.join('uploads', decodeURIComponent(file));
  }
  // Double encoding
  else if (file.includes('%252e%252e%252f')) {
    filePath = path.join('uploads', decodeURIComponent(decodeURIComponent(file)));
  }
  // Null byte injection
  else if (file.includes('%00')) {
    filePath = path.join('uploads', file.replace(/%00/g, ''));
  }
  else {
    filePath = path.join('uploads', file);
  }

  const resolvedPath = path.resolve(filePath);
  
  fs.access(resolvedPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.render('directory-traversal/advanced', {
        title: 'Advanced Directory Traversal - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'File not found',
        requestedFile: file,
        processedFile: filePath,
        resolvedPath: resolvedPath
      });
    }

    fs.readFile(resolvedPath, 'utf8', (err, data) => {
      if (err) {
        return res.render('directory-traversal/advanced', {
          title: 'Advanced Directory Traversal - Bug Bounty Lab',
          user: req.session.user || null,
          error: 'Error reading file',
          requestedFile: file,
          processedFile: filePath,
          resolvedPath: resolvedPath
        });
      }

      res.render('directory-traversal/advanced', {
        title: 'Advanced Directory Traversal - Bug Bounty Lab',
        user: req.session.user || null,
        success: 'File read successfully',
        requestedFile: file,
        processedFile: filePath,
        resolvedPath: resolvedPath,
        fileContent: data
      });
    });
  });
});

module.exports = router;
