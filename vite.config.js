import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  const isProd = mode === 'production';
  const isTest = mode === 'test';

  return {
    root: '.',
    base: './',
    
    // Entry points
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDev || isTest,
      minify: isProd ? 'terser' : false,
      
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          test: resolve(__dirname, 'test.html')
        },
        
        output: {
          chunkFileNames: isProd ? 'js/[name]-[hash].js' : 'js/[name].js',
          entryFileNames: isProd ? 'js/[name]-[hash].js' : 'js/[name].js',
          assetFileNames: isProd ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
          
          manualChunks: {
            'pixi': ['pixi.js'],
            'game-core': [
              './src/services/AssetLoader.js',
              './src/services/WinningLogic.js',
              './src/services/ReelManager.js'
            ],
            'game-optimization': [
              './src/services/SpritePool.js',
              './src/services/RenderOptimizer.js',
              './src/services/PerformanceMonitor.js'
            ],
            'tests': [
              './tests/TestFramework.js',
              './tests/TestRunner.js'
            ]
          }
        }
      },
      
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } : {},
      
      // Bundle analysis
      reportCompressedSize: isProd,
      chunkSizeWarningLimit: 1000
    },
    
    // Development server
    server: {
      host: true,
      port: 3000,
      open: true,
      cors: true,
      
      hmr: {
        overlay: true
      },
      
      // Proxy for API calls if needed
      proxy: {}
    },
    
    // Preview server (for production builds)
    preview: {
      host: true,
      port: 4173,
      open: true
    },
    
    // Plugin configuration
    plugins: [
      eslint({
        cache: false,
        include: ['src/**/*.js', 'tests/**/*.js'],
        exclude: ['node_modules/**', 'dist/**']
      })
    ],
    
    // CSS processing
    css: {
      devSourcemap: isDev,
      
      preprocessorOptions: {
        scss: {
          additionalData: ''
        }
      }
    },
    
    // Asset handling
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
    
    // Dependency optimization
    optimizeDeps: {
      include: ['pixi.js'],
      exclude: []
    },
    
    // Define global constants
    define: {
      __DEV__: isDev,
      __PROD__: isProd,
      __TEST__: isTest,
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    
    // Environment variables
    envPrefix: 'VITE_',
    
    // Module resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@config': resolve(__dirname, 'config'),
        '@services': resolve(__dirname, 'src/services'),
        '@tests': resolve(__dirname, 'tests'),
        '@assets': resolve(__dirname, 'assets')
      },
      
      extensions: ['.js', '.ts', '.json']
    },
    
    // Experimental features
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: `/${filename}` };
        } else {
          return { relative: true };
        }
      }
    },
    
    // Worker configuration
    worker: {
      format: 'es',
      plugins: () => []
    },
    
    // Log level
    logLevel: isDev ? 'info' : 'warn',
    
    // Clear screen
    clearScreen: true
  };
});