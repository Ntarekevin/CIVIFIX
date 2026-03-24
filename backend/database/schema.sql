-- Database Setup for CIVIFIX
-- Run this script as a superuser (e.g., postgres) to initialize the database

-- 1. Create the database and user
-- The following lines are commented out as they need to be run separately before connecting to the database
-- CREATE DATABASE civicfix_db;
-- CREATE USER civicfix_user WITH PASSWORD 'secure_password_here';
-- GRANT ALL PRIVILEGES ON DATABASE civicfix_db TO civicfix_user;

-- Enable pgcrypto extensions (run while connected to civicfix_db)
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- For encryption (pgp_sym_encrypt/decrypt)

-- 2. Create users table (Authorities)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Stored securely with bcrypt
    role VARCHAR(50) DEFAULT 'authority',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create locations table (Separate for easier querying and geospatial features)
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    address TEXT,
    city VARCHAR(100),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create reports table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    contact_info_encrypted BYTEA,
    location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    tracking_token VARCHAR(64) UNIQUE NOT NULL,
    public_id VARCHAR(20) UNIQUE,              -- Anonymous ID like #24A102I07
    status VARCHAR(50) DEFAULT 'open',          -- open, in-progress, resolved, rejected
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL, -- NEW: assign report to authority
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Index for fast token lookups
CREATE INDEX idx_reports_tracking_token ON reports(tracking_token);
CREATE INDEX idx_reports_public_id ON reports(public_id);

-- 5. Create media table
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50), 
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create report_status table (audit trail)
CREATE TABLE report_status_history (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6.5 Create audit_log table for all authority actions
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Enable Row-Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public can insert reports (anonymous reporting)
CREATE POLICY insert_reports_public ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY insert_locations_public ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY insert_media_public ON media FOR INSERT WITH CHECK (true);

-- Public can view obfuscated/anonymized version (We handle obfuscation in app layer or via views)
-- For the table itself, allow read access to open reports. 
CREATE POLICY select_reports_public ON reports FOR SELECT USING (true);
CREATE POLICY select_locations_public ON locations FOR SELECT USING (true);
CREATE POLICY select_media_public ON media FOR SELECT USING (true);


-- Authorities (users with role) can do all. 
-- In a real RLS setup reliant on current_user or JWT claims:
-- CREATE POLICY all_reports_auth ON reports FOR ALL USING (current_user = 'civicfix_user');
-- 8. Create likes table (Stars)
CREATE TABLE report_likes (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    ip_address VARCHAR(45), -- Track by IP for anonymous stars
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_id, ip_address)
);

-- 9. Create comments table
CREATE TABLE report_comments (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name VARCHAR(100) DEFAULT 'Anonymous',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_report_likes_report_id ON report_likes(report_id);
CREATE INDEX idx_report_comments_report_id ON report_comments(report_id);
-- 10. Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'mention', 'alert', 'share', 'resolved'
    content TEXT NOT NULL,
    is_unread BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
