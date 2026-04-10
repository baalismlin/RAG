# PostgreSQL

## Overview

PostgreSQL is a powerful, open-source object-relational database system with over 35 years of active development. It has earned a strong reputation for reliability, feature robustness, and performance. Known for its extensibility and standards compliance, PostgreSQL is widely used for complex, high-volume operations.

## Key Features

### ACID Compliance

PostgreSQL ensures full ACID (Atomicity, Consistency, Isolation, Durability) compliance for reliable transaction processing.

### Extensibility

- Custom data types
- Custom functions
- Custom operators
- Custom aggregates
- Custom index methods
- Custom extensions

### Advanced Data Types

- Arrays
- JSON/JSONB
- XML
- Hstore (key-value store)
- Geometric types
- Custom composite types
- Range types
- UUID
- Network address types

## Basic Operations

### Creating Databases and Tables

```sql
-- Create database
CREATE DATABASE myapp;

-- Create table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table with constraints
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    tags TEXT[],
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);
```

### CRUD Operations

```sql
-- Insert
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('john@example.com', 'hash123', 'John', 'Doe')
RETURNING id;

-- Select
SELECT * FROM users WHERE email LIKE '%@example.com';
SELECT id, email, first_name || ' ' || last_name AS full_name FROM users;

-- Update
UPDATE users
SET profile_data = '{"theme": "dark"}', updated_at = NOW()
WHERE id = 1;

-- Delete
DELETE FROM users WHERE created_at < NOW() - INTERVAL '1 year';
```

## Advanced Queries

### Joins

```sql
-- Inner join
SELECT u.email, p.title
FROM users u
JOIN posts p ON u.id = p.user_id
WHERE p.status = 'published';

-- Left join
SELECT u.email, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.email;

-- Lateral join
SELECT u.email, recent_posts.title
FROM users u
LEFT JOIN LATERAL (
    SELECT title FROM posts
    WHERE user_id = u.id
    ORDER BY created_at DESC
    LIMIT 3
) recent_posts ON true;
```

### Window Functions

```sql
-- Row numbering
SELECT
    email,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
FROM users;

-- Running totals
SELECT
    user_id,
    title,
    created_at,
    COUNT(*) OVER (PARTITION BY user_id ORDER BY created_at) as running_count
FROM posts;

-- Ranking
SELECT
    user_id,
    COUNT(*) as post_count,
    RANK() OVER (ORDER BY COUNT(*) DESC) as rank
FROM posts
GROUP BY user_id;
```

### Common Table Expressions (CTEs)

```sql
WITH user_stats AS (
    SELECT
        user_id,
        COUNT(*) as post_count,
        MAX(created_at) as last_post_date
    FROM posts
    GROUP BY user_id
)
SELECT u.email, us.post_count, us.last_post_date
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE us.post_count > 10;
```

## JSON/JSONB Operations

```sql
-- Insert JSON
INSERT INTO users (email, profile_data)
VALUES ('jane@example.com', '{"preferences": {"theme": "light", "notifications": true}}');

-- Query JSON
SELECT * FROM users
WHERE profile_data @> '{"preferences": {"theme": "dark"}}';

-- Extract JSON values
SELECT
    email,
    profile_data->>'name' as name,
    profile_data->'preferences'->>'theme' as theme
FROM users;

-- Update JSON
UPDATE users
SET profile_data = jsonb_set(
    profile_data,
    '{preferences,theme}',
    '"dark"'
)
WHERE id = 1;

-- JSON aggregation
SELECT
    user_id,
    jsonb_agg(jsonb_build_object('title', title, 'date', created_at)) as posts
FROM posts
GROUP BY user_id;
```

## Indexing

### Index Types

```sql
-- B-tree index (default)
CREATE INDEX idx_users_email ON users(email);

-- Partial index
CREATE INDEX idx_published_posts ON posts(created_at) WHERE status = 'published';

-- Expression index
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- GIN index (for JSONB, arrays)
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_users_profile ON users USING GIN(profile_data);

-- GiST index (for geometric, full-text)
CREATE INDEX idx_posts_title_search ON posts USING GIN(to_tsvector('english', title));

-- Hash index
CREATE INDEX idx_users_hash ON users USING HASH(id);

-- BRIN index (for large, naturally ordered tables)
CREATE INDEX idx_posts_created ON posts USING BRIN(created_at);

-- Covering index (INCLUDE)
CREATE INDEX idx_users_covering ON users(email) INCLUDE (first_name, last_name);
```

## Full-Text Search

```sql
-- Create search vector
ALTER TABLE posts ADD COLUMN search_vector tsvector;

UPDATE posts SET search_vector =
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(content, '')), 'B');

-- Create index
CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);

-- Search query
SELECT title, ts_rank_cd(search_vector, query) as rank
FROM posts, plainto_tsquery('english', 'web development') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

## Functions and Triggers

```sql
-- Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Generated column
ALTER TABLE posts ADD COLUMN title_lower VARCHAR(200)
    GENERATED ALWAYS AS (LOWER(title)) STORED;
```

## Views and Materialized Views

```sql
-- Regular view
CREATE VIEW active_users AS
SELECT id, email, first_name, last_name
FROM users
WHERE active = true;

-- Materialized view
CREATE MATERIALIZED VIEW monthly_stats AS
SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as new_users
FROM users
GROUP BY 1;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW monthly_stats;
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_stats;  -- Without locking
```

## Partitioning

```sql
-- Range partitioning
CREATE TABLE events (
    id SERIAL,
    event_time TIMESTAMP NOT NULL,
    data JSONB
) PARTITION BY RANGE (event_time);

CREATE TABLE events_2024_01 PARTITION OF events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE events_2024_02 PARTITION OF events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

## Performance Features

### Query Planning

```sql
-- Explain query plan
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM posts WHERE user_id = 1;

-- Vacuum and analyze
VACUUM ANALYZE users;
```

### Parallel Query

- Parallel sequential scans
- Parallel joins
- Parallel aggregation

### Connection Pooling

Commonly used with PgBouncer for high-concurrency scenarios.

## Extensions

Popular extensions:

- **PostGIS**: Geographic objects support
- **pg_trgm**: Trigram matching for fuzzy search
- **uuid-ossp**: UUID generation
- **hstore**: Key-value store
- **timescaledb**: Time-series data
- **pg_stat_statements**: Query statistics

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Replication and High Availability

- Streaming replication (physical)
- Logical replication
- Hot standby
- Synchronous replication
- Automatic failover (with Patroni)

## Tools

- **pgAdmin**: GUI administration
- **psql**: Command-line client
- **pg_dump/pg_restore**: Backup and restore
- **pgBouncer**: Connection pooling
- **pgBackRest**: Backup and restore solution
