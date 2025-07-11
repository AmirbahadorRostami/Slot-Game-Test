import { TestFramework, Assert } from '../TestFramework.js';
import { ReelManager } from '../../services/ReelManager.js';
import { TestData, setupTestEnvironment } from '../utils/TestMocks.js';

setupTestEnvironment();

const framework = new TestFramework();
const { describe, it, beforeEach } = framework;

describe('ReelManager', () => {
    let reelManager;
    let mockConfig;

    beforeEach(() => {
        mockConfig = TestData.getMockGameConfig();
        global.GameConfig = mockConfig;
        reelManager = new ReelManager();
    });

    describe('initialization', () => {
        it('should initialize with correct default values', () => {
            Assert.equal(reelManager.columns, 5, 'Should have 5 columns');
            Assert.equal(reelManager.rows, 3, 'Should have 3 rows');
            Assert.deepEqual(reelManager.getAllReelPositions(), [0, 0, 0, 0, 0], 'Should start with zero positions');
        });

        it('should load reel bands from config', () => {
            const bands = reelManager.getAllReelBands();
            Assert.equal(bands.length, 5, 'Should have 5 reel bands');
            Assert.equal(bands[0].length, 5, 'Each band should have correct length');
        });
    });

    describe('spin', () => {
        it('should generate new random positions', () => {
            const initialPositions = reelManager.getAllReelPositions();
            
            let positionsChanged = false;
            for (let i = 0; i < 10; i++) {
                reelManager.spin();
                const newPositions = reelManager.getAllReelPositions();
                
                if (JSON.stringify(initialPositions) !== JSON.stringify(newPositions)) {
                    positionsChanged = true;
                    break;
                }
            }
            
            Assert.true(positionsChanged, 'Positions should change after spinning');
        });

        it('should return valid positions within reel band bounds', () => {
            reelManager.spin();
            const positions = reelManager.getAllReelPositions();
            const bands = reelManager.getAllReelBands();
            
            for (let i = 0; i < positions.length; i++) {
                Assert.greaterThan(positions[i], -1, `Position ${i} should be >= 0`);
                Assert.lessThan(positions[i], bands[i].length, `Position ${i} should be < band length`);
            }
        });
    });

    describe('getVisibleSymbols', () => {
        it('should return correct symbol grid structure', () => {
            const symbols = reelManager.getVisibleSymbols();
            
            Assert.equal(symbols.length, 3, 'Should have 3 rows');
            Assert.equal(symbols[0].length, 5, 'Should have 5 columns');
            
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 5; col++) {
                    Assert.notNull(symbols[row][col], `Symbol at [${row}][${col}] should not be null`);
                }
            }
        });

        it('should return symbols from correct reel bands', () => {
            reelManager.reset();
            const symbols = reelManager.getVisibleSymbols();
            const bands = reelManager.getAllReelBands();
            
            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 3; row++) {
                    const expectedSymbol = bands[col][row];
                    Assert.equal(symbols[row][col], expectedSymbol, 
                        `Symbol at [${row}][${col}] should match band`);
                }
            }
        });
    });

    describe('getSymbolAt', () => {
        it('should return correct symbol for valid coordinates', () => {
            reelManager.reset();
            const symbol = reelManager.getSymbolAt(0, 0);
            const expectedSymbol = reelManager.getReelBand(0)[0];
            
            Assert.equal(symbol, expectedSymbol, 'Should return correct symbol');
        });

        it('should throw error for invalid column', () => {
            Assert.throws(() => {
                reelManager.getSymbolAt(-1, 0);
            }, Error, 'Should throw for negative column');

            Assert.throws(() => {
                reelManager.getSymbolAt(5, 0);
            }, Error, 'Should throw for column >= 5');
        });

        it('should throw error for invalid row', () => {
            Assert.throws(() => {
                reelManager.getSymbolAt(0, -1);
            }, Error, 'Should throw for negative row');

            Assert.throws(() => {
                reelManager.getSymbolAt(0, 3);
            }, Error, 'Should throw for row >= 3');
        });
    });

    describe('setReelPosition', () => {
        it('should set valid reel position', () => {
            reelManager.setReelPosition(0, 2);
            Assert.equal(reelManager.getReelPosition(0), 2, 'Should set position correctly');
        });

        it('should throw error for invalid column', () => {
            Assert.throws(() => {
                reelManager.setReelPosition(-1, 0);
            }, Error, 'Should throw for invalid column');
        });

        it('should throw error for invalid position', () => {
            Assert.throws(() => {
                reelManager.setReelPosition(0, -1);
            }, Error, 'Should throw for negative position');

            Assert.throws(() => {
                reelManager.setReelPosition(0, 10);
            }, Error, 'Should throw for position beyond band length');
        });
    });

    describe('reset', () => {
        it('should reset all positions to initial values', () => {
            reelManager.spin();
            reelManager.reset();
            
            const positions = reelManager.getAllReelPositions();
            Assert.deepEqual(positions, [0, 0, 0, 0, 0], 'Should reset to initial positions');
        });
    });

    describe('getReelBand', () => {
        it('should return copy of reel band', () => {
            const band = reelManager.getReelBand(0);
            const originalBand = reelManager.getAllReelBands()[0];
            
            Assert.deepEqual(band, originalBand, 'Should return same data');
            
            band[0] = 'modified';
            Assert.notEqual(originalBand[0], 'modified', 'Should return copy, not reference');
        });

        it('should throw error for invalid column', () => {
            Assert.throws(() => {
                reelManager.getReelBand(-1);
            }, Error, 'Should throw for invalid column');
        });
    });

    describe('getReelBandLength', () => {
        it('should return correct band length', () => {
            const length = reelManager.getReelBandLength(0);
            const expectedLength = reelManager.getReelBand(0).length;
            
            Assert.equal(length, expectedLength, 'Should return correct length');
        });
    });

    describe('validateReelState', () => {
        it('should validate correct reel state', () => {
            Assert.true(reelManager.validateReelState(), 'Valid state should pass validation');
        });

        it('should detect invalid positions', () => {
            reelManager.setReelPosition(0, 0);
            reelManager.reelPositions[0] = -1;
            
            Assert.throws(() => {
                reelManager.validateReelState();
            }, Error, 'Should throw for invalid position');
        });
    });
});

export { framework };