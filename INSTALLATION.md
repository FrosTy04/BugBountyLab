# Bug Bounty Lab - Installation Guide

This guide will help you set up the Bug Bounty Lab on your system.

## 📋 Prerequisites

Before installing the Bug Bounty Lab, ensure you have the following installed:

### Required Software

1. **Node.js** (version 14 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

### Optional Software

3. **Docker** (for containerized deployment)
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify installation: `docker --version`

4. **Git** (for version control)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

## 🚀 Installation Methods

### Method 1: Manual Installation (Recommended)

1. **Clone or Download the Project**
   ```bash
   # If using Git
   git clone <repository-url>
   cd bug-bounty-lab
   
   # Or download and extract the ZIP file
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Initialize the Database**
   ```bash
   node -e "const { initializeDatabase } = require('./database/init'); initializeDatabase().then(() => console.log('Database ready')).catch(console.error);"
   ```

4. **Start the Application**
   ```bash
   npm start
   ```

5. **Access the Lab**
   - Open your browser and go to: http://localhost:3000

### Method 2: Docker Installation

1. **Build and Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the Lab**
   - Open your browser and go to: http://localhost:3000

### Method 3: Automated Setup Script

1. **Run the Setup Script**
   ```bash
   node setup.js
   ```

2. **Start the Application**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Bug Bounty Lab Environment Configuration
NODE_ENV=development
PORT=3000

# Database
DB_PATH=./database/vulnerable.db

# Session Secret (Change in production)
SESSION_SECRET=bug-bounty-lab-secret-key-change-in-production

# JWT Secret (Change in production)
JWT_SECRET=weak-secret-key

# Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security Settings (Disabled for testing)
HELMET_ENABLED=false
CORS_ENABLED=true
```

### Database Configuration

The lab uses SQLite by default. The database file will be created automatically at `./database/vulnerable.db`.

To use a different database:
1. Modify the database configuration in `database/init.js`
2. Update the connection string in your environment variables

## 🐛 Troubleshooting

### Common Issues

#### Node.js Not Found
**Error:** `'node' is not recognized as the name of a cmdlet, function, script file, or operable program`

**Solution:**
1. Download and install Node.js from https://nodejs.org/
2. Restart your command prompt/terminal
3. Verify installation with `node --version`

#### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
1. Change the port in your `.env` file: `PORT=3001`
2. Or stop the process using port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   ```

#### Database Connection Issues
**Error:** `SQLITE_CANTOPEN: unable to open database file`

**Solution:**
1. Ensure the `database` directory exists
2. Check file permissions
3. Run the database initialization manually:
   ```bash
   node -e "const { initializeDatabase } = require('./database/init'); initializeDatabase().then(() => console.log('Database ready')).catch(console.error);"
   ```

#### Module Not Found
**Error:** `Cannot find module 'express'`

**Solution:**
1. Install dependencies: `npm install`
2. Check if `node_modules` directory exists
3. Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Windows-Specific Issues

#### PowerShell Execution Policy
**Error:** `cannot be loaded because running scripts is disabled on this system`

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Long Path Names
**Error:** `ENAMETOOLONG: name too long`

**Solution:**
1. Enable long path support in Windows 10/11
2. Or move the project to a shorter path (e.g., `C:\lab\`)

### Linux/Mac-Specific Issues

#### Permission Denied
**Error:** `EACCES: permission denied`

**Solution:**
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Port Permission
**Error:** `EACCES: permission denied, bind :::3000`

**Solution:**
```bash
# Use a different port
export PORT=3001
npm start
```

## 🔍 Verification

After installation, verify everything is working:

1. **Check Server Status**
   - Visit http://localhost:3000
   - You should see the Bug Bounty Lab dashboard

2. **Test Database Connection**
   - Try accessing any lab section
   - Check browser console for errors

3. **Test File Uploads**
   - Go to File Upload Lab
   - Try uploading a test file

4. **Test Vulnerabilities**
   - Try the SQL injection lab with basic payloads
   - Test XSS with simple scripts

## 📚 Next Steps

1. **Read the Documentation**
   - `README.md` - Overview and quick start
   - `CHALLENGES.md` - Detailed challenge guide
   - `INSTALLATION.md` - This installation guide

2. **Start Learning**
   - Begin with the SQL Injection Lab
   - Progress through XSS challenges
   - Practice with authentication bypasses

3. **Customize the Lab**
   - Modify vulnerability difficulty
   - Add new challenges
   - Update payloads and examples

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. **Check the Logs**
   - Look at the console output for error messages
   - Check browser developer tools for client-side errors

2. **Verify Prerequisites**
   - Ensure Node.js and npm are properly installed
   - Check that all dependencies are installed

3. **Reset the Environment**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again
   - Restart the application

4. **Check File Permissions**
   - Ensure the application has read/write access to the project directory
   - Check that the database directory is writable

## ⚠️ Security Notice

Remember that this lab is designed for educational purposes only:

- Never use these techniques on systems you don't own
- Always follow responsible disclosure practices
- Ensure you have proper authorization before testing any system
- Keep the lab environment isolated from production systems

## 🎯 Success!

Once everything is working, you should see the Bug Bounty Lab dashboard with various vulnerability categories. Start exploring and learning!

Happy Hunting! 🐛
