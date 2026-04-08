# Fastify

## Overview

Fastify is a fast and low overhead web framework for Node.js, inspired by Hapi and Express. It focuses on providing the best developer experience with the least overhead and a powerful plugin architecture. Fastify is built around the concept of plugins, encapsulation, and hooks.

## Core Concepts

### Plugin Architecture
Everything in Fastify is a plugin. Routes, middleware, and decorators are all implemented as plugins:
```javascript
// Basic plugin
async function myPlugin(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
  });
}

app.register(myPlugin, { prefix: '/api' });
```

### Encapsulation
Each plugin creates its own encapsulated scope:
- Decorators are scoped to the plugin
- Hooks are scoped to the plugin
- Plugins can be nested

### Hooks
Lifecycle hooks for request processing:
```javascript
// Application hooks
fastify.addHook('onRequest', async (request, reply) => {
  // Fired when request is received
});

fastify.addHook('preHandler', async (request, reply) => {
  // Fired before route handler
});

fastify.addHook('onSend', async (request, reply, payload) => {
  // Fired before response is sent
});

fastify.addHook('onResponse', async (request, reply) => {
  // Fired when response is sent
});
```

## Routing

### Basic Routes
```javascript
fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

fastify.post('/users', async (request, reply) => {
  const user = await createUser(request.body);
  reply.code(201);
  return user;
});
```

### Route Options
```javascript
fastify.route({
  method: 'GET',
  url: '/users/:id',
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' }
        }
      }
    }
  },
  handler: async (request, reply) => {
    return await getUser(request.params.id);
  }
});
```

### Async/Await Support
Fastify fully supports async/await with proper error handling:
```javascript
fastify.get('/users', async (request, reply) => {
  try {
    const users = await User.find();
    return users;
  } catch (err) {
    reply.code(500);
    return { error: err.message };
  }
});
```

## Validation and Serialization

### JSON Schema
Fastify uses JSON Schema for request validation and response serialization:
```javascript
const userSchema = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    age: { type: 'integer', minimum: 0 }
  }
};

fastify.post('/users', {
  schema: {
    body: userSchema
  }
}, async (request, reply) => {
  // request.body is validated
  return await createUser(request.body);
});
```

### Schema Compiler
Customize validation with different schema compilers:
```javascript
// Using Ajv
fastify.setValidatorCompiler(({ schema }) => {
  return new Ajv().compile(schema);
});
```

## Decorators

Add custom methods to Fastify instance:
```javascript
fastify.decorate('utility', function() {
  return 'utility function';
});

// Usage
fastify.get('/', async (request, reply) => {
  return { result: fastify.utility() };
});
```

Request/Reply decorators:
```javascript
fastify.decorateRequest('user', null);
fastify.addHook('preHandler', async (request, reply) => {
  request.user = await authenticate(request);
});
```

## Logging

Built-in Pino logger:
```javascript
const fastify = require('fastify')({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
});

// Usage in routes
fastify.get('/', async (request, reply) => {
  request.log.info('Processing request');
  return { hello: 'world' };
});
```

## Error Handling

```javascript
// Custom error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  reply.code(error.statusCode || 500);
  return {
    error: error.message,
    code: error.code
  };
});

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404);
  return { error: 'Route not found' };
});
```

## Content Type Parsing

```javascript
// JSON (default)
fastify.post('/json', async (request, reply) => {
  return request.body; // Already parsed
});

// Custom parser
fastify.addContentTypeParser('text/xml', { parseAs: 'string' }, 
  async (request, body) => {
    return xmlParser.parse(body);
  }
);
```

## Plugins Ecosystem

### Database
- fastify-postgres
- fastify-mongodb
- fastify-redis
- fastify-typeorm
- fastify-prisma

### Authentication
- fastify-jwt
- fastify-auth
- fastify-basic-auth
- fastify-oauth2

### Utilities
- fastify-cors
- fastify-helmet
- fastify-compress
- fastify-rate-limit
- fastify-static

### Testing
- fastify-autoload
- fastify-cli

## Application Structure

```javascript
// app.js
const fastify = require('fastify')({ logger: true });

// Register plugins
fastify.register(require('./plugins/database'));
fastify.register(require('./plugins/auth'));

// Register routes
fastify.register(require('./routes/users'), { prefix: '/users' });
fastify.register(require('./routes/posts'), { prefix: '/posts' });

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

## Performance Characteristics

- Up to 20% faster than Express
- Lower memory footprint
- Efficient JSON schema validation
- Built-in support for HTTP/2
- Optimized logging with Pino

## TypeScript Support

```typescript
import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

const app: FastifyInstance = fastify({ logger: true });

interface UserRequest {
  name: string;
  email: string;
}

app.post<{ Body: UserRequest }>('/users', async (request, reply) => {
  const user = request.body; // Typed as UserRequest
  return user;
});
```
