-- +migrate Up
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    father_name VARCHAR(100),
    grandfather_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE,
    birth_place VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS persons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES persons(id) ON DELETE SET NULL,
    reference TEXT,
    designation TEXT,
    history TEXT,
    access VARCHAR(20) DEFAULT 'private',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS person_editors (
    person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (person_id, user_id)
);

CREATE INDEX idx_persons_parent_id ON persons(parent_id);
CREATE INDEX idx_persons_created_by ON persons(created_by);
CREATE INDEX idx_persons_name ON persons(name);
CREATE INDEX idx_persons_access ON persons(access);
CREATE INDEX idx_person_editors_user_id ON person_editors(user_id);
CREATE INDEX idx_persons_access_created_by ON persons(access, created_by);
