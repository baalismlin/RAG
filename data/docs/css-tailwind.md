# Tailwind CSS

## Overview

Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs directly in markup. Unlike component-based frameworks like Bootstrap, Tailwind gives you building blocks to create unique designs without fighting against opinionated styles.

## Philosophy

### Utility-First
Instead of pre-built components, Tailwind provides atomic utility classes for every CSS property:
```html
<!-- Traditional approach -->
<div class="btn btn-primary">Button</div>

<!-- Tailwind approach -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Button
</button>
```

### Customization
Tailwind is designed to be customized. Every utility class can be configured through the configuration file.

## Installation

### Via CLI
```bash
# Install
npm install -D tailwindcss

# Initialize configuration
npx tailwindcss init
```

### Configuration (tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      spacing: {
        '128': '32rem',
        '144': '36rem'
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
};
```

### CSS Entry Point
```css
/* index.css */
@tailwind base;      /* Reset + base styles */
@tailwind components; /* Component classes */
@tailwind utilities;  /* Utility classes */

/* Custom styles */
@layer components {
  .btn-primary {
    @apply bg-blue-500 text-white font-bold py-2 px-4 rounded;
    @apply hover:bg-blue-700 focus:outline-none focus:ring-2;
  }
}

@layer utilities {
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
}
```

## Core Concepts

### Responsive Design
Mobile-first approach with responsive prefixes:
```html
<!-- Default (mobile) → sm → md → lg → xl → 2xl -->
<div class="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>

<div class="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>

<!-- Hidden on mobile, visible on desktop -->
<div class="hidden md:block">
  Desktop only
</div>
```

### Hover, Focus, and Other States
```html
<button class="bg-blue-500 hover:bg-blue-700 focus:ring-2 active:bg-blue-800">
  Interactive
</button>

<input class="border-2 focus:border-blue-500 focus:outline-none">

<div class="opacity-50 hover:opacity-100 transition-opacity">
  Fade on hover
</div>

<!-- First, last, odd, even -->
<ul>
  <li class="even:bg-gray-100">Item 1</li>
  <li class="even:bg-gray-100">Item 2</li>
</ul>
```

### Dark Mode
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  // ...
};
```

```html
<body class="bg-white dark:bg-gray-900">
  <div class="text-gray-900 dark:text-white">
    Dark mode content
  </div>
</body>
```

## Utility Categories

### Layout
```html
<!-- Container -->
<div class="container mx-auto px-4">
  
<!-- Display -->
<div class="block inline-block inline flex grid hidden">

<!-- Position -->
<div class="static fixed absolute relative sticky">
<div class="top-0 right-0 bottom-0 left-0 inset-0">

<!-- Z-index -->
<div class="z-0 z-10 z-50 z-auto">

<!-- Overflow -->
<div class="overflow-auto overflow-hidden overflow-scroll overflow-clip">
```

### Flexbox & Grid
```html
<!-- Flex -->
<div class="flex flex-row flex-col flex-wrap flex-nowrap">
<div class="items-start items-center items-end items-stretch">
<div class="justify-start justify-center justify-between justify-around">
<div class="flex-1 flex-auto flex-none flex-grow flex-shrink">

<!-- Gap -->
<div class="gap-2 gap-4 gap-8">

<!-- Grid -->
<div class="grid grid-cols-3 grid-cols-1 md:grid-cols-2">
<div class="col-span-2 col-span-full">
<div class="row-span-2">
```

### Spacing
```html
<!-- Padding -->
<div class="p-4 px-4 py-2 pt-4 pr-8 pb-2 pl-8">

<!-- Margin -->
<div class="m-4 mx-auto my-8 mt-2 mb-4">
<div class="-m-2">Negative margin</div>

<!-- Space between -->
<div class="space-x-4 space-y-2">
```

### Sizing
```html
<!-- Width -->
<div class="w-full w-1/2 w-64 w-screen w-min w-max">

<!-- Height -->
<div class="h-full h-32 h-screen h-min h-max">

<!-- Min/Max -->
<div class="min-w-0 min-h-screen max-w-md max-h-full">
```

### Typography
```html
<!-- Font -->
<p class="font-sans font-serif font-mono">
<p class="font-light font-normal font-medium font-bold">

<!-- Text size -->
<p class="text-xs text-sm text-base text-lg text-xl text-2xl text-4xl">

<!-- Text alignment -->
<p class="text-left text-center text-right text-justify">

<!-- Text color -->
<p class="text-gray-900 text-blue-500 text-red-600">

<!-- Text decoration -->
<p class="underline line-through no-underline decoration-wavy">

<!-- Line height & letter spacing -->
<p class="leading-tight leading-relaxed leading-loose">
<p class="tracking-tight tracking-wide tracking-wider">
```

### Backgrounds
```html
<!-- Background color -->
<div class="bg-white bg-gray-100 bg-blue-500">

<!-- Background image -->
<div class="bg-cover bg-contain bg-no-repeat bg-center">

<!-- Background gradient -->
<div class="bg-gradient-to-r from-blue-500 to-purple-600">

<!-- Opacity -->
<div class="bg-blue-500/50 bg-opacity-50">
```

### Borders
```html
<!-- Border width -->
<div class="border border-2 border-4 border-0 border-t-2">

<!-- Border color -->
<div class="border-gray-300 border-blue-500">

<!-- Border radius -->
<div class="rounded rounded-md rounded-lg rounded-full rounded-t-lg">

<!-- Border style -->
<div class="border-solid border-dashed border-dotted">
```

### Effects
```html
<!-- Shadow -->
<div class="shadow-sm shadow shadow-md shadow-lg shadow-xl shadow-2xl">

<!-- Opacity -->
<div class="opacity-0 opacity-50 opacity-100">

<!-- Blur -->
<div class="blur-sm blur-md blur-lg blur-xl">

<!-- Transition & Transform -->
<div class="transition duration-300 ease-in-out hover:scale-110">
```

## Advanced Features

### Arbitrary Values
Use one-off custom values with square brackets:
```html
<div class="w-[123px] h-[calc(100vh-4rem)] bg-[#1da1f2] text-[length:var(--font-size)]">
```

### @apply Directive
Extract utility patterns into components:
```css
@layer components {
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
    @apply hover:shadow-lg transition-shadow;
  }
  
  .btn {
    @apply px-4 py-2 rounded font-semibold;
    @apply focus:outline-none focus:ring-2;
  }
}
```

### @screen Directive
Reference breakpoints in CSS:
```css
.card {
  @apply w-full;
  
  @screen md {
    @apply w-1/2;
  }
  
  @screen lg {
    @apply w-1/3;
  }
}
```

### Plugin Development
```javascript
// tailwind.plugin.js
const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addComponents, addUtilities, theme }) {
  addComponents({
    '.btn': {
      padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
      borderRadius: theme('borderRadius.md'),
      fontWeight: theme('fontWeight.semibold')
    }
  });
  
  addUtilities({
    '.content-auto': {
      contentVisibility: 'auto'
    }
  });
});
```

## Official Plugins

### @tailwindcss/forms
```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/forms')
  ]
};
```

Provides base styles for form elements that are easy to override.

### @tailwindcss/typography
```html
<article class="prose lg:prose-xl">
  <!-- Beautiful typography for prose content -->
</article>
```

### @tailwindcss/aspect-ratio
```html
<div class="aspect-w-16 aspect-h-9">
  <iframe src="..." class="w-full h-full"></iframe>
</div>
```

### @tailwindcss/line-clamp
```html
<p class="line-clamp-3">
  Text will be truncated after 3 lines...
</p>
```

## Just-in-Time (JIT) Mode

Tailwind 3.0+ uses JIT by default, generating styles on demand:
- Instant build times
- All variants enabled by default
- Arbitrary values supported everywhere
- Better performance in development

## CLI Commands

```bash
# Watch mode
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch

# Production build (minified)
NODE_ENV=production npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify

# Using with PostCSS
npx postcss ./src/input.css -o ./dist/output.css
```

## Common Patterns

### Buttons
```html
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Primary
</button>

<button class="bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
  Secondary
</button>
```

### Cards
```html
<div class="max-w-sm rounded overflow-hidden shadow-lg">
  <img class="w-full" src="..." alt="...">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">Card Title</div>
    <p class="text-gray-700 text-base">Description</p>
  </div>
</div>
```

### Forms
```html
<form class="w-full max-w-lg">
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2">
      Email
    </label>
    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2" type="email">
  </div>
</form>
```

## Integration with Frameworks

- **React/Vue/Svelte**: Direct class usage
- **Next.js**: Built-in Tailwind support
- **Angular**: Configure in angular.json
- **Django/Laravel**: Use CDN or build pipeline
