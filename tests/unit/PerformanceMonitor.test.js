import { TestFramework, Assert } from '../TestFramework.js';
import { PerformanceMonitor } from '../../src/services/PerformanceMonitor.js';
import { setupTestEnvironment } from '../utils/TestMocks.js';

setupTestEnvironment();

const framework = new TestFramework();
const { describe, it, beforeEach, afterEach } = framework;

describe('PerformanceMonitor', () => {
    let performanceMonitor;
    let originalConsoleLog;

    beforeEach(() => {
        performanceMonitor = new PerformanceMonitor();
        originalConsoleLog = console.log;
    });

    afterEach(() => {
        performanceMonitor.stopMonitoring();
        console.log = originalConsoleLog;
    });

    describe('initialization', () => {
        it('should initialize with default values', () => {
            Assert.equal(performanceMonitor.isMonitoring, false, 'Should not be monitoring initially');
            Assert.equal(performanceMonitor.frameCount, 0, 'Should start with 0 frames');
            
            const metrics = performanceMonitor.getMetrics();
            Assert.equal(metrics.frameRate.current, 0, 'Should start with 0 FPS');
            Assert.equal(metrics.gameSpecific.spinsPerformed, 0, 'Should start with 0 spins');
        });
    });

    describe('startMonitoring', () => {
        it('should start monitoring and set flag', () => {
            performanceMonitor.startMonitoring();
            Assert.true(performanceMonitor.isMonitoring, 'Should be monitoring after start');
        });

        it('should warn if already monitoring', () => {
            let warningLogged = false;
            console.warn = () => { warningLogged = true; };
            
            performanceMonitor.startMonitoring();
            performanceMonitor.startMonitoring();
            
            Assert.true(warningLogged, 'Should warn if already monitoring');
        });
    });

    describe('stopMonitoring', () => {
        it('should stop monitoring and clear interval', () => {
            performanceMonitor.startMonitoring();
            performanceMonitor.stopMonitoring();
            
            Assert.false(performanceMonitor.isMonitoring, 'Should not be monitoring after stop');
        });

        it('should warn if not currently monitoring', () => {
            let warningLogged = false;
            console.warn = () => { warningLogged = true; };
            
            performanceMonitor.stopMonitoring();
            
            Assert.true(warningLogged, 'Should warn if not monitoring');
        });
    });

    describe('updateFrameRate', () => {
        it('should update frame rate metrics', () => {
            performanceMonitor.updateFrameRate();
            
            const metrics = performanceMonitor.getMetrics();
            Assert.greaterThan(metrics.frameRate.current, 0, 'Should have positive FPS');
            Assert.equal(metrics.totalFrames, 1, 'Should increment frame count');
        });

        it('should track min and max FPS', () => {
            for (let i = 0; i < 5; i++) {
                performanceMonitor.updateFrameRate();
            }
            
            const metrics = performanceMonitor.getMetrics();
            Assert.greaterThan(metrics.frameRate.max, 0, 'Should track max FPS');
            Assert.lessThan(metrics.frameRate.min, 1000, 'Should track min FPS');
        });

        it('should calculate average FPS', () => {
            for (let i = 0; i < 10; i++) {
                performanceMonitor.updateFrameRate();
            }
            
            const metrics = performanceMonitor.getMetrics();
            Assert.greaterThan(metrics.frameRate.average, 0, 'Should calculate average FPS');
        });
    });

    describe('recordGameEvent', () => {
        it('should record spin events', () => {
            performanceMonitor.recordGameEvent('spin');
            performanceMonitor.recordGameEvent('spin');
            
            const metrics = performanceMonitor.getMetrics();
            Assert.equal(metrics.gameSpecific.spinsPerformed, 2, 'Should count spins');
        });

        it('should record symbol update events', () => {
            performanceMonitor.recordGameEvent('symbolUpdate', { count: 15 });
            
            const metrics = performanceMonitor.getMetrics();
            Assert.equal(metrics.gameSpecific.symbolsUpdated, 15, 'Should count symbol updates');
        });

        it('should record win calculation events', () => {
            performanceMonitor.recordGameEvent('winCalculation');
            performanceMonitor.recordGameEvent('winCalculation');
            
            const metrics = performanceMonitor.getMetrics();
            Assert.equal(metrics.gameSpecific.winsCalculated, 2, 'Should count win calculations');
        });
    });

    describe('getMetrics', () => {
        it('should return comprehensive metrics', () => {
            const metrics = performanceMonitor.getMetrics();
            
            Assert.notNull(metrics.frameRate, 'Should have frameRate metrics');
            Assert.notNull(metrics.memory, 'Should have memory metrics');
            Assert.notNull(metrics.rendering, 'Should have rendering metrics');
            Assert.notNull(metrics.gameSpecific, 'Should have game-specific metrics');
            Assert.notNull(metrics.uptime, 'Should include uptime');
            Assert.equal(metrics.isMonitoring, false, 'Should include monitoring status');
        });
    });

    describe('getFormattedMetrics', () => {
        it('should return formatted metrics structure', () => {
            const formatted = performanceMonitor.getFormattedMetrics();
            
            Assert.notNull(formatted['Frame Rate'], 'Should have Frame Rate section');
            Assert.notNull(formatted['Memory Usage'], 'Should have Memory Usage section');
            Assert.notNull(formatted['Rendering'], 'Should have Rendering section');
            Assert.notNull(formatted['Game Stats'], 'Should have Game Stats section');
            Assert.notNull(formatted['System'], 'Should have System section');
        });

        it('should format numbers correctly', () => {
            performanceMonitor.updateFrameRate();
            const formatted = performanceMonitor.getFormattedMetrics();
            
            Assert.equal(typeof formatted['Frame Rate']['Current FPS'], 'number', 'FPS should be number');
            Assert.equal(typeof formatted['Memory Usage']['Used (MB)'], 'number', 'Memory should be number');
        });
    });

    describe('getPerformanceWarnings', () => {
        it('should detect low frame rate warnings', () => {
            performanceMonitor.metrics.frameRate.average = 25;
            const warnings = performanceMonitor.getPerformanceWarnings();
            
            Assert.contains(warnings, 'Low average frame rate detected', 'Should warn about low FPS');
        });

        it('should detect high memory usage warnings', () => {
            performanceMonitor.metrics.memory.used = 150;
            const warnings = performanceMonitor.getPerformanceWarnings();
            
            Assert.contains(warnings, 'High memory usage detected', 'Should warn about high memory');
        });

        it('should return empty array for good performance', () => {
            performanceMonitor.metrics.frameRate.average = 60;
            performanceMonitor.metrics.memory.used = 50;
            performanceMonitor.metrics.rendering.drawCalls = 100;
            performanceMonitor.metrics.rendering.textureSwaps = 50;
            
            const warnings = performanceMonitor.getPerformanceWarnings();
            Assert.equal(warnings.length, 0, 'Should have no warnings for good performance');
        });
    });

    describe('reset', () => {
        it('should reset all metrics to initial values', () => {
            performanceMonitor.recordGameEvent('spin');
            performanceMonitor.updateFrameRate();
            
            performanceMonitor.reset();
            
            const metrics = performanceMonitor.getMetrics();
            Assert.equal(metrics.gameSpecific.spinsPerformed, 0, 'Should reset spins');
            Assert.equal(metrics.totalFrames, 0, 'Should reset frame count');
            Assert.equal(metrics.frameRate.current, 0, 'Should reset current FPS');
        });
    });

    describe('logMetrics', () => {
        it('should log formatted metrics to console', () => {
            const loggedData = [];
            console.log = (data) => { loggedData.push(data); };
            console.group = () => {};
            console.groupEnd = () => {};
            
            performanceMonitor.logMetrics();
            
            Assert.greaterThan(loggedData.length, 0, 'Should log metrics data');
        });
    });

    describe('createDebugPanel', () => {
        it('should create debug panel element', () => {
            const panel = performanceMonitor.createDebugPanel();
            
            Assert.notNull(panel, 'Should create panel element');
            Assert.equal(panel.id, 'performance-panel', 'Should have correct ID');
        });
    });
});

export { framework };