# Slot Machine Game

A modern 5x3 slot machine game built with PIXI.js, Vite, and comprehensive performance optimizations.

## 🎰 Features

- **Modern Architecture**: Service layer pattern with modular design
- **Performance Optimized**: Object pooling, render optimization, and performance monitoring
- **Comprehensive Testing**: Unit tests, integration tests, and custom test framework
- **Development Tools**: Vite build system, TypeScript support, ESLint, and Prettier
- **Professional Workflow**: npm scripts, environment management, and build optimization

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd slot-machine-game

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Commands

```bash
# Development
npm run dev              # Start development server with HMR
npm run build:dev        # Build for development
npm run preview          # Preview production build locally

# Production
npm run build            # Build for production
npm run build:prod       # Build for production (explicit)
npm run serve            # Build and serve production version

# Testing
npm run test             # Run all tests
npm run test:browser     # Run tests in browser
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking

# Utilities
npm run clean            # Clean build directory
npm run analyze          # Analyze bundle size
```

## 🏗️ Project Structure

```
slot-machine-game/
├── src/                      # Source code
│   ├── main.js              # Application entry point
│   ├── config/              # Game configuration
│   │   └── GameConfig.js    # Game settings and constants
│   ├── services/            # Service layer
│   │   ├── AssetLoader.js   # Asset loading service
│   │   ├── WinningLogic.js  # Win calculation service
│   │   ├── ReelManager.js   # Reel state management
│   │   ├── SpritePool.js    # Object pooling service
│   │   ├── RenderOptimizer.js # Rendering optimization
│   │   └── PerformanceMonitor.js # Performance tracking
│   └── types/               # TypeScript definitions
│       └── global.d.ts      # Global type definitions
├── tests/                   # Test suites
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── utils/              # Test utilities and mocks
│   ├── TestFramework.js    # Custom test framework
│   └── TestRunner.js       # Test runner
├── assets/                 # Game assets (images, sounds)
├── dist/                   # Build output (generated)
├── index.html             # Main game page
├── test.html             # Test runner page
├── vite.config.js        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.json        # ESLint configuration
├── .prettierrc.json      # Prettier configuration
└── package.json          # Project configuration
```

## 🎮 Game Features

### Core Gameplay
- 5 columns × 3 rows slot machine
- 8 different symbols (hv1-hv4, lv1-lv4)
- 7 pay lines with various patterns
- Real-time win calculation and display
- Responsive design that scales with window size

### Technical Features
- **Service Layer Architecture**: Modular, testable code organization
- **Object Pooling**: Efficient sprite reuse for performance
- **Render Optimization**: Culling, batching, and smart updates
- **Performance Monitoring**: Real-time FPS, memory, and game metrics
- **Comprehensive Testing**: 70+ test cases covering all systems

## 🔧 Development

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Available environment variables:
- `VITE_GAME_DEBUG`: Enable debug mode
- `VITE_PERFORMANCE_MONITORING`: Enable performance tracking
- `VITE_TEST_MODE`: Enable test mode features

### Debug Mode

Add `?debug` to the URL or set `VITE_GAME_DEBUG=true` to enable:
- Performance monitoring panel
- Console debug commands
- Extended logging

Debug commands:
```javascript
window.getPerformanceStats()     // Get current performance metrics
window.logPerformanceStats()     // Log detailed performance data
window.exportPerformanceMetrics() // Export metrics as JSON
```

## 📄 License

MIT License - see LICENSE file for details.