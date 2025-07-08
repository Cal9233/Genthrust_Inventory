-- Create database (run this separately if needed)
-- CREATE DATABASE inventory_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    microsoft_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email_id VARCHAR(255) UNIQUE NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    subject TEXT,
    body TEXT,
    part_numbers TEXT[], -- Array of part numbers
    status VARCHAR(50) DEFAULT 'pending', -- pending, processed, responded
    received_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    part_number VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    quantity INTEGER DEFAULT 0,
    source_sheet VARCHAR(255), -- 'accurate' or 'inaccurate'
    excel_file_id VARCHAR(255), -- Microsoft Graph file ID
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, part_number, source_sheet)
);

-- Quote responses tracking
CREATE TABLE IF NOT EXISTS quote_responses (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    response_body TEXT NOT NULL,
    template_used VARCHAR(100),
    parts_found TEXT[], -- Array of found part numbers
    parts_not_found TEXT[], -- Array of not found part numbers
    response_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Excel files tracking
CREATE TABLE IF NOT EXISTS excel_files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_id VARCHAR(255) NOT NULL, -- Microsoft Graph file ID
    file_type VARCHAR(50) NOT NULL, -- 'accurate' or 'inaccurate'
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_email_id ON quotes(email_id);
CREATE INDEX IF NOT EXISTS idx_inventory_part_number ON inventory_items(part_number);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_responses_quote_id ON quote_responses(quote_id);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_excel_files_updated_at BEFORE UPDATE ON excel_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();