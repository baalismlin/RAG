# Next.js

## Overview

Next.js is a React framework that enables server-side rendering, static site generation, and other production-ready features for React applications. Developed by Vercel, it provides an excellent developer experience with features like fast refresh, file-system routing, and built-in API routes.

## Rendering Strategies

### Static Site Generation (SSG)

Pages are pre-rendered at build time. Use `getStaticProps` to fetch data during build, ideal for content that doesn't change frequently like blogs and marketing pages.

### Server-Side Rendering (SSR)

Pages are rendered on each request. Use `getServerSideProps` for data that must be fetched per request, such as user-specific content.

### Incremental Static Regeneration (ISR)

Update static content after build time without rebuilding the entire site. Configure revalidation intervals to keep content fresh.

### Client-Side Rendering (CSR)

Standard React rendering where components fetch data and render in the browser. Use the SWR or React Query libraries for data fetching.

## App Router (Next.js 13+)

### Server Components

React Server Components run exclusively on the server, reducing JavaScript sent to the client. They can access backend resources directly and are the default in the App Router.

### Client Components

Components that need browser APIs or React hooks must be marked with 'use client' directive. They hydrate on the client after initial server render.

### Layouts and Nested Layouts

Create persistent UI across routes using layout files. Layouts can be nested for different sections of the application.

### Loading States

Define loading UI with `loading.js` files that automatically wrap pages and layouts with Suspense boundaries.

### Error Handling

Create error UI with `error.js` files that catch errors in nested routes and display fallback UI.

## Data Fetching

### fetch API

Next.js extends the native fetch API to support caching and revalidation:

```javascript
const data = await fetch("https://api.example.com/data", {
  next: { revalidate: 3600 },
})
```

### Cache Control

- `force-cache`: Cache indefinitely (default for SSG)
- `no-store`: Never cache (default for SSR)
- `revalidate`: Regenerate page after specified seconds

## API Routes

Create backend API endpoints within the Next.js application:

- File-system based routing in `app/api/` or `pages/api/`
- Support for GET, POST, PUT, DELETE handlers
- Edge runtime support for low-latency responses
- Middleware for request interception

## Key Features

### Image Optimization

The Image component automatically optimizes images:

- Lazy loading
- Responsive sizing
- Modern format conversion (WebP, AVIF)
- Priority loading for above-fold images

### Font Optimization

Built-in font optimization with next/font:

- Automatic self-hosting of Google Fonts
- Zero layout shift
- CSS size reduction

### Script Optimization

The Script component controls third-party script loading:

- beforeInteractive, afterInteractive, lazyOnload strategies
- Automatic deduplication

### Middleware

Intercept requests at the edge to:

- Authenticate users
- Rewrite or redirect URLs
- Apply A/B testing
- Handle bot detection

## Routing Features

### Dynamic Routes

Create routes with parameters using bracket notation: `[id].js`, `[...slug].js` for catch-all routes.

### Parallel Routes

Render multiple pages in the same layout simultaneously using named slots.

### Intercepting Routes

Intercept routes from other parts of the application while maintaining the current context.

### Route Groups

Organize routes without affecting URL structure using parentheses: `(shop)/products/page.js`.

## Deployment

Next.js applications deploy seamlessly to:

- Vercel (optimal platform with full feature support)
- Netlify, AWS, GCP, Azure
- Self-hosted with Node.js or Docker
