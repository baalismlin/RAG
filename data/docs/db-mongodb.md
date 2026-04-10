# MongoDB

## Overview

MongoDB is a document-oriented NoSQL database designed for ease of development and scaling. It uses JSON-like documents with optional schemas, making it flexible for handling unstructured and semi-structured data. MongoDB is particularly well-suited for applications with rapidly evolving data schemas.

## Core Concepts

### Documents

Documents are the basic unit of data in MongoDB, stored in BSON (Binary JSON) format:

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  address: {
    street: "123 Main St",
    city: "New York"
  },
  tags: ["developer", "nodejs"],
  createdAt: ISODate("2024-01-15T10:30:00Z")
}
```

### Collections

Collections are groups of documents, similar to tables in relational databases but without a fixed schema.

### Databases

Databases hold collections and are the container for data in MongoDB.

## CRUD Operations

### Create

```javascript
// Insert single document
db.users.insertOne({
  name: "Jane Smith",
  email: "jane@example.com",
  age: 28,
  createdAt: new Date(),
})

// Insert multiple documents
db.users.insertMany([
  { name: "Alice", email: "alice@example.com", age: 25 },
  { name: "Bob", email: "bob@example.com", age: 35 },
])
```

### Read

```javascript
// Find all
db.users.find()

// Find with filter
db.users.find({ age: { $gte: 18 } })
db.users.find({ email: /example.com$/ })

// Find with projection
db.users.find({}, { name: 1, email: 1, _id: 0 })

// Find one
db.users.findOne({ _id: ObjectId("507f1f77bcf86cd799439011") })

// Count
db.users.countDocuments({ age: { $gte: 18 } })

// Distinct
db.users.distinct("city")
```

### Update

```javascript
// Update one
db.users.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  { $set: { age: 31, updatedAt: new Date() } }
)

// Update many
db.users.updateMany({ status: "pending" }, { $set: { status: "active" }, $inc: { loginCount: 1 } })

// Replace document
db.users.replaceOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  { name: "John Updated", email: "new@example.com" }
)

// Upsert
db.users.updateOne({ email: "new@example.com" }, { $set: { name: "New User" } }, { upsert: true })
```

### Delete

```javascript
// Delete one
db.users.deleteOne({ _id: ObjectId("507f1f77bcf86cd799439011") })

// Delete many
db.users.deleteMany({ status: "inactive" })

// Delete all
db.users.deleteMany({})
```

## Query Operators

### Comparison

```javascript
// $eq, $ne, $gt, $gte, $lt, $lte
db.products.find({ price: { $gte: 10, $lte: 100 } })
db.products.find({ category: { $ne: "electronics" } })

// $in, $nin
db.users.find({ status: { $in: ["active", "premium"] } })
```

### Logical

```javascript
// $and, $or, $not, $nor
db.users.find({
  $or: [{ age: { $lt: 18 } }, { age: { $gt: 65 } }],
  status: "active",
})
```

### Element

```javascript
// $exists, $type
db.users.find({ phone: { $exists: true } })
db.users.find({ age: { $type: "int" } })
```

### Array

```javascript
// Match array element
db.products.find({ tags: "electronics" })

// Match all elements
db.products.find({ tags: { $all: ["electronics", "new"] } })

// Array size
db.products.find({ tags: { $size: 3 } })

// Element match
db.orders.find({ items: { $elemMatch: { price: { $gt: 100 }, quantity: { $gte: 2 } } } })
```

## Aggregation Pipeline

```javascript
// Basic aggregation
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: "$customerId",
      totalSpent: { $sum: "$total" },
      orderCount: { $sum: 1 },
    },
  },
  { $sort: { totalSpent: -1 } },
  { $limit: 10 },
])

// With lookup (join)
db.orders.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer",
    },
  },
  { $unwind: "$customer" },
  {
    $project: {
      orderId: 1,
      customerName: "$customer.name",
      total: 1,
    },
  },
])

// Complex pipeline
db.products.aggregate([
  { $match: { category: "electronics" } },
  {
    $facet: {
      priceStats: [
        { $group: { _id: null, avgPrice: { $avg: "$price" }, maxPrice: { $max: "$price" } } },
      ],
      byBrand: [{ $group: { _id: "$brand", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
    },
  },
])
```

## Indexing

```javascript
// Single field index
db.users.createIndex({ email: 1 }, { unique: true })

// Compound index
db.orders.createIndex({ customerId: 1, createdAt: -1 })

// Text index
db.articles.createIndex({ title: "text", content: "text" })

// Wildcard index
db.users.createIndex({ "$**": 1 })

// Partial index
db.orders.createIndex({ createdAt: 1 }, { partialFilterExpression: { status: "completed" } })

// Multikey index (for arrays)
db.products.createIndex({ tags: 1 })

// TTL index
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })

// Hashed index
db.users.createIndex({ email: "hashed" })

// List indexes
db.users.getIndexes()

// Drop index
db.users.dropIndex("email_1")
```

## Schema Validation

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        email: {
          bsonType: "string",
          pattern: "^.+@.+$",
          description: "must be a valid email",
        },
        age: {
          bsonType: "int",
          minimum: 0,
          maximum: 150,
        },
      },
    },
  },
  validationLevel: "strict",
  validationAction: "error",
})
```

## Replication

### Replica Set

A replica set is a group of mongod instances that maintain the same data set:

- Primary: receives all write operations
- Secondaries: replicate the primary's oplog and apply operations
- Arbiter: participates in elections but holds no data

### Read Preferences

- `primary`: Default, read from primary
- `primaryPreferred`: Prefer primary, failover to secondary
- `secondary`: Read from secondary
- `secondaryPreferred`: Prefer secondary, failover to primary
- `nearest`: Read from nearest member by latency

## Sharding

Horizontal scaling through data distribution:

- Shard key determines data distribution
- Config servers store cluster metadata
- Mongos routers direct queries to appropriate shards

## Transactions

```javascript
// Multi-document transaction
const session = db.getMongo().startSession()
session.startTransaction()

try {
  const users = session.getDatabase("myapp").users
  const orders = session.getDatabase("myapp").orders

  users.updateOne({ _id: userId }, { $inc: { balance: -100 } })
  orders.insertOne({ userId, amount: 100, status: "paid" })

  session.commitTransaction()
} catch (error) {
  session.abortTransaction()
  throw error
} finally {
  session.endSession()
}
```

## Change Streams

Real-time data change notifications:

```javascript
const changeStream = db.users.watch()

changeStream.on("change", (change) => {
  console.log(change)
  // Handle insert, update, delete, replace operations
})
```

## GridFS

Store large files exceeding BSON document size limit (16MB):

```javascript
// Store file
const bucket = new mongodb.GridFSBucket(db)
fs.createReadStream("largefile.pdf").pipe(bucket.openUploadStream("largefile.pdf"))

// Retrieve file
bucket.openDownloadStreamByName("largefile.pdf").pipe(fs.createWriteStream("output.pdf"))
```

## Security Features

- Authentication (SCRAM, x.509, LDAP, Kerberos)
- Role-based access control (RBAC)
- Encryption at rest
- Encryption in transit (TLS/SSL)
- Field-level encryption
- Client-side encryption
- Auditing

## Tools

- **mongo/mongosh**: Shell client
- **mongodump/mongorestore**: Backup and restore
- **mongoexport/mongoimport**: Data export/import
- **mongostat/mongotop**: Performance monitoring
- **Compass**: GUI client
- **Atlas**: Managed cloud service
