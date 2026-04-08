# HTMX

## Overview

HTMX is a library that allows you to access modern browser features directly from HTML, without writing JavaScript. It enables AJAX, CSS Transitions, WebSockets, and Server-Sent Events using HTML attributes, allowing developers to build modern user interfaces with the simplicity of server-side rendering.

## Philosophy

### Hypermedia-Driven Applications
HTMX embraces REST and HATEOAS principles, treating HTML as the application state rather than JSON APIs.

### Progress over SPAs
HTMX provides modern interactivity while keeping applications server-rendered, reducing complexity and improving performance.

### Locality of Behavior
HTMX attributes are placed directly on the elements they affect, making code self-documenting and easier to maintain.

## Core Attributes

### hx-get / hx-post / hx-put / hx-delete / hx-patch
Issue HTTP requests:
```html
<button hx-get="/api/users" hx-target="#users">
  Load Users
</button>
```

### hx-target
Specify where to place the response:
```html
<div hx-get="/detail" hx-target="this">
  <!-- Response replaces this element -->
</div>
```

### hx-trigger
Control when requests are made:
```html
<input hx-get="/search" 
       hx-trigger="keyup changed delay:500ms"
       hx-target="#results" />
```

### hx-swap
Control how response is inserted:
- `innerHTML` - Replace inner content (default)
- `outerHTML` - Replace entire element
- `beforebegin` - Insert before element
- `afterbegin` - Insert at beginning of content
- `beforeend` - Insert at end of content
- `afterend` - Insert after element
- `delete` - Delete target regardless of response
- `none` - Don't insert response

### hx-indicator
Show loading states:
```html
<button hx-get="/slow-endpoint" hx-indicator=".loading">
  Submit
</button>
<div class="loading htmx-indicator">Loading...</div>
```

### hx-vals / hx-include
Add values to requests:
```html
<button hx-post="/action" hx-vals='{"key": "value"}'>
  Action
</button>
```

## Advanced Features

### hx-boost
Progressively enhance links and forms:
```html
<div hx-boost="true">
  <a href="/page">Loads via AJAX</a>
  <form action="/submit">Submits via AJAX</form>
</div>
```

### hx-history
Control browser history:
- `hx-push-url="true"` - Push URL to history
- `hx-replace-url="true"` - Replace current history entry

### Out of Band Swaps
Return multiple elements in response using `hx-swap-oob`:
```html
<!-- Server response -->
<div>Main content</div>
<div id="sidebar" hx-swap-oob="true">Sidebar update</div>
```

### hx-confirm
Add confirmation dialogs:
```html
<button hx-delete="/item" hx-confirm="Are you sure?">
  Delete
</button>
```

### hx-disable
Temporarily disable HTMX on an element.

## Extensions

### WebSockets
```html
<div hx-ext="ws" ws-connect="/chat">
  <div id="messages"></div>
  <form ws-send>
    <input name="message" />
  </form>
</div>
```

### Server-Sent Events
```html
<div hx-ext="sse" sse-connect="/events" sse-swap="message">
  <!-- Updates when server sends events -->
</div>
```

### Alpine.js Integration
Works seamlessly with Alpine for client-side state.

## Events

HTMX dispatches useful events:
- `htmx:beforeRequest` - Before AJAX request
- `htmx:afterRequest` - After request completes
- `htmx:afterOnLoad` - After content swapped
- `htmx:confirm` - Custom confirmation handling
- `htmx:targetError` - Target element not found

Listen for events:
```javascript
document.body.addEventListener('htmx:afterSwap', (evt) => {
  console.log('Content updated:', evt.detail.target);
});
```

## CSS Classes

HTMX adds CSS classes during operations:
- `htmx-request` - Added during request
- `htmx-loading` - Alias for request
- `htmx-settling` - Added during swap settling
- `htmx-swapping` - Added during swap animation

## Server Integration

HTMX works with any server framework:
- Django, Rails, Laravel, Express
- Return partial HTML instead of JSON
- Server controls what gets updated

## Benefits

- No build step required
- Smaller bundle sizes
- Progressive enhancement approach
- Works with existing server-rendered apps
- Better SEO out of the box
- Reduced JavaScript complexity
- Faster time to interactive

## When to Use

- Server-rendered applications needing interactivity
- Teams preferring backend-focused development
- Reducing JavaScript complexity
- Adding modern UX to traditional web apps
- Content-heavy sites with interactive elements
