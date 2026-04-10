# Redis

## Overview

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store used as a database, cache, message broker, and streaming engine. It supports various data structures including strings, hashes, lists, sets, sorted sets, bitmaps, hyperloglogs, geospatial indexes, and streams.

## Key Features

### In-Memory Storage

All data is stored in RAM, providing extremely fast read and write operations (sub-millisecond latency).

### Persistence Options

- **RDB (Redis Database)**: Point-in-time snapshots
- **AOF (Append Only File)**: Log every write operation
- Hybrid approach combining both

### Data Structures

Native support for complex data types beyond simple key-value pairs.

### High Availability

Redis Sentinel for automatic failover and Redis Cluster for automatic partitioning.

## Data Types

### Strings

```bash
# Basic operations
SET user:1:name "John"
GET user:1:name
MSET user:1:email "john@example.com" user:1:age 30
MGET user:1:email user:1:age

# Counter operations
INCR page:views
INCRBY page:views 10
DECRBY stock:item:100 5

# Expiration
SET session:abc "data" EX 3600  # Expires in 1 hour
SET session:abc "data" PX 3600000  # Milliseconds
TTL session:abc  # Check remaining time
EXPIRE session:abc 1800  # Update expiration
```

### Hashes

```bash
# Store objects
HSET user:1 name "John" email "john@example.com" age 30
HGET user:1 name
HGETALL user:1
HMGET user:1 name email

# Field operations
HINCRBY user:1 age 1
HLEN user:1
HEXISTS user:1 name
HDEL user:1 age
```

### Lists

```bash
# Push operations
LPUSH queue:tasks "task1"
RPUSH queue:tasks "task2"
LPUSH queue:tasks "task3"

# Pop operations
LPOP queue:tasks  # Removes from left
RPOP queue:tasks  # Removes from right

# Blocking pop (wait for items)
BLPOP queue:tasks 30  # Wait up to 30 seconds

# Range operations
LRANGE queue:tasks 0 -1  # Get all
LRANGE queue:tasks 0 9    # Get first 10
LLEN queue:tasks
LINDEX queue:tasks 0
LSET queue:tasks 0 "new_task"
LREM queue:tasks 1 "task1"  # Remove 1 occurrence
```

### Sets

```bash
# Add and remove
SADD tags:post:1 "redis" "database" "cache"
SREM tags:post:1 "cache"

# Set operations
SMEMBERS tags:post:1
SISMEMBER tags:post:1 "redis"
SCARD tags:post:1  # Count members

# Set algebra
SINTER tags:post:1 tags:post:2  # Intersection
SUNION tags:post:1 tags:post:2  # Union
SDIFF tags:post:1 tags:post:2   # Difference

# Random operations
SRANDMEMBER tags:post:1 2  # Get 2 random members
SPOP tags:post:1  # Remove and return random member
```

### Sorted Sets

```bash
# Add with scores
ZADD leaderboard 100 "player1" 85 "player2" 120 "player3"

# Range queries
ZRANGE leaderboard 0 -1  # Lowest to highest
ZREVRANGE leaderboard 0 -1  # Highest to lowest
ZRANGE leaderboard 0 -1 WITHSCORES

# Score operations
ZSCORE leaderboard "player1"
ZINCRBY leaderboard 10 "player1"
ZRANK leaderboard "player1"  # 0-based rank
ZREVRANK leaderboard "player1"

# Range by score
ZRANGEBYSCORE leaderboard 90 110
ZCOUNT leaderboard 90 110

# Remove
ZREM leaderboard "player2"
ZPOPMIN leaderboard 1  # Remove lowest
ZPOPMAX leaderboard 1  # Remove highest
```

### Bitmaps

```bash
# Bit operations
SETBIT user:login:2024-01-01 100 1  # User 100 logged in on Jan 1
GETBIT user:login:2024-01-01 100
BITCOUNT user:login:2024-01-01  # Count set bits

# Bitmap operations
BITOP AND result user:login:01 user:login:02
```

### HyperLogLogs

```bash
# Probabilistic cardinality counting
PFADD visitors:2024-01-01 "user1" "user2" "user3"
PFCOUNT visitors:2024-01-01

# Merge multiple HLLs
PFMERGE visitors:month visitors:week1 visitors:week2
```

### Geospatial

```bash
# Add locations
GEOADD cities -74.0060 40.7128 "New York" -122.4194 37.7749 "San Francisco"

# Query
GEOPOS cities "New York"
GEODIST cities "New York" "San Francisco" km

# Find nearby
GEORADIUS cities -75.0 40.0 200 km
GEORADIUSBYMEMBER cities "New York" 100 km
```

### Streams

```bash
# Add to stream
XADD events * type login user_id 123
XADD events * type purchase user_id 123 amount 50.00

# Read from stream
XRANGE events - +  # All messages
XREVRANGE events + - COUNT 10  # Last 10

# Consumer groups
XGROUP CREATE events group1 $ MKSTREAM
XREADGROUP GROUP group1 consumer1 STREAMS events >
XACK events group1 1234567890-0  # Acknowledge message

# Stream info
XLEN events
XINFO STREAM events
```

## Key Patterns

### Key Naming Convention

```
object-type:id:field
user:100:name
product:50:stock
session:abc123:data
```

### Key Expiration Patterns

```bash
# Session management
SET session:user:100 "data" EX 1800

# Rate limiting
INCR rate_limit:ip:192.168.1.1
EXPIRE rate_limit:ip:192.168.1.1 60

# Cache with conditional expire
SET cache:user:100 "data"
EXPIRE cache:user:100 3600
```

## Transactions

```bash
# Multi/exec
MULTI
SET key1 "value1"
INCR counter
LPUSH list "item"
EXEC

# Watch for optimistic locking
WATCH mykey
GET mykey
MULTI
SET mykey "newvalue"
EXEC  # Fails if mykey changed since WATCH
```

## Pub/Sub

```bash
# Subscribe to channel
SUBSCRIBE notifications
PSUBSCRIBE user:*  # Pattern subscribe

# Publish message
PUBLISH notifications "New message"

# Unsubscribe
UNSUBSCRIBE notifications
```

## Lua Scripting

```bash
# Execute script
EVAL "return redis.call('GET', KEYS[1])" 1 mykey

# Script with multiple keys
EVAL "
    local sum = 0
    for i=1,#KEYS do
        sum = sum + redis.call('GET', KEYS[i])
    end
    return sum
" 3 key1 key2 key3

# Store and execute
SCRIPT LOAD "return redis.call('GET', KEYS[1])"
EVALSHA sha1_hash 1 mykey
```

## Persistence

### RDB Configuration

```conf
save 900 1      # Save if 1 key changed in 900 seconds
save 300 10     # Save if 10 keys changed in 300 seconds
save 60 10000   # Save if 10000 keys changed in 60 seconds
dbfilename dump.rdb
dir /var/lib/redis
```

### AOF Configuration

```conf
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec  # Options: always, everysec, no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

## Redis Sentinel (High Availability)

```conf
# sentinel.conf
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1
```

## Redis Cluster

```bash
# Create cluster
redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 \
    127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
    --cluster-replicas 1
```

## Common Use Cases

### Caching

```bash
# Check cache
GET cache:user:100

# Set cache if miss
SETEX cache:user:100 3600 serialized_user_data
```

### Session Store

```bash
SET session:abc123 "user_data_json"
EXPIRE session:abc123 1800
```

### Rate Limiting

```bash
INCR rate_limit:user:100
EXPIRE rate_limit:user:100 60
```

### Leaderboards

```bash
ZADD game:leaderboard score player_id
ZREVRANGE game:leaderboard 0 9 WITHSCORES
```

### Real-time Analytics

```bash
# Increment counters
HINCRBY stats:2024-01-01 pageviews 1
HINCRBY stats:2024-01-01 unique_visitors 1

# Time series with sorted sets
ZADD time_series:temperature timestamp value
```

### Job Queue

```bash
# Producer
LPUSH queue:emails '{"to":"user@example.com","subject":"Welcome"}'

# Worker
RPOP queue:emails
# Or blocking
BRPOP queue:emails 30
```

## Security

```conf
# redis.conf security settings
requirepass your_strong_password
bind 127.0.0.1  # Bind to specific interface
protected-mode yes
rename-command FLUSHDB ""
rename-command FLUSHALL ""
```

## Monitoring

```bash
# Statistics
INFO
INFO memory
INFO stats

# Real-time monitoring
MONITOR

# Slow queries
SLOWLOG GET 10

# Latency monitoring
LATENCY DOCTOR
```

## Clients

- **Node.js**: ioredis, redis
- **Python**: redis-py
- **Java**: Jedis, Lettuce
- **Go**: go-redis
- **PHP**: Predis, phpredis
