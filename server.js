const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import route modules
const authRoutes = require('./routes/auth');
const sqlInjectionRoutes = require('./routes/sql-injection');
const xssRoutes = require('./routes/xss');
const fileUploadRoutes = require('./routes/file-upload');
const csrfRoutes = require('./routes/csrf');
const directoryTraversalRoutes = require('./routes/directory-traversal');
const apiRoutes = require('./routes/api');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for XSS testing
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Cookie and session middleware
app.use(cookieParser());
app.use(session({
  secret: 'bug-bounty-lab-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    httpOnly: false, // Set to true in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', dashboardRoutes);
app.use('/auth', authRoutes);
app.use('/sql-injection', sqlInjectionRoutes);
app.use('/xss', xssRoutes);
app.use('/file-upload', fileUploadRoutes);
app.use('/csrf', csrfRoutes);
app.use('/directory-traversal', directoryTraversalRoutes);
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    error: '404 - Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});

// Initialize database
const { initializeDatabase } = require('./database/init');
initializeDatabase().then(() => {
  console.log('Database initialized successfully');
}).catch(err => {
  console.error('Database initialization failed:', err);
});

app.listen(PORT, () => {
  console.log(`🐛 Bug Bounty Lab running on http://localhost:${PORT}`);
  console.log(`📚 Dashboard: http://localhost:${PORT}`);
  console.log(`🔍 Start exploring vulnerabilities!`);
});
