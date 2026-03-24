-- Create a mentions table for tagging authorities
CREATE TABLE IF NOT EXISTS report_mentions (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    authority_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_id, authority_id)
);

-- Update users table constraints and columns
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'resident', 'official', 'authority'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS official_title VARCHAR(255);
