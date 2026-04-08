# Webpack

## Overview

Webpack is a static module bundler for modern JavaScript applications. It takes modules with dependencies and generates static assets representing those modules. Webpack is highly configurable and powers many popular frameworks and build tools.

## Core Concepts

### Entry
The starting point of the dependency graph:
```javascript
module.exports = {
  entry: './src/index.js',
  // or
  entry: {
    main: './src/index.js',
    vendor: './src/vendor.js'
  }
};
```

### Output
Where bundled files are emitted:
```javascript
const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    publicPath: '/',
    clean: true
  }
};
```

### Loaders
Transform files into modules:
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  }
};
```

### Plugins
Perform broader tasks:
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico'
    })
  ]
};
```

### Mode
Optimization settings based on environment:
```javascript
module.exports = {
  mode: 'development', // or 'production' or 'none'
  devtool: 'source-map'
};
```

## Complete Configuration Example

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.js',
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction 
        ? '[name].[contenthash:8].js' 
        : '[name].js',
      chunkFilename: isProduction 
        ? '[name].[contenthash:8].chunk.js' 
        : '[name].chunk.js',
      publicPath: '/',
      clean: true
    },
    
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils')
      }
    },
    
    module: {
      rules: [
        // JavaScript/TypeScript
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript'
              ],
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-proposal-class-properties'
              ]
            }
          }
        },
        
        // CSS
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  auto: true,
                  localIdentName: isProduction 
                    ? '[hash:base64:8]' 
                    : '[name]__[local]--[hash:base64:5]'
                }
              }
            },
            'postcss-loader'
          ]
        },
        
        // SCSS
        {
          test: /\.s[ac]ss$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },
        
        // Images
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024 // 8kb
            }
          },
          generator: {
            filename: 'images/[name].[hash:8][ext]'
          }
        },
        
        // Fonts
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext]'
          }
        }
      ]
    },
    
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true
        } : false
      }),
      
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash:8].css',
          chunkFilename: '[name].[contenthash:8].chunk.css'
        }),
        
        env.analyze && new BundleAnalyzerPlugin()
      ].filter(Boolean) : [])
    ],
    
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true
            }
          }
        }),
        new CssMinimizerPlugin()
      ],
      
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          common: {
            minChunks: 2,
            chunks: 'all',
            enforce: true
          }
        }
      },
      
      runtimeChunk: 'single'
    },
    
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
    
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    }
  };
};
```

## Module Federation

Share code between applications at runtime:
```javascript
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js'
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true }
      }
    })
  ]
};
```

## Environment Variables

```javascript
// webpack.config.js
const webpack = require('webpack');
const dotenv = require('dotenv');

const env = dotenv.config().parsed;
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  plugins: [
    new webpack.DefinePlugin(envKeys)
  ]
};
```

## Code Splitting

### Dynamic Imports
```javascript
// Async loading
const AdminPanel = lazy(() => import('./AdminPanel'));

// Prefetching
const Component = lazy(() => import(
  /* webpackChunkName: "dashboard" */
  /* webpackPrefetch: true */
  './Dashboard'
));
```

### Magic Comments
```javascript
// Named chunk
import(/* webpackChunkName: "my-chunk" */ './module');

// Prefetch
import(/* webpackPrefetch: true */ './module');

// Preload
import(/* webpackPreload: true */ './module');

// Exclude from bundle
import(/* webpackIgnore: true */ './ignored-module');
```

## Performance Optimization

### Caching
```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js'
  },
  
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

### Tree Shaking
```javascript
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false
  }
};
```

## CLI Commands

```bash
# Development
webpack serve --config webpack.config.js --mode development

# Production build
webpack --config webpack.config.js --mode production

# Watch mode
webpack --watch

# Stats
webpack --json > stats.json
npx webpack-bundle-analyzer stats.json
```

## Popular Loaders

| Loader | Purpose |
|--------|---------|
| babel-loader | Transpile JavaScript |
| ts-loader | TypeScript support |
| css-loader | CSS modules |
| sass-loader | SCSS/Sass |
| less-loader | Less |
| postcss-loader | PostCSS |
| file-loader | File assets |
| url-loader | Inline small assets |
| html-loader | HTML imports |
| markdown-loader | Markdown |
| csv-loader | CSV files |
| xml-loader | XML files |

## Popular Plugins

| Plugin | Purpose |
|--------|---------|
| HtmlWebpackPlugin | Generate HTML |
| CleanWebpackPlugin | Clean output directory |
| MiniCssExtractPlugin | Extract CSS |
| CopyWebpackPlugin | Copy static files |
| DefinePlugin | Define global constants |
| ProvidePlugin | Auto-load modules |
| HotModuleReplacementPlugin | HMR |
| CompressionPlugin | Gzip/Brotli |
| BundleAnalyzerPlugin | Bundle visualization |
| WorkboxPlugin | PWA/service workers |
