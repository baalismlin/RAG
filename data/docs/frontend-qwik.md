# Qwik

## Overview

Qwik is a new-generation web framework designed for instant-loading applications. Its core innovation is resumability - the ability to resume execution on the client from where the server left off, without hydration or replaying all the application logic.

## Philosophy

### Resumability vs Hydration

Traditional frameworks send HTML then re-execute all component code (hydration). Qwik's resumability serializes application state and continues execution instantly.

### Lazy Loading by Default

Qwik delays loading and executing JavaScript until absolutely necessary, resulting in near-zero initial JavaScript.

### Progressive Resumability

Applications start immediately interactive as users interact, rather than waiting for all code to download and execute.

## Core Concepts

### Resumable Applications

Qwik serializes:

- Component state
- Event listeners (as serialized references)
- Application state

The client resumes without re-running component constructors or effects.

### Lazy Loading

Every symbol in Qwik can be lazy loaded:

- Components
- Event handlers
- Effects
- Styles

### $ Signifier

The `$` suffix indicates lazy-loaded boundaries:

```javascript
// Lazy loaded on click
const onClick = $(() => {
  console.log("clicked")
})
```

## Component Model

```javascript
import { component$ } from "@builder.io/qwik"

export const Counter = component$(() => {
  const count = useSignal(0)

  return <button onClick$={() => count.value++}>Count: {count.value}</button>
})
```

## State Management

### useSignal

Reactive primitive for single values:

```javascript
const count = useSignal(0)
// Access: count.value
// Update: count.value++
```

### useStore

Reactive object for complex state:

```javascript
const state = useStore({
  user: { name: "John" },
  items: [],
})
// Reactive: state.user.name = 'Jane' updates UI
```

### useContext / useContextProvider

Share state across component tree:

```javascript
export const AppContext = createContextId("app")

// In parent
useContextProvider(AppContext, state)

// In child
const state = useContext(AppContext)
```

## Tasks and Effects

### useTask$ (isomorphic)

Runs on server and client:

```javascript
useTask$(({ track }) => {
  track(() => count.value)
  console.log("Count changed:", count.value)
})
```

### useVisibleTask$ (client-only)

Runs only when component becomes visible:

```javascript
useVisibleTask$(() => {
  // Initialize third-party library
})
```

### useResource$

Async data fetching:

```javascript
const users = useResource$(async ({ track, cleanup }) => {
  track(() => filter.value)
  const controller = new AbortController()
  cleanup(() => controller.abort())

  return await fetchUsers(filter.value, controller.signal)
})
```

## Routing

### File-Based Routing

```
src/
  routes/
    index.tsx           # /
    about/
      index.tsx         # /about
    user/
      [id]/
        index.tsx       # /user/:id
        settings.tsx    # /user/:id/settings
```

### Layouts

```javascript
// src/routes/layout.tsx
export default component$(() => {
  return (
    <div class="layout">
      <Slot /> {/* Child routes render here */}
    </div>
  )
})
```

## Server Functions

### routeLoader$

Load data on server during navigation:

```javascript
export const useProductData = routeLoader$(async (requestEvent) => {
  const id = requestEvent.params.id
  return await getProduct(id)
})
```

### routeAction$

Handle form submissions:

```javascript
export const useAddUser = routeAction$(async (data) => {
  return await createUser(data)
})

// In component
const addUser = useAddUser()

return (
  <Form action={addUser}>
    <input name="name" />
    <button type="submit">Add</button>
  </Form>
)
```

### server$

Execute arbitrary code on server:

```javascript
const dbQuery = server$(async (query) => {
  // Runs only on server
  return await db.query(query)
})
```

## Optimizer

Qwik's optimizer handles:

- Code splitting at $ boundaries
- Symbol extraction for lazy loading
- Tree-shaking of unused code

## Prefetching

Qwik intelligently prefetches:

- Visible interactive elements
- Hover/touch-start targets
- Predicted next routes

## Benefits

- Instant Time to Interactive (< 200ms)
- Minimal JavaScript on initial load
- Excellent Core Web Vitals scores
- Better mobile performance
- SEO-friendly by default
- Progressive enhancement

## Ecosystem

### Qwik City

Full-stack meta-framework with file-based routing, middleware, and deployment adapters.

### Partytown

Web worker integration for third-party scripts.

### Auth.js

Authentication integration.
