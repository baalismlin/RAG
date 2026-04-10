# MySQL

## Overview

MySQL is the world's most popular open-source relational database management system (RDBMS). Owned by Oracle Corporation, it's known for its reliability, performance, and ease of use. MySQL powers many of the world's most visited websites including Facebook, Twitter, and YouTube.

## Key Features

### ACID Compliance

Full ACID compliance with InnoDB storage engine for reliable transaction processing.

### Replication

Multiple replication options including asynchronous, semi-synchronous, and group replication.

### Partitioning

Support for horizontal partitioning of large tables.

### JSON Support

Native JSON data type and functions for handling semi-structured data.

### High Availability

Group Replication, InnoDB Cluster, and automated failover capabilities.

## Basic Operations

### Creating Databases and Tables

```sql
-- Create database
CREATE DATABASE myapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE myapp;

-- Create table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Create table with foreign keys
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    FULLTEXT INDEX idx_content (title, content)
) ENGINE=InnoDB;
```

### CRUD Operations

```sql
-- Insert
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('john@example.com', 'hash123', 'John', 'Doe');

INSERT INTO users (email, password_hash) VALUES
('jane@example.com', 'hash456'),
('bob@example.com', 'hash789');

-- Select
SELECT * FROM users WHERE email LIKE '%@example.com';
SELECT id, CONCAT(first_name, ' ', last_name) AS full_name FROM users;
SELECT DISTINCT status FROM posts;

-- Update
UPDATE users SET first_name = 'Johnny' WHERE id = 1;
UPDATE posts SET status = 'published', published_at = NOW()
WHERE id = 5 AND status = 'draft';

-- Delete
DELETE FROM posts WHERE status = 'archived' AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## Advanced Queries

### Joins

```sql
-- Inner join
SELECT u.email, p.title, p.status
FROM users u
INNER JOIN posts p ON u.id = p.user_id
WHERE p.status = 'published';

-- Left join with aggregation
SELECT u.email, COUNT(p.id) AS post_count, MAX(p.created_at) AS last_post
FROM users u
LEFT JOIN posts p ON u.id = p.user_id AND p.status = 'published'
GROUP BY u.id, u.email;

-- Multiple joins
SELECT u.email, p.title, c.content AS comment
FROM users u
JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON p.id = c.post_id;
```

### Subqueries

```sql
-- Subquery in WHERE
SELECT * FROM users
WHERE id IN (SELECT DISTINCT user_id FROM posts WHERE status = 'published');

-- Correlated subquery
SELECT u.*,
    (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS post_count
FROM users u;

-- Derived table
SELECT email, post_count
FROM (
    SELECT u.email, COUNT(p.id) AS post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id
) AS stats
WHERE post_count > 5;
```

### Window Functions

```sql
-- Row numbering and ranking
SELECT
    email,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at) AS row_num,
    RANK() OVER (ORDER BY post_count DESC) AS rank,
    LAG(email, 1) OVER (ORDER BY created_at) AS prev_user
FROM (
    SELECT u.*, COUNT(p.id) AS post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id
) AS user_stats;

-- Running totals
SELECT
    id,
    amount,
    SUM(amount) OVER (ORDER BY created_at) AS running_total,
    AVG(amount) OVER (PARTITION BY user_id) AS user_avg
FROM orders;
```

## JSON Functions

```sql
-- Create table with JSON
CREATE TABLE configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    settings JSON NOT NULL
);

-- Insert JSON
INSERT INTO configs (settings) VALUES
('{"theme": "dark", "notifications": true, "language": "en"}');

-- Extract JSON values
SELECT
    id,
    JSON_UNQUOTE(JSON_EXTRACT(settings, '$.theme')) AS theme,
    settings->>'$.language' AS language,
    settings->'$.notifications' AS notifications
FROM configs;

-- Update JSON
UPDATE configs
SET settings = JSON_SET(settings, '$.theme', 'light');

-- Search JSON
SELECT * FROM configs WHERE JSON_CONTAINS(settings, '"dark"', '$.theme');
SELECT * FROM configs WHERE JSON_SEARCH(settings, 'one', 'en') IS NOT NULL;

-- Remove key
UPDATE configs SET settings = JSON_REMOVE(settings, '$.temp_key');

-- Merge JSON
UPDATE configs
SET settings = JSON_MERGE_PATCH(settings, '{"new_key": "value"}');
```

## Indexing

```sql
-- Single column index
CREATE INDEX idx_posts_status ON posts(status);

-- Composite index
CREATE INDEX idx_posts_user_date ON posts(user_id, created_at);

-- Unique index
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- Partial index (using WHERE in older versions, invisible in MySQL 8+)
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';  -- Not supported in MySQL

-- Full-text index
CREATE FULLTEXT INDEX idx_posts_search ON posts(title, content);

-- Descending index (MySQL 8.0+)
CREATE INDEX idx_posts_created_desc ON posts(created_at DESC);

-- Index with prefix (for long strings)
CREATE INDEX idx_posts_title ON posts(title(100));

-- Invisible index (MySQL 8.0+)
CREATE INDEX idx_test ON posts(views) VISIBLE;
ALTER TABLE posts ALTER INDEX idx_test INVISIBLE;

-- Analyze and optimize
ANALYZE TABLE posts;
OPTIMIZE TABLE posts;
```

## Stored Procedures and Functions

```sql
-- Stored procedure
DELIMITER //
CREATE PROCEDURE GetUserPosts(IN userId INT)
BEGIN
    SELECT p.*, u.email
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = userId;
END //
DELIMITER ;

-- Call procedure
CALL GetUserPosts(1);

-- Function
DELIMITER //
CREATE FUNCTION GetPostCount(userId INT) RETURNS INT
READS SQL DATA
BEGIN
    DECLARE count INT;
    SELECT COUNT(*) INTO count FROM posts WHERE user_id = userId;
    RETURN count;
END //
DELIMITER ;

-- Use function
SELECT email, GetPostCount(id) AS post_count FROM users;

-- Drop
DROP PROCEDURE IF EXISTS GetUserPosts;
DROP FUNCTION IF EXISTS GetPostCount;
```

## Triggers

```sql
-- Before update trigger
DELIMITER //
CREATE TRIGGER before_user_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = NOW();
END //
DELIMITER ;

-- After insert trigger
DELIMITER //
CREATE TRIGGER after_post_insert
AFTER INSERT ON posts
FOR EACH ROW
BEGIN
    INSERT INTO post_logs (post_id, action, created_at)
    VALUES (NEW.id, 'INSERT', NOW());
END //
DELIMITER ;

-- Show triggers
SHOW TRIGGERS;
```

## Views

```sql
-- Create view
CREATE VIEW active_posts AS
SELECT p.id, p.title, u.email AS author_email, p.created_at
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'published';

-- Query view
SELECT * FROM active_posts WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Updateable view with check option
CREATE VIEW draft_posts AS
SELECT * FROM posts WHERE status = 'draft'
WITH CHECK OPTION;

-- Drop view
DROP VIEW IF EXISTS active_posts;
```

## Common Table Expressions (CTEs)

```sql
-- Simple CTE
WITH active_users AS (
    SELECT id, email FROM users WHERE active = 1
)
SELECT u.email, COUNT(p.id) AS post_count
FROM active_users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id;

-- Recursive CTE
WITH RECURSIVE subordinates AS (
    -- Anchor member: top-level employees
    SELECT id, name, manager_id, 0 AS level
    FROM employees WHERE manager_id IS NULL

    UNION ALL

    -- Recursive member: employees with managers
    SELECT e.id, e.name, e.manager_id, s.level + 1
    FROM employees e
    INNER JOIN subordinates s ON e.manager_id = s.id
)
SELECT * FROM subordinates;
```

## Replication

### Types

- **Asynchronous**: Primary doesn't wait for replicas
- **Semi-synchronous**: Primary waits for at least one replica
- **Group Replication**: Multi-primary, consensus-based

### Configuration

```ini
# Primary (my.cnf)
server-id=1
log_bin=mysql-bin
binlog_do_db=myapp

# Replica (my.cnf)
server-id=2
relay_log=mysql-relay-bin
log_bin=mysql-bin
read_only=1
```

## Partitioning

```sql
-- Range partitioning
CREATE TABLE logs (
    id INT AUTO_INCREMENT,
    log_date DATE NOT NULL,
    message TEXT,
    PRIMARY KEY (id, log_date)
) PARTITION BY RANGE (YEAR(log_date)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN MAXVALUE
);

-- List partitioning
CREATE TABLE regions (
    id INT,
    country VARCHAR(50),
    region VARCHAR(50)
) PARTITION BY LIST COLUMNS(country) (
    PARTITION p_north_america VALUES IN ('USA', 'Canada', 'Mexico'),
    PARTITION p_europe VALUES IN ('UK', 'Germany', 'France')
);

-- Hash partitioning
CREATE TABLE sessions (
    id INT,
    user_id INT,
    data TEXT
) PARTITION BY HASH(user_id) PARTITIONS 4;
```

## Performance Features

### Query Cache (removed in 8.0)

Replaced with other caching strategies in MySQL 8.0

### Buffer Pool

```ini
innodb_buffer_pool_size = 4G  # Typically 70-80% of RAM
```

### Query Optimization

```sql
-- Explain query
EXPLAIN ANALYZE SELECT * FROM posts WHERE user_id = 1;

-- Show profiles
SET profiling = 1;
SELECT * FROM posts WHERE status = 'published';
SHOW PROFILES;
```

## Tools

- **mysql/mysqldump**: CLI client and backup tool
- **MySQL Workbench**: GUI administration
- **phpMyAdmin**: Web-based administration
- **Percona Toolkit**: Advanced DBA tools
- **ProxySQL**: Database proxy
