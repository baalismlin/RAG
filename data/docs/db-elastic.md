# Elasticsearch

## Overview

Elasticsearch is a distributed, RESTful search and analytics engine capable of addressing a growing number of use cases. Built on Apache Lucene, it provides near real-time search and analytics for all types of data including structured, unstructured, geo, and metric data.

## Core Concepts

### Index
An index is a collection of documents with similar characteristics. It's the equivalent of a database in relational databases.

### Document
A document is a basic unit of information that can be indexed. Expressed in JSON format.

### Type (deprecated in ES 7+)
Previously used to define document types within an index, now removed in favor of single type per index.

### Mapping
Schema definition that defines how documents and their fields are stored and indexed.

### Cluster and Nodes
- **Cluster**: Collection of nodes holding data
- **Node**: Single server in the cluster
- **Shard**: Partition of an index
- **Replica**: Copy of a shard for failover

## REST API Basics

### Index Operations
```bash
# Create index
PUT /products
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "price": { "type": "float" },
      "category": { "type": "keyword" },
      "in_stock": { "type": "boolean" },
      "created_at": { "type": "date" }
    }
  }
}

# Delete index
DELETE /products

# Check if exists
HEAD /products

# Get index info
GET /products/_settings
GET /products/_mapping
```

### Document Operations
```bash
# Index (create/update) document
PUT /products/_doc/1
{
  "name": "Laptop Computer",
  "price": 999.99,
  "category": "electronics",
  "in_stock": true,
  "created_at": "2024-01-15T10:00:00Z"
}

# Create with auto-generated ID
POST /products/_doc
{
  "name": "Wireless Mouse",
  "price": 29.99,
  "category": "electronics",
  "in_stock": true
}

# Get document
GET /products/_doc/1

# Update document
POST /products/_update/1
{
  "doc": {
    "price": 899.99,
    "in_stock": false
  }
}

# Delete document
DELETE /products/_doc/1

# Bulk operations
POST /_bulk
{ "index": { "_index": "products", "_id": "2" } }
{ "name": "Keyboard", "price": 79.99, "category": "electronics" }
{ "delete": { "_index": "products", "_id": "1" } }
```

## Search Queries

### Basic Search
```bash
# Search all
GET /products/_search

# Match query
GET /products/_search
{
  "query": {
    "match": {
      "name": "laptop computer"
    }
  }
}

# Multi-match (search across fields)
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "laptop",
      "fields": ["name^3", "description", "category"]
    }
  }
}
```

### Term-Level Queries
```bash
# Exact match
GET /products/_search
{
  "query": {
    "term": {
      "category": "electronics"
    }
  }
}

# Terms (multiple values)
GET /products/_search
{
  "query": {
    "terms": {
      "category": ["electronics", "computers"]
    }
  }
}

# Range query
GET /products/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 100,
        "lte": 500
      }
    }
  }
}

# Exists query
GET /products/_search
{
  "query": {
    "exists": {
      "field": "description"
    }
  }
}
```

### Compound Queries
```bash
# Bool query
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "laptop" } },
        { "range": { "price": { "lte": 1000 } } }
      ],
      "must_not": [
        { "term": { "in_stock": false } }
      ],
      "should": [
        { "match": { "category": "gaming" } }
      ],
      "filter": [
        { "term": { "category": "electronics" } }
      ]
    }
  }
}
```

### Full-Text Search
```bash
# Match phrase
GET /articles/_search
{
  "query": {
    "match_phrase": {
      "content": "quick brown fox"
    }
  }
}

# Query string
GET /products/_search
{
  "query": {
    "query_string": {
      "default_field": "name",
      "query": "(laptop OR desktop) AND (gaming OR professional)"
    }
  }
}

# Fuzzy search
GET /products/_search
{
  "query": {
    "fuzzy": {
      "name": {
        "value": "laptp",
        "fuzziness": "AUTO"
      }
    }
  }
}
```

## Aggregations

### Metric Aggregations
```bash
GET /products/_search
{
  "size": 0,
  "aggs": {
    "avg_price": {
      "avg": { "field": "price" }
    },
    "max_price": {
      "max": { "field": "price" }
    },
    "min_price": {
      "min": { "field": "price" }
    },
    "stats_price": {
      "stats": { "field": "price" }
    }
  }
}
```

### Bucket Aggregations
```bash
# Terms aggregation (group by)
GET /products/_search
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": {
        "field": "category",
        "size": 10
      },
      "aggs": {
        "avg_price": {
          "avg": { "field": "price" }
        }
      }
    }
  }
}

# Date histogram
GET /orders/_search
{
  "size": 0,
  "aggs": {
    "sales_over_time": {
      "date_histogram": {
        "field": "order_date",
        "calendar_interval": "month"
      },
      "aggs": {
        "total_revenue": {
          "sum": { "field": "total_amount" }
        }
      }
    }
  }
}

# Range aggregation
GET /products/_search
{
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "to": 100, "key": "budget" },
          { "from": 100, "to": 500, "key": "mid-range" },
          { "from": 500, "key": "premium" }
        ]
      }
    }
  }
}
```

## Analyzers and Text Analysis

### Built-in Analyzers
- **standard**: Splits on word boundaries, lowercases, removes stop words
- **simple**: Non-letter tokenizer, lowercase filter
- **whitespace**: Splits on whitespace only
- **keyword**: No-op analyzer (keeps whole input)
- **pattern**: Regex-based tokenizer

### Custom Analyzer
```bash
PUT /my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "asciifolding",
            "synonym_filter"
          ]
        }
      },
      "filter": {
        "synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "laptop, notebook",
            "pc, computer, desktop"
          ]
        }
      }
    }
  }
}
```

### Testing Analyzers
```bash
POST /_analyze
{
  "analyzer": "standard",
  "text": "Quick Brown Foxes!"
}

POST /_analyze
{
  "tokenizer": "standard",
  "filter": ["lowercase", "stop"],
  "text": "The Quick Brown Foxes jump over the lazy dog"
}
```

## Mappings

### Dynamic Mapping
```bash
# Enable/disable dynamic mapping
PUT /my_index
{
  "mappings": {
    "dynamic": "strict",  # Options: true, false, strict
    "properties": {
      "name": { "type": "text" }
    }
  }
}
```

### Field Data Types
```bash
PUT /products
{
  "mappings": {
    "properties": {
      "name": { "type": "text", "analyzer": "standard" },
      "name_keyword": { 
        "type": "keyword", 
        "fields": { "keyword": { "type": "keyword" } }
      },
      "price": { "type": "float" },
      "quantity": { "type": "integer" },
      "in_stock": { "type": "boolean" },
      "tags": { "type": "keyword" },
      "description": { "type": "text", "index": false },
      "created_at": { "type": "date" },
      "location": { "type": "geo_point" },
      "rating": { "type": "scaled_float", "scaling_factor": 10 }
    }
  }
}
```

## Relevance Scoring

```bash
# Boost specific fields
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "gaming laptop",
      "fields": ["name^3", "description^2", "category"],
      "type": "best_fields"
    }
  }
}

# Function score (custom scoring)
GET /products/_search
{
  "query": {
    "function_score": {
      "query": { "match": { "name": "laptop" } },
      "functions": [
        {
          "field_value_factor": {
            "field": "popularity",
            "factor": 1.2,
            "modifier": "sqrt"
          }
        }
      ],
      "score_mode": "multiply"
    }
  }
}
```

## Index Lifecycle Management (ILM)

```bash
# Create ILM policy
PUT /_ilm/policy/logs_policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_primary_shard_size": "50gb",
            "max_age": "30d",
            "max_docs": 100000000
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "freeze": {}
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

## Security

```bash
# Enable security in elasticsearch.yml
xpack.security.enabled: true
xpack.security.authc.api_key.enabled: true

# Create users and roles
POST /_security/user/jacknich
{
  "password": "j@rV1s",
  "roles": ["admin", "other_role1"],
  "full_name": "Jack Nicholson",
  "email": "jacknich@example.com"
}
```

## Common Use Cases

### E-Commerce Search
- Full-text product search
- Faceted navigation (aggregations)
- Auto-suggest
- Personalized ranking

### Log Analytics
- Centralized logging
- Real-time monitoring
- Alerting
- Historical analysis

### Security Analytics
- SIEM data storage
- Threat detection
- Anomaly detection

### APM (Application Performance Monitoring)
- Distributed tracing
- Service metrics
- Error tracking

## Client Libraries

- **JavaScript/Node.js**: @elastic/elasticsearch
- **Python**: elasticsearch, elasticsearch-dsl
- **Java**: Elasticsearch Java Client
- **Go**: elastic
- **Ruby**: elasticsearch-ruby
