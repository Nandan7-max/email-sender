-- Run this in your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    request TEXT,
    to_email TEXT,
    subject TEXT,
    body TEXT,
    status TEXT NOT NULL,
    error TEXT
);
