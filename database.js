/*
  This file contains the SQL script to create your 'users' table.
  Rename this file to 'database.sql' and run the script against your PostgreSQL database.
*/

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    facebook_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    picture TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);