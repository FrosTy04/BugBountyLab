const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// API Lab main page
router.get('/', (req, res) => {
  res.render('api/index', {
    title: 'API Security Lab - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Insecure Direct Object Reference (IDOR)
router.get('/idor', (req, res) => {
  res.render('api/idor', {
    title: 'IDOR - API Security Lab',
    user: req.session.user || null
  });
});

// Vulnerable user profile endpoint
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const db = getDatabase();
  
  // VULNERABLE: No authorization check
  const sql = `SELECT id, username, email, role FROM users WHERE id = ?`;
  
  db.get(sql, [userId], (err, user) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: user
    });
  });
  
  db.close();
});

// Mass assignment vulnerability
router.get('/mass-assignment', (req, res) => {
  res.render('api/mass-assignment', {
    title: 'Mass Assignment - API Security Lab',
    user: req.session.user || null
  });
});

// Vulnerable user update endpoint
router.put('/user/:id', (req, res) => {
  const userId = req.params.id;
  const updates = req.body;
  const db = getDatabase();
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // VULNERABLE: Mass assignment - no field filtering
  const allowedFields = ['username', 'email'];
  const updateFields = [];
  const updateValues = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      updateValues.push(value);
    } else {
      // VULNERABLE: This allows updating any field
      updateFields.push(`${key} = ?`);
      updateValues.push(value);
    }
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  updateValues.push(userId);
  const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
  
  db.run(sql, updateValues, function(err) {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      changes: this.changes
    });
  });
  
  db.close();
});

// Rate limiting bypass
router.get('/rate-limit', (req, res) => {
  res.render('api/rate-limit', {
    title: 'Rate Limiting Bypass - API Security Lab',
    user: req.session.user || null
  });
});

// Vulnerable rate limiting
let requestCounts = {};

router.get('/api/limited', (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // VULNERABLE: Rate limiting can be bypassed
  if (!requestCounts[clientIP]) {
    requestCounts[clientIP] = { count: 0, resetTime: now + 60000 }; // 1 minute
  }
  
  const clientData = requestCounts[clientIP];
  
  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + 60000;
  }
  
  clientData.count++;
  
  if (clientData.count > 10) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      resetTime: new Date(clientData.resetTime).toISOString()
    });
  }
  
  res.json({
    success: true,
    message: 'Request processed',
    remaining: 10 - clientData.count,
    resetTime: new Date(clientData.resetTime).toISOString()
  });
});

// API key authentication bypass
router.get('/api-key', (req, res) => {
  res.render('api/api-key', {
    title: 'API Key Bypass - API Security Lab',
    user: req.session.user || null
  });
});

// Vulnerable API key validation
router.get('/api/protected', (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  // VULNERABLE: Weak API key validation
  const validApiKeys = ['test123', 'demo456', 'admin789'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  if (!validApiKeys.includes(apiKey)) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  res.json({
    success: true,
    message: 'Access granted',
    data: {
      secret: 'This is sensitive data that should be protected',
      timestamp: new Date().toISOString()
    }
  });
});

// JWT token manipulation
router.get('/jwt', (req, res) => {
  res.render('api/jwt', {
    title: 'JWT Manipulation - API Security Lab',
    user: req.session.user || null
  });
});

// Vulnerable JWT validation
router.get('/api/jwt-protected', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Bearer token required' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const jwt = require('jsonwebtoken');
    const secret = 'weak-secret-key'; // VULNERABLE: Weak secret
    
    // VULNERABLE: No algorithm verification
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256', 'none'] });
    
    res.json({
      success: true,
      message: 'JWT validated successfully',
      user: decoded
    });
  } catch (err) {
    res.status(403).json({ 
      error: 'Invalid JWT token',
      details: err.message
    });
  }
});

// CORS misconfiguration
router.get('/cors', (req, res) => {
  res.render('api/cors', {
    title: 'CORS Misconfiguration - API Security Lab',
    user: req.session.user || null
  });
});

// Vulnerable CORS configuration
router.get('/api/cors-data', (req, res) => {
  const origin = req.headers.origin;
  
  // VULNERABLE: Overly permissive CORS
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  
  res.json({
    success: true,
    message: 'CORS data retrieved',
    data: {
      sensitive: 'This data should not be accessible from other origins',
      timestamp: new Date().toISOString()
    }
  });
});

// OPTIONS request for CORS
router.options('/api/cors-data', (req, res) => {
  const origin = req.headers.origin;
  
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  
  res.sendStatus(200);
});

// API enumeration
router.get('/enumeration', (req, res) => {
  res.render('api/enumeration', {
    title: 'API Enumeration - API Security Lab',
    user: req.session.user || null
  });
});

// Hidden API endpoints
router.get('/api/admin/users', (req, res) => {
  const db = getDatabase();
  
  const sql = `SELECT id, username, email, role FROM users`;
  
  db.all(sql, [], (err, users) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      success: true,
      users: users
    });
  });
  
  db.close();
});

// API versioning issues
router.get('/api/v1/users', (req, res) => {
  res.json({
    success: true,
    version: 'v1',
    message: 'This is version 1 of the API',
    deprecated: true
  });
});

router.get('/api/v2/users', (req, res) => {
  res.json({
    success: true,
    version: 'v2',
    message: 'This is version 2 of the API',
    deprecated: false
  });
});

module.exports = router;
