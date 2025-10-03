const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'vulnerable.db');

// Initialize database
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    // Create tables
    const createTables = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Posts table for XSS testing
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
      );

      -- Comments table
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        author_name VARCHAR(100),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts (id)
      );

      -- Products table for SQL injection testing
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      );

      -- Sessions table for session management
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(128) PRIMARY KEY,
        user_id INTEGER,
        data TEXT,
        expires INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      -- Files table for file upload tracking
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        uploaded_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users (id)
      );
    `;

    db.exec(createTables, (err) => {
      if (err) {
        console.error('Error creating tables:', err.message);
        reject(err);
        return;
      }
      console.log('Tables created successfully');
      
      // Insert sample data
      insertSampleData(db).then(() => {
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
            reject(err);
          } else {
            console.log('Database initialization completed');
            resolve();
          }
        });
      }).catch(reject);
    });
  });
}

// Insert sample data
async function insertSampleData(db) {
  return new Promise((resolve, reject) => {
    // Hash passwords
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const adminPassword = bcrypt.hashSync('admin123', 10);

    const sampleData = `
      -- Insert users
      INSERT OR IGNORE INTO users (username, email, password, role) VALUES
      ('admin', 'admin@bugbountylab.com', '${adminPassword}', 'admin'),
      ('testuser', 'test@bugbountylab.com', '${hashedPassword}', 'user'),
      ('john_doe', 'john@example.com', '${hashedPassword}', 'user'),
      ('jane_smith', 'jane@example.com', '${hashedPassword}', 'user');

      -- Insert products
      INSERT OR IGNORE INTO products (name, description, price, category, stock) VALUES
      ('Laptop Pro', 'High-performance laptop for developers', 1299.99, 'Electronics', 50),
      ('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 'Electronics', 100),
      ('Mechanical Keyboard', 'RGB mechanical keyboard', 149.99, 'Electronics', 75),
      ('Webcam HD', '1080p webcam for video calls', 79.99, 'Electronics', 30),
      ('Gaming Chair', 'Comfortable gaming chair', 299.99, 'Furniture', 25),
      ('Desk Lamp', 'LED desk lamp with USB charging', 49.99, 'Furniture', 60);

      -- Insert posts
      INSERT OR IGNORE INTO posts (title, content, author_id) VALUES
      ('Welcome to Bug Bounty Lab', 'This is a safe environment to practice web application security testing.', 1),
      ('SQL Injection Basics', 'Learn the fundamentals of SQL injection attacks and how to prevent them.', 1),
      ('XSS Prevention Guide', 'Cross-site scripting vulnerabilities and mitigation techniques.', 1);

      -- Insert comments
      INSERT OR IGNORE INTO comments (post_id, author_name, content) VALUES
      (1, 'Security Researcher', 'Great lab for learning!'),
      (1, 'Bug Hunter', 'Very educational content.'),
      (2, 'Developer', 'SQL injection is still a major threat.'),
      (3, 'Security Analyst', 'XSS can be tricky to prevent completely.');
    `;

    db.exec(sampleData, (err) => {
      if (err) {
        console.error('Error inserting sample data:', err.message);
        reject(err);
        return;
      }
      console.log('Sample data inserted successfully');
      resolve();
    });
  });
}

// Get database connection
function getDatabase() {
  return new sqlite3.Database(dbPath);
}

module.exports = {
  initializeDatabase,
  getDatabase
};
