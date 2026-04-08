# Alpine.js

## Overview

Alpine.js is a rugged, minimal framework for composing JavaScript behavior in markup. It offers the reactive and declarative nature of big frameworks like Vue or React at a much lower cost. Alpine is designed for developers who want to add interactivity to server-rendered HTML without a heavy JavaScript footprint.

## Philosophy

### HTML-Centric
Alpine brings reactivity directly to HTML through attributes, keeping JavaScript minimal and co-located with the markup it controls.

### Progressive Enhancement
Designed to enhance existing server-rendered pages rather than building full SPAs.

### Tailwind CSS Friendly
Created by the same team, Alpine pairs excellently with Tailwind's utility-first approach.

## Core Concepts

### x-data
Defines a component's data scope and reactive state:
```html
<div x-data="{ open: false, count: 0 }">
  <!-- Component content -->
</div>
```

### x-init
Runs code when component initializes:
```html
<div x-data="{}" x-init="console.log('Component ready')">
```

### x-show / x-if
Conditional rendering:
```html
<div x-show="open">Visible when open is true</div>
<template x-if="open"><div>Rendered when true</div></template>
```

### x-text / x-html
Dynamic content:
```html
<span x-text="count"></span>
<div x-html="htmlContent"></div>
```

### x-model
Two-way data binding for form inputs:
```html
<input x-model="searchQuery" type="text">
<select x-model="selected">
  <option value="1">One</option>
</select>
```

### x-on (or @)
Event handling:
```html
<button x-on:click="count++">Increment</button>
<button @click="count++">Shorthand</button>
<button @click.prevent="submit()">With modifier</button>
```

### x-bind (or :)
Attribute binding:
```html
<img x-bind:src="imageUrl" />
<button :disabled="!isValid">Submit</button>
```

### x-for
Loop rendering:
```html
<template x-for="item in items" :key="item.id">
  <div x-text="item.name"></div>
</template>
```

### x-ref
Template references:
```html
<input x-ref="inputField" />
<button @click="$refs.inputField.focus()">Focus</button>
```

## Magic Properties

### $el
Reference to the current DOM element.

### $refs
Object containing all x-ref elements.

### $store
Access global Alpine stores.

### $watch
Watch for data changes:
```javascript
$watch('count', value => console.log(value));
```

### $dispatch
Dispatch custom events:
```html
<button @click="$dispatch('notify', { message: 'Hello!' })">
```

### $data
Access the raw data object of a component.

## Advanced Features

### Transitions
Built-in transition utilities:
```html
<div x-show="open"
     x-transition:enter="transition ease-out duration-300"
     x-transition:enter-start="opacity-0 transform scale-95"
     x-transition:enter-end="opacity-100 transform scale-100">
</div>
```

### x-effect
Reactive effect that runs when dependencies change:
```html
<div x-effect="console.log('Count changed:', count)"></div>
```

### x-ignore
Prevent Alpine from initializing on an element.

## Global Store

Create reactive global state:
```javascript
Alpine.store('notifications', {
  items: [],
  
  add(message) {
    this.items.push(message);
  }
});
```

Access in templates:
```html
<div x-data x-text="$store.notifications.items.length"></div>
```

## Data/Reusable Components

Define reusable data objects:
```javascript
document.addEventListener('alpine:init', () => {
  Alpine.data('dropdown', () => ({
    open: false,
    toggle() { this.open = !this.open; }
  }));
});
```

Use in HTML:
```html
<div x-data="dropdown">
  <button @click="toggle">Toggle</button>
  <div x-show="open">Content</div>
</div>
```

## Plugins

### Collapse
Smooth height transitions for show/hide.

### Intersect
Trigger based on intersection observer.

### Persist
Persist data to localStorage.

### Focus
Keyboard focus trapping utilities.

### Morph
Morph DOM elements between states.

## Use Cases

- Dropdowns and modals
- Tabs and accordions
- Form validation
- Shopping carts
- Search interfaces
- Toast notifications
- Image carousels
