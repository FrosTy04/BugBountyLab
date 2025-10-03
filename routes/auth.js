const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getDatabase } = require('../database/init');

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Login - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Vulnerable login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = getDatabase();
  
  // VULNERABLE: SQL injection in login
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  console.log('Executing SQL:', sql);
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('auth/login', {
        title: 'Login - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'Database error occurred',
        sqlError: err.message,
        username: username
      });
    }
    
    if (rows.length > 0) {
      req.session.user = rows[0];
      res.redirect('/');
    } else {
      res.render('auth/login', {
        title: 'Login - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'Invalid username or password',
        username: username,
        sqlQuery: sql
      });
    }
  });
  
  db.close();
});

// Secure login endpoint (for comparison)
router.post('/secure-login', (req, res) => {
  const { username, password } = req.body;
  const db = getDatabase();
  
  // SECURE: Using parameterized queries
  const sql = `SELECT * FROM users WHERE username = ?`;
  
  db.get(sql, [username], (err, user) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('auth/login', {
        title: 'Login - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'Database error occurred',
        username: username
      });
    }
    
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = user;
      res.redirect('/');
    } else {
      res.render('auth/login', {
        title: 'Login - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'Invalid username or password',
        username: username
      });
    }
  });
  
  db.close();
});

// Registration page
router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'Register - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Vulnerable registration endpoint
router.post('/register', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  const db = getDatabase();
  
  if (password !== confirmPassword) {
    return res.render('auth/register', {
      title: 'Register - Bug Bounty Lab',
      user: req.session.user || null,
      error: 'Passwords do not match',
      username: username,
      email: email
    });
  }
  
  // VULNERABLE: SQL injection in registration
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${hashedPassword}')`;
  
  console.log('Executing SQL:', sql);
  
  db.run(sql, [], function(err) {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('auth/register', {
        title: 'Register - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'Database error occurred',
        sqlError: err.message,
        username: username,
        email: email
      });
    }
    
    res.render('auth/register', {
      title: 'Register - Bug Bounty Lab',
      user: req.session.user || null,
      success: 'Registration successful! You can now login.',
      sqlQuery: sql
    });
  });
  
  db.close();
});

// Password reset page
router.get('/reset-password', (req, res) => {
  res.render('auth/reset-password', {
    title: 'Reset Password - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Vulnerable password reset endpoint
router.post('/reset-password', (req, res) => {
  const { email } = req.body;
  const db = getDatabase();
  
  // VULNERABLE: SQL injection in password reset
  const sql = `SELECT * FROM users WHERE email = '${email}'`;
  
  console.log('Executing SQL:', sql);
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('auth/reset-password', {
        title: 'Reset Password - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'Database error occurred',
        sqlError: err.message,
        email: email
      });
    }
    
    if (rows.length > 0) {
      res.render('auth/reset-password', {
        title: 'Reset Password - Bug Bounty Lab',
        user: req.session.user || null,
        success: 'Password reset email sent!',
        email: email,
        sqlQuery: sql,
        userFound: true
      });
    } else {
      res.render('auth/reset-password', {
        title: 'Reset Password - Bug Bounty Lab',
        user: req.session.user || null,
        error: 'Email not found',
        email: email,
        sqlQuery: sql
      });
    }
  });
  
  db.close();
});

// JWT token generation (vulnerable)
router.get('/token', (req, res) => {
  const jwt = require('jsonwebtoken');
  const secret = 'weak-secret-key'; // VULNERABLE: Weak secret
  
  const token = jwt.sign(
    { 
      username: req.session.user?.username || 'anonymous',
      role: req.session.user?.role || 'user',
      iat: Math.floor(Date.now() / 1000)
    },
    secret,
    { expiresIn: '1h' }
  );
  
  res.render('auth/token', {
    title: 'JWT Token - Bug Bounty Lab',
    user: req.session.user || null,
    token: token,
    secret: secret
  });
});

// Session fixation vulnerability
router.get('/session-fixation', (req, res) => {
  res.render('auth/session-fixation', {
    title: 'Session Fixation - Bug Bounty Lab',
    user: req.session.user || null,
    sessionId: req.sessionID
  });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;
