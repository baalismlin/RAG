# Lit

## Overview

Lit is a simple, fast, and lightweight library for building web components. Developed by Google, it builds on top of Web Components standards, providing reactive state, scoped styles, and a declarative template system while maintaining compatibility with all frameworks and vanilla HTML.

## Core Concepts

### Web Components Standards
Lit leverages native browser APIs:
- Custom Elements: Define new HTML elements
- Shadow DOM: Encapsulated DOM and styling
- ES Modules: Standard module system

### Reactive Updates
Lit components automatically re-render when reactive properties change, using a highly efficient update batching system.

## Component Structure

```javascript
import { LitElement, html, css } from 'lit';

class MyElement extends LitElement {
  static properties = {
    name: { type: String },
    count: { type: Number }
  };

  static styles = css`
    :host { display: block; }
    p { color: blue; }
  `;

  constructor() {
    super();
    this.name = 'World';
    this.count = 0;
  }

  render() {
    return html`
      <p>Hello, ${this.name}!</p>
      <button @click=${this._increment}>Count: ${this.count}</button>
    `;
  }

  _increment() {
    this.count++;
  }
}

customElements.define('my-element', MyElement);
```

## Reactive Properties

### Property Options
```javascript
static properties = {
  // Basic property
  prop1: { type: String },
  
  // With default and reflect to attribute
  prop2: { type: Number, reflect: true },
  
  // State (internal reactive property, not attribute)
  _state: { state: true },
  
  // Custom converter
  date: { converter: { fromAttribute: String, toAttribute: String } }
};
```

### Property Types
Lit supports converters for: String, Number, Boolean, Array, Object

## Styling

### Scoped Styles
Styles defined in `static styles` are scoped to the component's shadow DOM:
- Automatically scoped, no class name collisions
- CSS custom properties (variables) pierce shadow boundaries
- CSS parts (::part) expose internal elements for external styling

### CSS Selectors
- `:host`: Styles the custom element itself
- `:host([attribute])`: Styles based on attributes
- `::slotted(*)`: Styles distributed children

### Style Inheritance
CSS custom properties inherit through shadow boundaries, enabling theme systems.

## Templates

### lit-html
Lit uses lit-html for efficient template rendering:
- Tagged template literals with `html` tag
- Efficient updates through string parsing and DOM diffing
- Directives for advanced template behaviors

### Directives
- `repeat`: Efficient list rendering with keyed updates
- `cache`: Cache rendered DOM
- `classMap` / `styleMap`: Dynamic classes and styles
- `live`: Two-way binding for form elements
- `until`: Handle promises

```javascript
import { repeat } from 'lit/directives/repeat.js';

render() {
  return html`
    ${repeat(this.items, item => item.id, item => html`
      <li>${item.name}</li>
    `)}
  `;
}
```

## Lifecycle

### Standard Custom Element Lifecycle
- `constructor()`: Initialize properties
- `connectedCallback()`: Element added to DOM
- `disconnectedCallback()`: Element removed from DOM
- `attributeChangedCallback()`: Observed attribute changed

### Lit-Specific Lifecycle
- `willUpdate(changedProperties)`: Before update
- `update(changedProperties)`: Perform update
- `render()`: Return template
- `firstUpdated()`: After first render
- `updated(changedProperties)`: After each render

## Decorators (TypeScript)

Lit provides decorators for cleaner syntax:
```javascript
@property() name = 'World';
@state() private _count = 0;
@query('#button') buttonEl;
@queryAsync('#button') buttonElPromise;
@queryAll('.item') items;
```

## Interoperability

### With Frameworks
Lit components work in any framework:
- React: Use wrapper utilities or direct tag usage
- Vue: Treat as custom elements
- Angular: Import in modules
- Svelte: Use as standard HTML elements

### Without Framework
Lit components work in vanilla HTML/JS:
```html
<script type="module" src="my-element.js"></script>
<my-element name="Lit"></my-element>
```

## Ecosystem

### Lit Labs
Experimental features and upcoming APIs being tested.

### @lit/localize
Internationalization and localization tools.

### @lit/task
Async task controller for handling promises.

### @lit/context
Dependency injection for web components.

## Advantages

- Framework agnostic - works anywhere
- Native browser support (no runtime needed)
- Small bundle sizes (~5kb)
- Future-proof based on web standards
- Excellent performance
