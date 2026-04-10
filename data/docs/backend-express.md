# Express.js

## Overview

Express.js is a fast, unopinionated, minimalist web framework for Node.js. It provides a robust set of features for web and mobile applications, making it one of the most popular frameworks for building APIs and web servers in the Node.js ecosystem.

## Core Concepts

### Middleware

The foundation of Express - functions that process requests:

```javascript
// Application-level middleware
app.use((req, res, next) => {
  console.log("Request:", req.method, req.path)
  next()
})

// Route-specific middleware
app.get("/user", authMiddleware, (req, res) => {
  res.json({ user: req.user })
})
```

### Routing

Define routes for HTTP methods:

```javascript
// Basic routes
app.get("/", (req, res) => res.send("Hello"))
app.post("/users", createUser)
app.put("/users/:id", updateUser)
app.delete("/users/:id", deleteUser)

// Route parameters
app.get("/users/:userId/posts/:postId", (req, res) => {
  const { userId, postId } = req.params
  res.json({ userId, postId })
})

// Route chaining
app.route("/users").get(getUsers).post(createUser)
```

### Request and Response Objects

#### Request (req)

- `req.params` - Route parameters
- `req.query` - Query string parameters
- `req.body` - Request body (requires body-parser)
- `req.headers` - Request headers
- `req.cookies` - Cookies
- `req.ip` - Client IP address

#### Response (res)

- `res.send()` - Send response
- `res.json()` - Send JSON response
- `res.status()` - Set status code
- `res.redirect()` - Redirect to URL
- `res.render()` - Render template
- `res.set()` / `res.header()` - Set headers

## Middleware Types

### Built-in

```javascript
app.use(express.json()) // Parse JSON bodies
app.use(express.urlencoded()) // Parse form data
app.use(express.static("public")) // Serve static files
```

### Third-Party

```javascript
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const compression = require("compression")

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(compression())
```

### Error Handling

```javascript
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: err.message || "Internal Server Error",
  })
})
```

## Router

Create modular route handlers:

```javascript
const router = express.Router()

router.get("/", getAllItems)
router.get("/:id", getItem)
router.post("/", createItem)

// Mount router
app.use("/api/items", router)
```

## Template Engines

Express supports various template engines:

```javascript
app.set("view engine", "pug")
app.set("views", "./views")

app.get("/", (req, res) => {
  res.render("index", { title: "Express App" })
})
```

Popular engines: Pug, EJS, Handlebars, Mustache

## Session Management

```javascript
const session = require("express-session")

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 60000 },
  })
)
```

## Authentication

### JWT Implementation

```javascript
const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access denied" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(400).json({ error: "Invalid token" })
  }
}
```

## File Uploads

```javascript
const multer = require("multer")

const upload = multer({ dest: "uploads/" })

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ file: req.file })
})

// Multiple files
app.post("/upload-multiple", upload.array("files", 5), handler)
```

## Application Structure

```
src/
├── controllers/    # Route handlers
├── middleware/     # Custom middleware
├── models/         # Data models
├── routes/         # Route definitions
├── services/       # Business logic
├── utils/          # Utility functions
├── config/         # Configuration
└── app.js          # Application entry
```

## Advanced Patterns

### Async Handler Wrapper

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

app.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await User.find()
    res.json(users)
  })
)
```

### Request Validation

```javascript
const { body, validationResult } = require("express-validator")

app.post("/users", [body("email").isEmail(), body("password").isLength({ min: 6 })], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  // Process valid request
})
```

## Performance

### Compression

```javascript
const compression = require("compression")
app.use(compression())
```

### Rate Limiting

```javascript
const rateLimit = require("express-rate-limit")

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

app.use("/api/", limiter)
```

## Testing

```javascript
const request = require("supertest")
const app = require("./app")

describe("GET /users", () => {
  it("should return all users", async () => {
    const res = await request(app).get("/users")
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeInstanceOf(Array)
  })
})
```

## Deployment

Common deployment platforms:

- Heroku
- Vercel
- AWS Elastic Beanstalk
- Digital Ocean
- Railway
- Render

## Security Best Practices

- Use helmet for security headers
- Implement rate limiting
- Validate and sanitize all inputs
- Use parameterized queries (prevent SQL injection)
- Enable CORS appropriately
- Use HTTPS in production
- Keep dependencies updated
- Implement proper authentication
