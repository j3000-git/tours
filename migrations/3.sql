
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using a simple hash
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('admin', 'c3VwZXJzZWNyZXRhZG1pbjEyMw==', 'admin@saudiscape.com');
