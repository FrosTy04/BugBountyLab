const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// SQL Injection Lab main page
router.get('/', (req, res) => {
  res.render('sql-injection/index', {
    title: 'SQL Injection Lab - Bug Bounty Lab',
    user: req.session.user || null
  });
});

// Basic SQL Injection - Product Search
router.get('/search', (req, res) => {
  res.render('sql-injection/search', {
    title: 'Product Search - SQL Injection',
    user: req.session.user || null
  });
});

// Vulnerable search endpoint
router.post('/search', (req, res) => {
  const { query } = req.body;
  const db = getDatabase();
  
  // VULNERABLE: Direct string concatenation - NO parameterized queries
  const sql = `SELECT * FROM products WHERE name LIKE '%${query}%' OR description LIKE '%${query}%'`;
  
  console.log('Executing SQL:', sql); // Log for educational purposes
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('sql-injection/search', {
        title: 'Product Search - SQL Injection',
        user: req.session.user || null,
        error: 'Database error occurred',
        sqlError: err.message,
        query: query
      });
    }
    
    res.render('sql-injection/search', {
      title: 'Product Search - SQL Injection',
      user: req.session.user || null,
      products: rows,
      query: query,
      sqlQuery: sql
    });
  });
  
  db.close();
});

// Union-based SQL Injection
router.get('/union', (req, res) => {
  res.render('sql-injection/union', {
    title: 'Union-based SQL Injection',
    user: req.session.user || null
  });
});

router.post('/union', (req, res) => {
  const { id } = req.body;
  const db = getDatabase();
  
  // VULNERABLE: Union-based injection
  const sql = `SELECT id, name, description, price FROM products WHERE id = ${id}`;
  
  console.log('Executing SQL:', sql);
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('sql-injection/union', {
        title: 'Union-based SQL Injection',
        user: req.session.user || null,
        error: 'Database error occurred',
        sqlError: err.message,
        id: id
      });
    }
    
    res.render('sql-injection/union', {
      title: 'Union-based SQL Injection',
      user: req.session.user || null,
      products: rows,
      id: id,
      sqlQuery: sql
    });
  });
  
  db.close();
});

// Boolean-based Blind SQL Injection
router.get('/boolean', (req, res) => {
  res.render('sql-injection/boolean', {
    title: 'Boolean-based Blind SQL Injection',
    user: req.session.user || null
  });
});

router.post('/boolean', (req, res) => {
  const { username, password } = req.body;
  const db = getDatabase();
  
  // VULNERABLE: Boolean-based blind injection
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  console.log('Executing SQL:', sql);
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('sql-injection/boolean', {
        title: 'Boolean-based Blind SQL Injection',
        user: req.session.user || null,
        error: 'Database error occurred',
        sqlError: err.message,
        username: username
      });
    }
    
    const exists = rows.length > 0;
    
    res.render('sql-injection/boolean', {
      title: 'Boolean-based Blind SQL Injection',
      user: req.session.user || null,
      exists: exists,
      username: username,
      sqlQuery: sql,
      message: exists ? 'User exists!' : 'User does not exist.'
    });
  });
  
  db.close();
});

// Time-based Blind SQL Injection
router.get('/time', (req, res) => {
  res.render('sql-injection/time', {
    title: 'Time-based Blind SQL Injection',
    user: req.session.user || null
  });
});

router.post('/time', (req, res) => {
  const { id } = req.body;
  const db = getDatabase();
  
  // VULNERABLE: Time-based blind injection
  const sql = `SELECT * FROM products WHERE id = ${id}`;
  
  console.log('Executing SQL:', sql);
  
  const startTime = Date.now();
  
  db.all(sql, [], (err, rows) => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('sql-injection/time', {
        title: 'Time-based Blind SQL Injection',
        user: req.session.user || null,
        error: 'Database error occurred',
        sqlError: err.message,
        id: id,
        responseTime: responseTime
      });
    }
    
    res.render('sql-injection/time', {
      title: 'Time-based Blind SQL Injection',
      user: req.session.user || null,
      products: rows,
      id: id,
      sqlQuery: sql,
      responseTime: responseTime
    });
  });
  
  db.close();
});

// Error-based SQL Injection
router.get('/error', (req, res) => {
  res.render('sql-injection/error', {
    title: 'Error-based SQL Injection',
    user: req.session.user || null
  });
});

router.post('/error', (req, res) => {
  const { id } = req.body;
  const db = getDatabase();
  
  // VULNERABLE: Error-based injection
  const sql = `SELECT * FROM products WHERE id = ${id}`;
  
  console.log('Executing SQL:', sql);
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('sql-injection/error', {
        title: 'Error-based SQL Injection',
        user: req.session.user || null,
        error: 'Database error occurred',
        sqlError: err.message,
        id: id,
        sqlQuery: sql
      });
    }
    
    res.render('sql-injection/error', {
      title: 'Error-based SQL Injection',
      user: req.session.user || null,
      products: rows,
      id: id,
      sqlQuery: sql
    });
  });
  
  db.close();
});

// Advanced SQL Injection - Multi-step
router.get('/advanced', (req, res) => {
  res.render('sql-injection/advanced', {
    title: 'Advanced SQL Injection Techniques',
    user: req.session.user || null
  });
});

router.post('/advanced', (req, res) => {
  const { query } = req.body;
  const db = getDatabase();
  
  // VULNERABLE: Advanced injection with multiple tables
  const sql = `SELECT p.*, u.username as seller FROM products p LEFT JOIN users u ON p.id = u.id WHERE p.name LIKE '%${query}%'`;
  
  console.log('Executing SQL:', sql);
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.render('sql-injection/advanced', {
        title: 'Advanced SQL Injection Techniques',
        user: req.session.user || null,
        error: 'Database error occurred',
        sqlError: err.message,
        query: query
      });
    }
    
    res.render('sql-injection/advanced', {
      title: 'Advanced SQL Injection Techniques',
      user: req.session.user || null,
      products: rows,
      query: query,
      sqlQuery: sql
    });
  });
  
  db.close();
});

module.exports = router;
