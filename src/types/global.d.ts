// Global type definitions for the Slot Machine Game

declare global {
  // Vite environment variables
  const __DEV__: boolean;
  const __PROD__: boolean;
  const __TEST__: boolean;
  const __VERSION__: string;
  const __BUILD_TIME__: string;

  // PIXI.js global (loaded via CDN)
  const PIXI: any;

  // Window extensions for debugging
  interface Window {
    game?: any;
    getPerformanceStats?: () => any;
    logPerformanceStats?: () => void;
    exportPerformanceMetrics?: () => void;
    testRunner?: any;
    runAllTests?: () => Promise<any>;
    runSpecificSuite?: (suiteName: string) => Promise<any>;
    listTestSuites?: () => void;
    exportTestReport?: () => void;
  }

  // Performance API extensions
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

// Module type definitions
export interface GameConfig {
  DISPLAY: {
    BACKGROUND_COLOR: number;
    GAME_WIDTH: number;
    GAME_HEIGHT: number;
    SCALE_FACTOR: number;
  };
  REELS: {
    COLUMNS: number;
    ROWS: number;
    BANDS: string[][];
    INITIAL_POSITIONS: number[];
  };
  SYMBOLS: {
    SIZE: number;
    SPACING: number;
    TYPES: string[];
  };
  ASSETS: {
    SYMBOL_PATHS: string[];
  };
  PAY_TABLE: Record<string, Record<number, number>>;
  PAY_LINES: number[][][];
  UI: {
    SPIN_BUTTON: {
      WIDTH: number;
      HEIGHT: number;
      X: number;
      Y: number;
    };
    WIN_TEXT: {
      FONT_FAMILY: string;
      FONT_SIZE: number;
      FILL: number;
      ALIGN: string;
      X: number;
      Y: number;
      MAX_FONT_SIZE: number;
    };
    LOADING_TEXT: {
      FONT_FAMILY: string;
      FONT_SIZE: number;
      FILL: number;
      ALIGN: string;
    };
  };
  GAME_RULES: {
    MIN_MATCH_COUNT: number;
    MAX_MATCH_COUNT: number;
    WIN_DIRECTION: string;
  };
}

export interface WinDetail {
  payLine: number;
  symbol: string;
  count: number;
  payout: number;
}

export interface WinResult {
  totalWins: number;
  winDetails: WinDetail[];
}

export interface PerformanceMetrics {
  frameRate: {
    current: number;
    average: number;
    min: number;
    max: number;
    samples: number[];
  };
  memory: {
    used: number;
    total: number;
    peak: number;
  };
  rendering: {
    drawCalls: number;
    textureSwaps: number;
    verticesDrawn: number;
    batchesDrawn: number;
  };
  gameSpecific: {
    spinsPerformed: number;
    symbolsUpdated: number;
    winsCalculated: number;
  };
}

export interface SpritePoolStats {
  created: number;
  reused: number;
  returned: number;
  efficiency: number;
}

export interface PoolInfo {
  name: string;
  available: number;
  active: number;
  totalCreated: number;
  maxSize: number;
}

export interface TestResult {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
}

export interface TestFrameworkOptions {
  timeout?: number;
  skip?: boolean;
  only?: boolean;
}

// Asset types
export type TextureDict = Record<string, any>;
export type SymbolGrid = string[][];

// Vite specific
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAME_DEBUG: string;
  readonly VITE_PERFORMANCE_MONITORING: string;
  readonly VITE_TEST_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};