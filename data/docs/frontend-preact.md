# Preact

## Overview

Preact is a fast, lightweight alternative to React with the same ES6 API. At just 3kb gzipped, it provides the core React features while being significantly smaller and faster. Preact is designed for performance and can be used directly or as a drop-in replacement for React.

## Philosophy

### Size-First

Preact prioritizes small bundle size without sacrificing functionality. The entire library is ~3kb compared to React's ~40kb.

### Compatibility

Preact offers a compatibility layer (preact/compat) that allows using React npm packages seamlessly.

### Performance

Optimized for memory usage and execution speed, particularly beneficial for mobile devices and low-end hardware.

## Core Features

### Virtual DOM

Like React, Preact uses a virtual DOM for efficient updates, but with optimizations for smaller memory footprint and faster reconciliation.

### Components

Supports both class components and function components with hooks:

```javascript
// Class component
class Counter extends Component {
  state = { count: 0 }

  increment = () => {
    this.setState({ count: this.state.count + 1 })
  }

  render() {
    return h("button", { onClick: this.increment }, `Count: ${this.state.count}`)
  }
}

// Function component with hooks
function Counter() {
  const [count, setCount] = useState(0)

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

### h() vs createElement

Preact uses `h()` (hyperscript) as the base JSX transformation target, though JSX typically compiles transparently.

## Hooks API

Preact provides the same hooks as React:

- useState, useEffect, useContext, useReducer
- useMemo, useCallback, useRef
- useLayoutEffect
- Custom hooks work identically

## Differences from React

### Synthetic Events

Preact uses the browser's native event system rather than a synthetic event layer, resulting in smaller code and better performance.

### Component Lifecycle

Preact's lifecycle methods behave similarly but with some timing differences for optimization.

### Children API

Preact uses `props.children` directly without React.Children utilities.

## preact/compat

Use React packages with Preact:

```javascript
// In webpack/vite config
{
  "resolve": {
    "alias": {
      "react": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime"
    }
  }
}
```

## Preact Signals

Fine-grained reactive state management:

```javascript
import { signal, computed, effect } from "@preact/signals"

const count = signal(0)
const doubled = computed(() => count.value * 2)

effect(() => {
  console.log("Count changed:", count.value)
})

// Update
const increment = () => count.value++
```

Use in components:

```javascript
function Counter() {
  const count = useSignal(0)

  return <button onClick={() => count.value++}>{count.value}</button>
}
```

## Preact Router

Lightweight routing solution:

```javascript
import { Router, Route, Link } from "preact-router"

function App() {
  return (
    <div>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </nav>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
      </Router>
    </div>
  )
}
```

## Server-Side Rendering

Preact provides `preact-render-to-string` for SSR:

```javascript
import render from "preact-render-to-string"
import { h } from "preact"

const html = render(<App />)
```

## DevTools

Preact DevTools extension integrates with browser developer tools for component inspection and debugging.

## When to Use Preact

- Mobile-first applications
- Embedded widgets
- Performance-critical applications
- Progressive Web Apps
- Sites requiring fast initial load
- Projects wanting React API without the size

## Ecosystem

### Third-party Compatibility

Most React libraries work via preact/compat, including:

- React Router
- Redux
- React Query
- Styled Components
- Framer Motion
