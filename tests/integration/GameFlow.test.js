import { TestFramework, Assert } from '../TestFramework.js';
import { AssetLoader } from '../../services/AssetLoader.js';
import { WinningLogic } from '../../services/WinningLogic.js';
import { ReelManager } from '../../services/ReelManager.js';
import { SpritePool } from '../../services/SpritePool.js';
import { RenderOptimizer } from '../../services/RenderOptimizer.js';
import { PerformanceMonitor } from '../../services/PerformanceMonitor.js';
import { TestData, setupTestEnvironment, MockPIXI } from '../utils/TestMocks.js';

setupTestEnvironment();

const framework = new TestFramework();
const { describe, it, beforeEach, afterEach } = framework;

describe('Game Flow Integration Tests', () => {
    let assetLoader;
    let winningLogic;
    let reelManager;
    let spritePool;
    let renderOptimizer;
    let performanceMonitor;
    let mockApp;

    beforeEach(() => {
        global.GameConfig = TestData.getMockGameConfig();
        
        assetLoader = new AssetLoader();
        winningLogic = new WinningLogic();
        reelManager = new ReelManager();
        spritePool = new SpritePool();
        mockApp = MockPIXI.createMockApp();
        renderOptimizer = new RenderOptimizer(mockApp);
        performanceMonitor = new PerformanceMonitor();
    });

    afterEach(() => {
        performanceMonitor.stopMonitoring();
        spritePool.clearAllPools();
    });

    describe('Complete Game Initialization', () => {
        it('should initialize all services successfully', async () => {
            await assetLoader.loadAssets();
            
            Assert.true(assetLoader.isLoaded(), 'AssetLoader should be loaded');
            Assert.notNull(winningLogic.getPayTable(), 'WinningLogic should have pay table');
            Assert.equal(reelManager.columns, 5, 'ReelManager should have 5 columns');
            
            spritePool.createPool('symbols', () => MockPIXI.createMockSprite(), 15);
            const poolInfo = spritePool.getPoolInfo('symbols');
            Assert.equal(poolInfo.available, 15, 'SpritePool should have sprites');
            
            performanceMonitor.startMonitoring();
            Assert.true(performanceMonitor.isMonitoring, 'PerformanceMonitor should be active');
        });

        it('should handle asset loading failures gracefully', async () => {
            global.PIXI.Texture.from = async () => {
                throw new Error('Network error');
            };

            try {
                await assetLoader.loadAssets();
                Assert.true(false, 'Should have thrown an error');
            } catch (error) {
                Assert.contains(error.message, 'Asset loading failed', 'Should handle error gracefully');
            }
        });
    });

    describe('Spin Cycle Integration', () => {
        beforeEach(async () => {
            await assetLoader.loadAssets();
            spritePool.createPool('symbols', () => MockPIXI.createMockSprite(), 15);
            performanceMonitor.startMonitoring();
        });

        it('should execute complete spin cycle', () => {
            const initialPositions = reelManager.getAllReelPositions();
            
            performanceMonitor.recordGameEvent('spin');
            reelManager.spin();
            const newPositions = reelManager.getAllReelPositions();
            
            Assert.notEqual(JSON.stringify(initialPositions), JSON.stringify(newPositions), 
                'Positions should change after spin');
            
            const symbols = reelManager.getVisibleSymbols();
            Assert.equal(symbols.length, 3, 'Should have 3 rows of symbols');
            Assert.equal(symbols[0].length, 5, 'Should have 5 columns of symbols');
            
            const winResult = winningLogic.calculateWins(symbols);
            Assert.notNull(winResult.totalWins, 'Should calculate wins');
            Assert.true(Array.isArray(winResult.winDetails), 'Should have win details');
            
            performanceMonitor.recordGameEvent('symbolUpdate', { count: 15 });
            performanceMonitor.recordGameEvent('winCalculation');
            
            const metrics = performanceMonitor.getMetrics();
            Assert.equal(metrics.gameSpecific.spinsPerformed, 1, 'Should track spin events');
            Assert.equal(metrics.gameSpecific.symbolsUpdated, 15, 'Should track symbol updates');
            Assert.equal(metrics.gameSpecific.winsCalculated, 1, 'Should track win calculations');
        });

        it('should handle multiple consecutive spins', () => {
            const spinResults = [];
            
            for (let i = 0; i < 5; i++) {
                performanceMonitor.recordGameEvent('spin');
                reelManager.spin();
                const symbols = reelManager.getVisibleSymbols();
                const winResult = winningLogic.calculateWins(symbols);
                
                spinResults.push({
                    positions: reelManager.getAllReelPositions(),
                    symbols: symbols,
                    wins: winResult.totalWins
                });
                
                performanceMonitor.recordGameEvent('symbolUpdate', { count: 15 });
                performanceMonitor.recordGameEvent('winCalculation');
            }
            
            Assert.equal(spinResults.length, 5, 'Should complete all spins');
            
            const metrics = performanceMonitor.getMetrics();
            Assert.equal(metrics.gameSpecific.spinsPerformed, 5, 'Should track all spins');
            Assert.equal(metrics.gameSpecific.symbolsUpdated, 75, 'Should track all symbol updates');
            Assert.equal(metrics.gameSpecific.winsCalculated, 5, 'Should track all win calculations');
            
            const uniqueResults = new Set(spinResults.map(r => JSON.stringify(r.positions)));
            Assert.greaterThan(uniqueResults.size, 1, 'Should have different results across spins');
        });
    });

    describe('Performance Optimization Integration', () => {
        beforeEach(async () => {
            await assetLoader.loadAssets();
            spritePool.createPool('symbols', () => MockPIXI.createMockSprite(), 15);
        });

        it('should integrate sprite pooling with rendering', () => {
            const container = MockPIXI.createMockContainer();
            renderOptimizer.createRenderGroup('reels', container, {
                enableCulling: true,
                enableBatching: true
            });
            
            const sprites = [];
            for (let i = 0; i < 5; i++) {
                const sprite = spritePool.getSprite('symbols');
                container.addChild(sprite);
                renderOptimizer.addSpriteToGroup('reels', sprite);
                sprites.push(sprite);
            }
            
            const poolInfo = spritePool.getPoolInfo('symbols');
            Assert.equal(poolInfo.active, 5, 'Should have 5 active sprites');
            Assert.equal(container.children.length, 5, 'Container should have 5 children');
            
            renderOptimizer.optimizeRenderGroup('reels');
            
            sprites.forEach(sprite => {
                spritePool.returnSprite('symbols', sprite);
                container.removeChild(sprite);
                renderOptimizer.removeSpriteFromGroup('reels', sprite);
            });
            
            const finalPoolInfo = spritePool.getPoolInfo('symbols');
            Assert.equal(finalPoolInfo.active, 0, 'Should have no active sprites');
            Assert.equal(container.children.length, 0, 'Container should be empty');
        });

        it('should track performance across operations', () => {
            performanceMonitor.startMonitoring();
            
            for (let i = 0; i < 10; i++) {
                const sprite = spritePool.getSprite('symbols');
                sprite.x = Math.random() * 100;
                sprite.y = Math.random() * 100;
                spritePool.returnSprite('symbols', sprite);
            }
            
            performanceMonitor.updateFrameRate();
            
            const stats = spritePool.getStats();
            Assert.greaterThan(stats.reused, 0, 'Should reuse sprites');
            Assert.greaterThan(stats.efficiency, 50, 'Should have good efficiency');
            
            const metrics = performanceMonitor.getMetrics();
            Assert.greaterThan(metrics.totalFrames, 0, 'Should track frames');
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle reel manager errors gracefully', () => {
            Assert.throws(() => {
                reelManager.getSymbolAt(-1, 0);
            }, Error, 'Should throw for invalid coordinates');
            
            Assert.throws(() => {
                reelManager.setReelPosition(0, -1);
            }, Error, 'Should throw for invalid position');
            
            reelManager.reelPositions[0] = 999;
            Assert.throws(() => {
                reelManager.validateReelState();
            }, Error, 'Should detect invalid state');
        });

        it('should handle winning logic errors gracefully', () => {
            Assert.throws(() => {
                winningLogic.validateSymbols(null);
            }, Error, 'Should throw for null symbols');
            
            Assert.throws(() => {
                winningLogic.validateSymbols([['too', 'short']]);
            }, Error, 'Should throw for incorrect dimensions');
        });

        it('should handle sprite pool errors gracefully', () => {
            Assert.throws(() => {
                spritePool.getSprite('nonexistent');
            }, Error, 'Should throw for non-existent pool');
            
            Assert.throws(() => {
                spritePool.returnSprite('nonexistent', MockPIXI.createMockSprite());
            }, Error, 'Should throw for invalid pool');
        });
    });

    describe('Data Consistency Integration', () => {
        it('should maintain data consistency across services', async () => {
            await assetLoader.loadAssets();
            
            reelManager.reset();
            const symbols = reelManager.getVisibleSymbols();
            
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 5; col++) {
                    const symbolFromGrid = symbols[row][col];
                    const symbolFromGetter = reelManager.getSymbolAt(col, row);
                    Assert.equal(symbolFromGrid, symbolFromGetter, 
                        `Symbol at [${row}][${col}] should be consistent`);
                }
            }
            
            const winResult = winningLogic.calculateWins(symbols);
            const formattedDisplay = winningLogic.formatWinDisplay(winResult.totalWins, winResult.winDetails);
            
            Assert.contains(formattedDisplay, `Total wins: ${winResult.totalWins}`, 
                'Formatted display should match calculated wins');
            
            if (winResult.winDetails.length > 0) {
                winResult.winDetails.forEach(detail => {
                    Assert.contains(formattedDisplay, `payline ${detail.payLine}`, 
                        'Should include payline information');
                    Assert.contains(formattedDisplay, `${detail.symbol} x${detail.count}`, 
                        'Should include symbol and count');
                    Assert.contains(formattedDisplay, `${detail.payout}`, 
                        'Should include payout amount');
                });
            }
        });
    });
});

export { framework };