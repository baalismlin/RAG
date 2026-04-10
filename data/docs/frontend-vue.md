# Vue.js

## Overview

Vue.js is a progressive JavaScript framework for building user interfaces. Created by Evan You in 2014, Vue is designed to be incrementally adoptable, with a core library focused on the view layer only. It can power sophisticated Single-Page Applications (SPAs) when combined with modern tooling and supporting libraries.

## Core Features

### Reactive Data Binding

Vue uses a reactive data system that automatically updates the DOM when data changes. This reactivity system is based on JavaScript Proxies in Vue 3, providing fine-grained tracking of dependencies.

### Component-Based Architecture

Vue components are self-contained units with their own template, logic, and styling. Components can be nested and reused throughout the application.

### Declarative Rendering

Vue extends standard HTML with a template syntax that allows declaratively describing HTML output based on JavaScript state.

## Vue 3 Composition API

### setup() Function

The entry point for Composition API logic, where reactive state, computed properties, and methods are defined.

### Reactive References (ref)

Creates reactive references to primitive values using `ref()`. Accessed and modified through the `.value` property.

### Reactive Objects (reactive)

Creates reactive objects with `reactive()`, allowing direct property access and modification.

### Computed Properties

Define computed values that automatically update when dependencies change using `computed()`.

### Lifecycle Hooks

Composition API provides onMounted, onUpdated, onUnmounted, and other lifecycle hooks as functions.

## Directives

### v-bind

Dynamically bind one or more attributes to an expression.

### v-model

Create two-way binding on form elements and components.

### v-if / v-else / v-else-if

Conditionally render elements based on expression truthiness.

### v-for

Render lists by iterating over arrays or objects.

### v-on (or @)

Attach event listeners to elements for handling user interactions.

## Single File Components (SFC)

Vue Single File Components use `.vue` files that combine template, script, and style sections:

```vue
<template>
  <div class="greeting">{{ msg }}</div>
</template>

<script setup>
import { ref } from "vue"
const msg = ref("Hello Vue!")
</script>

<style scoped>
.greeting {
  color: blue;
}
</style>
```

## Ecosystem

### Vue Router

Official routing library for building SPAs with nested routes and navigation guards.

### Pinia

Modern state management library, now the recommended alternative to Vuex.

### Nuxt.js

Full-stack framework for Vue applications with SSR, SSG, and file-based routing.

### Vuetify / Quasar

Material Design component frameworks for rapid UI development.

## Performance Features

- Async component loading with `defineAsyncComponent`
- Tree-shaking support for smaller bundle sizes
- Fragment support for multiple root elements
- Better TypeScript support and inference
