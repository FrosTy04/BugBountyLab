#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🐛 Bug Bounty Lab Setup Script');
console.log('================================\n');

// Create necessary directories
const directories = [
  'uploads',
  'database',
  'public/css',
  'public/js',
  'public/images',
  'views/sql-injection',
  'views/xss',
  'views/auth',
  'views/file-upload',
  'views/csrf',
  'views/directory-traversal',
  'views/api'
];

console.log('📁 Creating directories...');
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`   ✓ Created: ${dir}`);
  } else {
    console.log(`   - Exists: ${dir}`);
  }
});

// Create sample files for testing
console.log('\n📄 Creating sample files...');

// Sample upload files
const sampleFiles = [
  {
    path: 'uploads/sample.txt',
    content: 'This is a sample text file for testing file upload vulnerabilities.'
  },
  {
    path: 'uploads/test.jpg',
    content: 'This is a fake image file for testing file type validation.'
  },
  {
    path: 'uploads/script.js',
    content: 'alert("This is a test JavaScript file for XSS testing");'
  }
];

sampleFiles.forEach(file => {
  if (!fs.existsSync(file.path)) {
    fs.writeFileSync(file.path, file.content);
    console.log(`   ✓ Created: ${file.path}`);
  }
});

// Create .gitignore
const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*

# Database
database/*.db
database/*.sqlite

# Uploads
uploads/*
!uploads/.gitkeep

# Environment
.env
.env.local

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
*.temp
`;

if (!fs.existsSync('.gitignore')) {
  fs.writeFileSync('.gitignore', gitignoreContent);
  console.log('   ✓ Created: .gitignore');
}

// Create .gitkeep for uploads directory
if (!fs.existsSync('uploads/.gitkeep')) {
  fs.writeFileSync('uploads/.gitkeep', '');
  console.log('   ✓ Created: uploads/.gitkeep');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('   ✓ Dependencies installed successfully');
} catch (error) {
  console.error('   ✗ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create environment file
const envContent = `# Bug Bounty Lab Environment Configuration
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
`;

if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', envContent);
  console.log('   ✓ Created: .env');
}

// Create startup script
const startScript = `#!/bin/bash
echo "🐛 Starting Bug Bounty Lab..."
echo "================================"
echo ""
echo "Initializing database..."
node -e "const { initializeDatabase } = require('./database/init'); initializeDatabase().then(() => console.log('Database ready')).catch(console.error);"
echo ""
echo "Starting server..."
npm start
`;

if (!fs.existsSync('start.sh')) {
  fs.writeFileSync('start.sh', startScript);
  fs.chmodSync('start.sh', '755');
  console.log('   ✓ Created: start.sh');
}

// Create Windows batch file
const startBatch = `@echo off
echo 🐛 Starting Bug Bounty Lab...
echo ================================
echo.
echo Initializing database...
node -e "const { initializeDatabase } = require('./database/init'); initializeDatabase().then(() => console.log('Database ready')).catch(console.error);"
echo.
echo Starting server...
npm start
`;

if (!fs.existsSync('start.bat')) {
  fs.writeFileSync('start.bat', startBatch);
  console.log('   ✓ Created: start.bat');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('   1. Run: npm start');
console.log('   2. Open: http://localhost:3000');
console.log('   3. Start exploring vulnerabilities!');
console.log('\n🔧 Alternative startup methods:');
console.log('   - Windows: start.bat');
console.log('   - Linux/Mac: ./start.sh');
console.log('   - Docker: docker-compose up -d');
console.log('\n📚 Documentation:');
console.log('   - README.md - Overview and instructions');
console.log('   - Each lab has detailed explanations and payloads');
console.log('\n⚠️  Remember: This is for educational purposes only!');
console.log('   Never test these techniques on systems you don\'t own.');
