# SolidJS

## Overview

SolidJS is a declarative, efficient, and flexible JavaScript library for building user interfaces. It shares similarities with React in terms of syntax and component structure but takes a fundamentally different approach to reactivity, eschewing the virtual DOM entirely for fine-grained updates.

## Core Philosophy

### Fine-Grained Reactivity

SolidJS uses a reactive primitive system where dependencies are tracked at the statement level rather than the component level. This eliminates unnecessary re-renders and provides excellent performance.

### No Virtual DOM

Unlike React and Vue, SolidJS compiles templates to real DOM operations. When state changes, only the specific DOM nodes that depend on that state are updated.

### Read/Write Separation

Solid separates reactive reads from writes using signals, providing predictable data flow and better control over updates.

## Reactive Primitives

### createSignal

The fundamental reactive primitive that returns a getter and setter:

```javascript
const [count, setCount] = createSignal(0)
// Access: count()
// Update: setCount(5)
```

### createEffect

Runs side effects when dependencies change:

```javascript
createEffect(() => {
  console.log("Count changed:", count())
})
```

### createMemo

Cached derived values that only recalculate when dependencies change:

```javascript
const doubled = createMemo(() => count() * 2)
```

### createResource

Handles async data fetching with loading and error states:

```javascript
const [data] = createResource(sourceSignal, fetcherFunction)
```

## Component Model

### Components as Factory Functions

Solid components are functions that execute once to set up the reactive graph, then return JSX. The function body itself does not re-run on updates.

### Props

Props are accessed through a proxy object. Destructuring works but loses reactivity unless using Solid's `mergeProps` or `splitProps` utilities.

### Control Flow Components

Special components optimized for reactive updates:

- `<Show>`: Conditional rendering
- `<For>`: Efficient list rendering with keyed updates
- `<Switch>` / `<Match>`: Multiple conditional branches
- `<Index>`: List rendering optimized for non-reactive items
- `<Suspense>`: Async loading boundaries
- `<ErrorBoundary>`: Error handling

```jsx
<Show when={condition} fallback={<Loading />}>
  <Content />
</Show>

<For each={items}>{(item, index) =>
  <Item data={item} />
}</For>
```

## Stores

### createStore

Deeply reactive state containers for complex data structures:

```javascript
const [state, setState] = createStore({
  user: { name: "John", age: 30 },
  todos: [],
})

// Update with path syntax
setState("user", "age", 31)
```

### Store Features

- Path-based updates trigger minimal re-renders
- Support for nested reactivity
- Interoperability with signals

## Lifecycle

### onMount

Runs after initial render and mounting to DOM:

```javascript
onMount(() => {
  // Initialize third-party libraries
})
```

### onCleanup

Runs when component is destroyed or before effect re-runs:

```javascript
onCleanup(() => {
  // Clean up subscriptions, timers, etc.
})
```

## JSX and Templating

### Event Handling

Standard JSX event binding with camelCase names:

```jsx
<button onClick={() => setCount((c) => c + 1)}>Click me</button>
```

### Refs

Access DOM elements directly:

```jsx
let inputRef
;<input ref={inputRef} />
```

### Dynamic Attributes

Reactive attribute binding:

```jsx
<div class={active() ? "active" : "inactive"} />
```

## Ecosystem

### Solid Router

Official routing solution with nested routes, lazy loading, and navigation guards.

### Solid Start

Full-stack meta-framework providing SSR, file-system routing, and API routes.

### Store Integrations

Compatible with various state management patterns including Redux, Zustand, and XState.

## Performance Characteristics

- Fastest UI library in most benchmarks
- Minimal memory footprint
- Efficient updates without component re-execution
- Small bundle sizes (~7kb gzipped for core)
