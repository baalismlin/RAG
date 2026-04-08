# Prisma

## Overview

Prisma is a next-generation ORM for Node.js and TypeScript. It provides a type-safe database client, declarative data modeling, and automated migrations. Prisma simplifies database workflows with a focus on developer experience and type safety.

## Core Components

### Prisma Schema
The heart of Prisma - declarative data model and configuration:
```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
  tags      Tag[]
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
```

### Prisma Client
Type-safe database client auto-generated from schema:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CRUD operations
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe',
    posts: {
      create: { title: 'Hello World', published: true }
    }
  },
  include: { posts: true }
});

const users = await prisma.user.findMany({
  where: { email: { contains: '@example.com' } },
  include: { posts: { where: { published: true } } },
  orderBy: { createdAt: 'desc' },
  take: 10
});
```

### Prisma Migrate
Database schema management:
```bash
# Create migration
npx prisma migrate dev --name add_user_profile

# Deploy to production
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Generate client only
npx prisma generate
```

## CRUD Operations

### Create
```typescript
// Single record
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice'
  }
});

// Multiple records
const users = await prisma.user.createMany({
  data: [
    { email: 'bob@example.com', name: 'Bob' },
    { email: 'charlie@example.com', name: 'Charlie' }
  ],
  skipDuplicates: true
});

// Nested create
const userWithPosts = await prisma.user.create({
  data: {
    email: 'david@example.com',
    name: 'David',
    posts: {
      create: [
        { title: 'First Post', published: true },
        { title: 'Second Post' }
      ]
    },
    profile: {
      create: { bio: 'Software developer' }
    }
  },
  include: { posts: true, profile: true }
});
```

### Read
```typescript
// Find unique
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' }
});

const userById = await prisma.user.findUnique({
  where: { id: 1 }
});

// Find many with filters
const users = await prisma.user.findMany({
  where: {
    AND: [
      { email: { contains: '@example.com' } },
      { name: { not: null } },
      { posts: { some: { published: true } } }
    ]
  },
  include: { 
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }
  },
  orderBy: { createdAt: 'desc' },
  skip: 0,
  take: 10
});

// Find first
const firstUser = await prisma.user.findFirst({
  where: { name: { startsWith: 'A' } }
});

// Aggregation
const aggregation = await prisma.user.aggregate({
  where: { posts: { some: {} } },
  _count: { _all: true },
  _avg: { id: true },
  _max: { createdAt: true }
});

// Group by
const groupedUsers = await prisma.user.groupBy({
  by: ['email'],
  _count: { _all: true },
  having: { email: { _count: { gt: 1 } } }
});
```

### Update
```typescript
// Update single
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'John Updated' }
});

// Update many
const updateCount = await prisma.user.updateMany({
  where: { email: { contains: '@old-domain.com' } },
  data: { email: { set: 'updated@new-domain.com' } }
});

// Upsert
const result = await prisma.user.upsert({
  where: { email: 'john@example.com' },
  update: { name: 'John Updated' },
  create: { email: 'john@example.com', name: 'John' }
});

// Nested update
const userWithUpdatedPost = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      update: {
        where: { id: 1 },
        data: { published: true }
      },
      create: { title: 'New Post' }
    }
  }
});
```

### Delete
```typescript
// Delete single
const deletedUser = await prisma.user.delete({
  where: { id: 1 }
});

// Delete many
const deleteCount = await prisma.user.deleteMany({
  where: { email: { contains: '@spam.com' } }
});

// Cascade delete (defined in schema relation)
// Post records will be deleted when user is deleted
await prisma.user.delete({
  where: { id: 1 }
});
```

## Advanced Queries

### Transactions
```typescript
// Sequential transactions
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'new@example.com' } }),
  prisma.post.create({ data: { title: 'New Post', authorId: 1 } })
]);

// Interactive transactions
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'user@example.com' } });
  await tx.post.create({ 
    data: { 
      title: 'User Post', 
      authorId: user.id 
    } 
  });
});

// Transaction options
await prisma.$transaction(
  [operation1, operation2],
  {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5000,
    timeout: 10000
  }
);
```

### Raw Queries
```typescript
// Raw SQL query
const result = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE email LIKE ${'%@example.com'}
`;

// Raw SQL with typed result
const users = await prisma.$queryRaw<User[]>`
  SELECT id, email, name FROM "User" WHERE active = true
`;

// Unsafe raw query
const result = await prisma.$queryRawUnsafe(
  'SELECT * FROM "User" WHERE id = $1',
  userId
);

// Raw execute
await prisma.$executeRaw`
  UPDATE "User" SET name = ${newName} WHERE id = ${userId}
`;
```

### Full-Text Search
```typescript
// Requires extension in schema or migration
const results = await prisma.$queryRaw`
  SELECT * FROM "Post"
  WHERE to_tsvector('english', title || ' ' || content)
  @@ to_tsquery('english', ${searchTerm})
`;
```

## Schema Features

### Field Attributes
```prisma
model Example {
  // ID and default
  id    Int    @id @default(autoincrement())
  uuid  String @id @default(uuid())
  cuid  String @id @default(cuid())
  
  // Unique
  email String @unique
  
  // Required and optional
  required String
  optional String?
  
  // Default values
  count  Int    @default(0)
  status String @default("active")
  
  // Updated at timestamp
  updatedAt DateTime @updatedAt
  
  // Index
  searchField String @index
  
  // Unique combination
  firstName String
  lastName  String
  @@unique([firstName, lastName])
  
  // Composite index
  @@index([firstName, lastName])
  
  // Map table name
  @@map("examples")
}
```

### Relations
```prisma
// One-to-one
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique
}

// One-to-many
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int   @id @default(autoincrement())
  author   User  @relation(fields: [authorId], references: [id])
  authorId Int
}

// Many-to-many (implicit)
model Post {
  id    Int   @id @default(autoincrement())
  tags  Tag[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

// Many-to-many (explicit)
model Post {
  id     Int         @id @default(autoincrement())
  tags   PostTag[]
}

model Tag {
  id    Int        @id @default(autoincrement())
  posts PostTag[]
}

model PostTag {
  post   Post @relation(fields: [postId], references: [id])
  postId Int
  tag    Tag  @relation(fields: [tagId], references: [id])
  tagId  Int
  
  @@id([postId, tagId])
}
```

### Database Mapping
```prisma
// Enum
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id   Int  @id @default(autoincrement())
  role Role @default(USER)
}

// Database-specific types
model Product {
  id          Int      @id @default(autoincrement())
  attributes  Json     // PostgreSQL JSONB
  location    Unsupported("point")?  // PostGIS point
}
```

## Middleware

```typescript
const logMiddleware: Prisma.Middleware = async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  console.log(
    `Query ${params.model}.${params.action} took ${after - before}ms`
  );
  
  return result;
};

prisma.$use(logMiddleware);
```

## Client Extensions

```typescript
const prisma = new PrismaClient().$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`;
        }
      }
    }
  },
  model: {
    user: {
      async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
      }
    }
  }
});
```

## Best Practices

### Connection Management
```typescript
// Singleton pattern
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### Error Handling
```typescript
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({ data: { email: 'existing@example.com' } });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') {
      // Unique constraint violation
      console.log('Email already exists');
    }
  }
}
```

## CLI Commands

```bash
# Initialize
npx prisma init

# Generate client
npx prisma generate

# Database operations
npx prisma migrate dev      # Development migrations
npx prisma migrate deploy   # Production migrations
npx prisma migrate reset    # Reset database
npx prisma db push          # Prototype changes
npx prisma db pull          # Introspect database
npx prisma db seed          # Run seed script

# Studio (GUI)
npx prisma studio

# Format schema
npx prisma format

# Validate schema
npx prisma validate
```
