const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// CSRF Lab main page
router.get('/', (req, res) => {
  res.render('csrf/index', {
    title: 'CSRF Lab - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Basic CSRF vulnerability
router.get('/basic', (req, res) => {
  res.render('csrf/basic', {
    title: 'Basic CSRF - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Vulnerable profile update (no CSRF protection)
router.post('/update-profile', (req, res) => {
  const { name, email } = req.body;
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const db = getDatabase();
  const sql = `UPDATE users SET username = ?, email = ? WHERE id = ?`;
  
  db.run(sql, [name, email, req.session.user.id], function(err) {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Update session
    req.session.user.username = name;
    req.session.user.email = email;
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: req.session.user
    });
  });
  
  db.close();
});

// CSRF with token (but vulnerable implementation)
router.get('/token', (req, res) => {
  // Generate a weak CSRF token
  const csrfToken = Math.random().toString(36).substring(2, 15);
  req.session.csrfToken = csrfToken;
  
  res.render('csrf/token', {
    title: 'CSRF with Token - Bug Bounty Lab',
    user: req.session.user || null,
    csrfToken: csrfToken
  });
});

// Vulnerable token validation
router.post('/update-with-token', (req, res) => {
  const { name, email, csrfToken } = req.body;
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // VULNERABLE: Weak token validation
  if (csrfToken !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  const db = getDatabase();
  const sql = `UPDATE users SET username = ?, email = ? WHERE id = ?`;
  
  db.run(sql, [name, email, req.session.user.id], function(err) {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    req.session.user.username = name;
    req.session.user.email = email;
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: req.session.user
    });
  });
  
  db.close();
});

// CSRF with SameSite bypass
router.get('/samesite', (req, res) => {
  res.render('csrf/samesite', {
    title: 'SameSite CSRF Bypass - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// CSRF with Referer bypass
router.get('/referer', (req, res) => {
  res.render('csrf/referer', {
    title: 'Referer CSRF Bypass - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Vulnerable endpoint that checks Referer
router.post('/update-with-referer', (req, res) => {
  const { name, email } = req.body;
  const referer = req.get('Referer');
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // VULNERABLE: Basic referer check that can be bypassed
  if (!referer || !referer.includes('bugbountylab.com')) {
    return res.status(403).json({ error: 'Invalid referer' });
  }

  const db = getDatabase();
  const sql = `UPDATE users SET username = ?, email = ? WHERE id = ?`;
  
  db.run(sql, [name, email, req.session.user.id], function(err) {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    req.session.user.username = name;
    req.session.user.email = email;
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: req.session.user
    });
  });
  
  db.close();
});

// CSRF demonstration page
router.get('/demo', (req, res) => {
  res.render('csrf/demo', {
    title: 'CSRF Demonstration - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Money transfer (high-value target)
router.post('/transfer', (req, res) => {
  const { to, amount } = req.body;
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // VULNERABLE: No CSRF protection on money transfer
  res.json({ 
    success: true, 
    message: `Transferred $${amount} to ${to}`,
    transaction: {
      from: req.session.user.username,
      to: to,
      amount: amount,
      timestamp: new Date().toISOString()
    }
  });
});

// Admin action (privilege escalation)
router.post('/admin-action', (req, res) => {
  const { action, target } = req.body;
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // VULNERABLE: No CSRF protection on admin actions
  res.json({ 
    success: true, 
    message: `Admin action '${action}' performed on '${target}'`,
    admin: req.session.user.username,
    action: action,
    target: target,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
