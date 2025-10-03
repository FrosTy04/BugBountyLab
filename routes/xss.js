const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// XSS Lab main page
router.get('/', (req, res) => {
  res.render('xss/index', {
    title: 'XSS Lab - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Reflected XSS
router.get('/reflected', (req, res) => {
  const { name, message } = req.query;
  
  res.render('xss/reflected', {
    title: 'Reflected XSS - Bug Bounty Lab',
    user: req.session.user || null,
    name: name || '',
    message: message || ''
  });
});

// Stored XSS - Comments
router.get('/stored', (req, res) => {
  const db = getDatabase();
  
  // Get all comments
  const sql = `SELECT * FROM comments ORDER BY created_at DESC`;
  
  db.all(sql, [], (err, comments) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('xss/stored', {
        title: 'Stored XSS - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'Database error occurred',
        comments: []
      });
    }
    
    res.render('xss/stored', {
      title: 'Stored XSS - Bug Bounty Lab',
      user: req.session.user || null,
      comments: comments || []
    });
  });
  
  db.close();
});

// Store comment (vulnerable to stored XSS)
router.post('/stored', (req, res) => {
  const { author_name, content } = req.body;
  const db = getDatabase();
  
  // VULNERABLE: No input sanitization
  const sql = `INSERT INTO comments (author_name, content) VALUES (?, ?)`;
  
  db.run(sql, [author_name, content], function(err) {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('xss/stored', {
        title: 'Stored XSS - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'Database error occurred',
        comments: []
      });
    }
    
    res.redirect('/xss/stored');
  });
  
  db.close();
});

// DOM-based XSS
router.get('/dom', (req, res) => {
  res.render('xss/dom', {
    title: 'DOM-based XSS - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Filter bypass XSS
router.get('/filter-bypass', (req, res) => {
  const { input } = req.query;
  
  // VULNERABLE: Basic filter that can be bypassed
  let filteredInput = input || '';
  
  // Basic filter attempts
  filteredInput = filteredInput.replace(/<script>/gi, '');
  filteredInput = filteredInput.replace(/<\/script>/gi, '');
  filteredInput = filteredInput.replace(/javascript:/gi, '');
  
  res.render('xss/filter-bypass', {
    title: 'Filter Bypass XSS - Bug Bounty Lab',
    user: req.session.user || null,
    input: input || '',
    filteredInput: filteredInput
  });
});

// Cookie-based XSS
router.get('/cookie', (req, res) => {
  const { cookie_name, cookie_value } = req.query;
  
  if (cookie_name && cookie_value) {
    res.cookie(cookie_name, cookie_value, { 
      httpOnly: false, // VULNERABLE: httpOnly should be true
      secure: false,   // VULNERABLE: secure should be true in production
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }
  
  res.render('xss/cookie', {
    title: 'Cookie-based XSS - Bug Bounty Lab',
    user: req.session.user || null,
    cookies: req.cookies,
    cookie_name: cookie_name || '',
    cookie_value: cookie_value || ''
  });
});

// JSON-based XSS
router.get('/json', (req, res) => {
  const { data } = req.query;
  
  let jsonData = {};
  if (data) {
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      jsonData = { error: 'Invalid JSON' };
    }
  }
  
  res.render('xss/json', {
    title: 'JSON-based XSS - Bug Bounty Lab',
    user: req.session.user || null,
    data: data || '',
    jsonData: jsonData
  });
});

// AJAX XSS
router.get('/ajax', (req, res) => {
  res.render('xss/ajax', {
    title: 'AJAX XSS - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// AJAX endpoint
router.post('/ajax', (req, res) => {
  const { search } = req.body;
  
  // VULNERABLE: No sanitization
  res.json({
    success: true,
    results: [
      { id: 1, name: `Search result for: ${search}`, description: 'This is a test result' },
      { id: 2, name: `Another result: ${search}`, description: 'Another test result' }
    ]
  });
});

module.exports = router;
