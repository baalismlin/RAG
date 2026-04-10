# Svelte

## Overview

Svelte is a radical approach to building user interfaces. Unlike traditional frameworks like React and Vue, which do most of their work in the browser, Svelte shifts that work into a compile step that happens during build time. This results in highly optimized vanilla JavaScript with no runtime overhead.

## Core Philosophy

### Compile-Time Framework

Svelte converts components into efficient imperative code that surgically updates the DOM. There's no virtual DOM diffing process, leading to better performance and smaller bundle sizes.

### Write Less Code

Svelte reduces boilerplate significantly. Components are written with minimal ceremony, automatically handling reactivity without explicit state management calls.

### True Reactivity

Variables are reactive by default. Assigning a new value to a variable automatically triggers updates in the UI.

## Component Structure

Svelte components are defined in `.svelte` files with three optional sections:

```svelte
<script>
  // JavaScript logic
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Count: {count}
</button>

<style>
  button { background: #ff3e00; }
</style>
```

## Reactivity System

### Reactive Declarations

Use `$:` label to mark statements as reactive:

```svelte
$: doubled = count * 2;
$: if (count > 10) alert('Too high!');
```

### Reactive Statements

Any top-level statement can be made reactive, automatically re-running when dependencies change.

### Stores

Svelte provides writable, readable, and derived stores for global state management:

- writable: Create stores with get/set methods
- readable: Stores with external control
- derived: Compute values from other stores

## Templating Features

### Logic Blocks

```svelte
{#if condition}
  <p>Condition is true</p>
{:else}
  <p>Condition is false</p>
{/if}

{#each items as item, index}
  <li>{index}: {item.name}</li>
{/each}

{#await promise}
  <p>Loading...</p>
{:then value}
  <p>{value}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

### Event Handling

- DOM events: `on:eventname`
- Component events: `on:eventname`
- Event modifiers: `|preventDefault`, `|stopPropagation`, `|once`, `|self`

### Bindings

Two-way data binding for form elements:

- `bind:value` for inputs
- `bind:checked` for checkboxes
- `bind:group` for radio buttons
- `bind:this` for element references

## Transitions and Animations

Built-in transition directives:

- fade: Opacity transition
- fly: Translation and opacity
- slide: Height transition
- scale: Scaling transition
- draw: SVG stroke animation

Custom transitions can be defined using CSS or JavaScript.

## SvelteKit

Full-stack framework built on Svelte providing:

- File-based routing
- Server-side rendering
- API endpoints
- Adapters for various deployment targets
- Client-side navigation

## Advantages

- Smaller bundle sizes (no runtime framework code)
- Better runtime performance (no virtual DOM)
- Easier to learn with less boilerplate
- Built-in animations and transitions
- Scoped CSS by default
