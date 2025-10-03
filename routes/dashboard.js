const express = require('express');
const router = express.Router();

// Dashboard route
router.get('/', (req, res) => {
  const challenges = [
    {
      id: 'sql-injection',
      title: 'SQL Injection Lab',
      description: 'Practice SQL injection attacks with various difficulty levels',
      difficulty: 'Beginner to Advanced',
      vulnerabilities: ['Union-based', 'Boolean-based', 'Time-based', 'Error-based'],
      path: '/sql-injection'
    },
    {
      id: 'xss',
      title: 'Cross-Site Scripting (XSS)',
      description: 'Learn about reflected, stored, and DOM-based XSS vulnerabilities',
      difficulty: 'Beginner to Intermediate',
      vulnerabilities: ['Reflected XSS', 'Stored XSS', 'DOM XSS'],
      path: '/xss'
    },
    {
      id: 'authentication',
      title: 'Authentication Bypass',
      description: 'Test various authentication mechanisms and bypass techniques',
      difficulty: 'Intermediate',
      vulnerabilities: ['Session Fixation', 'JWT Manipulation', 'Password Reset', 'Privilege Escalation'],
      path: '/auth'
    },
    {
      id: 'file-upload',
      title: 'File Upload Vulnerabilities',
      description: 'Practice file upload security testing and exploitation',
      difficulty: 'Intermediate to Advanced',
      vulnerabilities: ['Unrestricted Upload', 'File Type Bypass', 'Path Traversal'],
      path: '/file-upload'
    },
    {
      id: 'csrf',
      title: 'Cross-Site Request Forgery (CSRF)',
      description: 'Learn about CSRF attacks and token bypass techniques',
      difficulty: 'Intermediate',
      vulnerabilities: ['CSRF Token Bypass', 'SameSite Bypass', 'Referer Bypass'],
      path: '/csrf'
    },
    {
      id: 'directory-traversal',
      title: 'Directory Traversal',
      description: 'Practice path traversal and file inclusion vulnerabilities',
      difficulty: 'Beginner to Intermediate',
      vulnerabilities: ['Path Traversal', 'Local File Inclusion', 'Remote File Inclusion'],
      path: '/directory-traversal'
    },
    {
      id: 'api-security',
      title: 'API Security Testing',
      description: 'Test REST API security and common API vulnerabilities',
      difficulty: 'Intermediate to Advanced',
      vulnerabilities: ['Insecure Direct Object Reference', 'Mass Assignment', 'Rate Limiting Bypass'],
      path: '/api'
    }
  ];

  res.render('dashboard', { 
    title: 'Bug Bounty Lab - Dashboard',
    challenges,
    user: req.session.user || null
  });
});

module.exports = router;
