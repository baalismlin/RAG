# Vite

## Overview

Vite is a next-generation frontend build tool created by Evan You (creator of Vue.js). It provides a significantly faster development experience through native ES modules and optimized production builds using Rollup. Vite addresses the slow server start and slow updates issues common in traditional bundler-based build tools.

## Core Concepts

### Dev Server
Vite's development server uses native ES modules, providing:
- Instant server start (no bundling needed)
- Lightning-fast hot module replacement (HMR)
- On-demand compilation of modules

### Production Build
For production, Vite bundles code using Rollup:
- Highly optimized static assets
- Code splitting
- Tree shaking
- Asset optimization

## Getting Started

### Installation
```bash
# npm
npm create vite@latest my-project

# yarn
yarn create vite my-project

# pnpm
pnpm create vite my-project

# bun
bun create vite my-project
```

### Project Templates
```bash
# Available templates
npm create vite@latest my-project -- --template react
npm create vite@latest my-project -- --template vue
npm create vite@latest my-project -- --template svelte
npm create vite@latest my-project -- --template preact
npm create vite@latest my-project -- --template lit
npm create vite@latest my-project -- --template vanilla
npm create vite@latest my-project -- --template solid

# TypeScript variants
npm create vite@latest my-project -- --template react-ts
npm create vite@latest my-project -- --template vue-ts
```

## Configuration

### vite.config.js/ts
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  // Plugins
  plugins: [react()],
  
  // Path aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  
  // Server configuration
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    cors: true,
    hmr: {
      overlay: true
    }
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material']
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  
  // Preview configuration
  preview: {
    port: 4173,
    open: true
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/styles/variables.scss";`
      }
    }
  },
  
  // Environment variables
  envDir: './env',
  envPrefix: 'VITE_',
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});
```

## Features

### Hot Module Replacement (HMR)
```javascript
// Vite handles HMR automatically for:
// - React (via @vitejs/plugin-react)
// - Vue (built-in)
// - Svelte (via @sveltejs/vite-plugin-svelte)

// Manual HMR handling
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // New module is loaded
      newModule.render();
    }
  });
  
  import.meta.hot.dispose((data) => {
    // Cleanup before module is replaced
    data.someData = 'preserve this';
  });
}
```

### Environment Variables
```javascript
// .env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=MyApp

// Access in code
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.VITE_APP_NAME);

// Built-in variables
console.log(import.meta.env.MODE);        // 'development' | 'production'
console.log(import.meta.env.BASE_URL);   // base public path
console.log(import.meta.env.PROD);        // true in production
console.log(import.meta.env.DEV);         // true in development
console.log(import.meta.env.SSR);         // true in SSR
```

### Static Asset Handling
```javascript
// Import assets
import logo from './assets/logo.png';

// Import as URL
import logoUrl from './assets/logo.png?url';

// Import as raw string
import rawSvg from './assets/icon.svg?raw';

// Import as worker
import Worker from './worker.js?worker';

// Import as shared worker
import SharedWorker from './shared-worker.js?sharedworker';

// Inline worker
import InlineWorker from './worker.js?worker&inline';
```

### CSS Features
```javascript
// CSS imports with side effects
import './global.css';

// CSS modules
import styles from './Component.module.css';

// Scoped CSS (Vue SFC, Svelte)
<style scoped>
/* Component-scoped styles */
</style>

// CSS preprocessor (Sass/SCSS, Less, Stylus)
import './styles.scss';

// CSS with PostCSS (automatic)
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

## Plugins

### Official Plugins
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import svelte from '@sveltejs/vite-plugin-svelte';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,tsx}',
      babel: {
        plugins: ['styled-components']
      }
    }),
    
    // Legacy browser support
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
});
```

### Community Plugins
```javascript
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
import svgr from 'vite-plugin-svgr';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    // Bundle visualizer
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    }),
    
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    
    // SVG as React components
    svgr(),
    
    // TypeScript checker overlay
    checker({
      typescript: true,
      eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' }
    })
  ]
});
```

## Build Optimizations

### Code Splitting
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor code
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('lodash')) return 'lodash';
            return 'vendor';
          }
          
          // Split by route
          if (id.includes('src/pages/admin')) return 'admin';
          if (id.includes('src/pages/dashboard')) return 'dashboard';
        }
      }
    }
  }
});
```

### Dynamic Imports
```javascript
// Lazy load components
const AdminPanel = lazy(() => import('./AdminPanel'));

// Prefetch components
const prefetchComponent = () => {
  const component = import(/* webpackPrefetch: true */ './HeavyComponent');
};
```

## SSR Configuration

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: true,
    rollupOptions: {
      input: './src/entry-server.js'
    }
  }
});
```

## Library Mode

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'MyLib',
      fileName: 'my-lib',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
```

## CLI Commands

```bash
# Dev server
vite
vite --port 3000 --open

# Build for production
vite build
vite build --outDir dist-prod

# Preview production build
vite preview
vite preview --port 4173

# Build with specific config
vite build --config vite.config.prod.ts

# Mode-specific build
vite build --mode staging
```

## Comparison with Other Tools

| Feature | Vite | webpack | Create React App |
|---------|------|---------|------------------|
| Dev server start | Instant | Slow | Slow |
| HMR | Fast | Slower | Slower |
| Build speed | Fast | Slower | Slower |
| Config | Simple | Complex | Hidden |
| Bundle size | Optimized | Optimized | Larger |
| Modern standards | Yes | Configurable | Limited |

## Best Practices

1. Use path aliases for cleaner imports
2. Configure manual chunks for better caching
3. Enable sourcemaps in development
4. Use environment variables for configuration
5. Optimize images and assets
6. Enable compression for production
7. Use tree-shaking friendly libraries
