# Node.js

## Overview

Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser. Built on Chrome's V8 JavaScript engine, it enables developers to use JavaScript for server-side scripting and building scalable network applications.

## Core Concepts

### Event Loop
Node.js uses an event-driven, non-blocking I/O model:
- Single-threaded with event loop
- Non-blocking operations
- Callback queue for async operations
- libuv library for cross-platform async I/O

### Modules
CommonJS module system:
```javascript
// Export
module.exports = { foo, bar };
exports.baz = baz;

// Import
const { foo } = require('./module');
```

ES Modules support:
```javascript
// Export
export function foo() {}
export default main;

// Import
import { foo } from './module.js';
import main from './module.js';
```

### Global Objects
- `global`: Global namespace
- `process`: Process information and control
- `Buffer`: Binary data handling
- `__dirname`: Current directory path
- `__filename`: Current file path

## Built-in Modules

### http / https
Create web servers:
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(3000);
```

### fs (File System)
File operations:
```javascript
const fs = require('fs').promises;

// Async/await
const data = await fs.readFile('file.txt', 'utf8');
await fs.writeFile('file.txt', 'content');

// Sync (blocking)
const data = fs.readFileSync('file.txt', 'utf8');

// Streams
const stream = fs.createReadStream('large-file.txt');
stream.pipe(process.stdout);
```

### path
Path manipulation:
```javascript
const path = require('path');

path.join(__dirname, 'files', 'image.png');
path.resolve('files', 'image.png');
path.extname('file.txt'); // .txt
path.basename('/foo/bar.txt'); // bar.txt
```

### events
EventEmitter pattern:
```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter();

emitter.on('event', (data) => {
  console.log(data);
});

emitter.emit('event', 'Hello!');
```

### stream
Handle streaming data:
- Readable streams
- Writable streams
- Duplex streams
- Transform streams

### cluster
Create child processes to utilize CPU cores:
```javascript
const cluster = require('cluster');

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Worker process
  require('./server.js');
}
```

## Async Patterns

### Callbacks
Traditional async pattern:
```javascript
fs.readFile('file.txt', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

### Promises
```javascript
const promise = new Promise((resolve, reject) => {
  // Async operation
});

promise.then(result => {}).catch(err => {});
```

### Async/Await
Modern async syntax:
```javascript
async function fetchData() {
  try {
    const result = await asyncOperation();
    return result;
  } catch (err) {
    console.error(err);
  }
}
```

## Package Management

### npm
Node Package Manager:
- `npm install` - Install dependencies
- `npm install package` - Add dependency
- `npm install --save-dev package` - Add dev dependency
- `npm run script` - Run package scripts
- `npm publish` - Publish package

### package.json
Project configuration:
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### npx
Execute packages without installing:
```bash
npx create-react-app my-app
```

## Environment

### Environment Variables
```javascript
// .env file
DB_HOST=localhost
DB_PORT=5432

// Access
const dbHost = process.env.DB_HOST;
```

### dotenv
Load environment variables:
```javascript
require('dotenv').config();
```

## Debugging

### Node.js Inspector
```bash
node --inspect server.js
node --inspect-brk server.js  # Break on first line
```

### console methods
- `console.log()`
- `console.error()`
- `console.table()`
- `console.time() / console.timeEnd()`
- `console.trace()`

## Performance

### Worker Threads
Offload CPU-intensive tasks:
```javascript
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  const worker = new Worker(__filename);
  worker.on('message', (msg) => console.log(msg));
} else {
  // CPU intensive work
  parentPort.postMessage(result);
}
```

### Clustering
Scale across CPU cores (see cluster module).

## Testing

Common testing frameworks:
- Jest
- Mocha + Chai
- Vitest
- Node.js built-in test runner (node:test)
