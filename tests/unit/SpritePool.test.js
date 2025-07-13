import { TestFramework, Assert } from '../TestFramework.js';
import { SpritePool } from '../../src/services/SpritePool.js';
import { setupTestEnvironment, MockPIXI } from '../utils/TestMocks.js';

setupTestEnvironment();

const framework = new TestFramework();
const { describe, it, beforeEach } = framework;

describe('SpritePool', () => {
    let spritePool;

    beforeEach(() => {
        spritePool = new SpritePool();
    });

    describe('createPool', () => {
        it('should create a new pool with initial sprites', () => {
            const createFunction = () => MockPIXI.createMockSprite();
            spritePool.createPool('test', createFunction, 5);

            const poolInfo = spritePool.getPoolInfo('test');
            Assert.equal(poolInfo.available, 5, 'Should have 5 available sprites');
            Assert.equal(poolInfo.active, 0, 'Should have 0 active sprites');
            Assert.equal(poolInfo.totalCreated, 5, 'Should have created 5 sprites');
        });

        it('should warn when pool already exists', () => {
            const createFunction = () => MockPIXI.createMockSprite();
            spritePool.createPool('test', createFunction, 3);
            
            let warningLogged = false;
            const originalWarn = console.warn;
            console.warn = () => { warningLogged = true; };
            
            spritePool.createPool('test', createFunction, 3);
            console.warn = originalWarn;
            
            Assert.true(warningLogged, 'Should warn about existing pool');
        });
    });

    describe('getSprite', () => {
        beforeEach(() => {
            const createFunction = () => MockPIXI.createMockSprite();
            spritePool.createPool('test', createFunction, 3);
        });

        it('should return a sprite from available pool', () => {
            const sprite = spritePool.getSprite('test');
            
            Assert.notNull(sprite, 'Should return a sprite');
            Assert.true(sprite.visible, 'Sprite should be visible');
            
            const poolInfo = spritePool.getPoolInfo('test');
            Assert.equal(poolInfo.available, 2, 'Should have 2 available sprites');
            Assert.equal(poolInfo.active, 1, 'Should have 1 active sprite');
        });

        it('should create new sprite when pool is empty', () => {
            for (let i = 0; i < 3; i++) {
                spritePool.getSprite('test');
            }
            
            const sprite = spritePool.getSprite('test');
            Assert.notNull(sprite, 'Should create new sprite when pool is empty');
            
            const poolInfo = spritePool.getPoolInfo('test');
            Assert.equal(poolInfo.totalCreated, 4, 'Should have created 4 sprites total');
        });

        it('should throw error for non-existent pool', () => {
            Assert.throws(() => {
                spritePool.getSprite('nonexistent');
            }, Error, 'Should throw error for non-existent pool');
        });

        it('should warn when reaching maximum pool size', () => {
            const createFunction = () => MockPIXI.createMockSprite();
            spritePool.createPool('limited', createFunction, 2);
            
            for (let i = 0; i < 4; i++) {
                spritePool.getSprite('limited');
            }
            
            let warningLogged = false;
            const originalWarn = console.warn;
            console.warn = () => { warningLogged = true; };
            
            spritePool.getSprite('limited');
            console.warn = originalWarn;
            
            Assert.true(warningLogged, 'Should warn when reaching max size');
        });
    });

    describe('returnSprite', () => {
        let sprite;

        beforeEach(() => {
            const createFunction = () => MockPIXI.createMockSprite();
            spritePool.createPool('test', createFunction, 3);
            sprite = spritePool.getSprite('test');
        });

        it('should return sprite to pool and reset properties', () => {
            sprite.x = 100;
            sprite.y = 200;
            sprite.rotation = 45;
            sprite.alpha = 0.5;
            
            spritePool.returnSprite('test', sprite);
            
            Assert.false(sprite.visible, 'Sprite should be invisible');
            Assert.equal(sprite.x, 0, 'X should be reset');
            Assert.equal(sprite.y, 0, 'Y should be reset');
            Assert.equal(sprite.rotation, 0, 'Rotation should be reset');
            Assert.equal(sprite.alpha, 1, 'Alpha should be reset');
            
            const poolInfo = spritePool.getPoolInfo('test');
            Assert.equal(poolInfo.available, 3, 'Should have 3 available sprites');
            Assert.equal(poolInfo.active, 0, 'Should have 0 active sprites');
        });

        it('should throw error for non-existent pool', () => {
            Assert.throws(() => {
                spritePool.returnSprite('nonexistent', sprite);
            }, Error, 'Should throw error for non-existent pool');
        });

        it('should warn for sprite not in active set', () => {
            const otherSprite = MockPIXI.createMockSprite();
            
            let warningLogged = false;
            const originalWarn = console.warn;
            console.warn = () => { warningLogged = true; };
            
            spritePool.returnSprite('test', otherSprite);
            console.warn = originalWarn;
            
            Assert.true(warningLogged, 'Should warn for sprite not in active set');
        });
    });

    describe('returnAllSprites', () => {
        beforeEach(() => {
            const createFunction = () => MockPIXI.createMockSprite();
            spritePool.createPool('test', createFunction, 5);
        });

        it('should return all active sprites to pool', () => {
            const sprites = [
                spritePool.getSprite('test'),
                spritePool.getSprite('test'),
                spritePool.getSprite('test')
            ];
            
            spritePool.returnAllSprites('test');
            
            const poolInfo = spritePool.getPoolInfo('test');
            Assert.equal(poolInfo.available, 5, 'Should have all sprites available');
            Assert.equal(poolInfo.active, 0, 'Should have no active sprites');
            
            sprites.forEach(sprite => {
                Assert.false(sprite.visible, 'All sprites should be invisible');
            });
        });
    });

    describe('getStats', () => {
        it('should return performance statistics', () => {
            const createFunction = () => MockPIXI.createMockSprite();
            spritePool.createPool('test', createFunction, 3);
            
            spritePool.getSprite('test');
            const sprite = spritePool.getSprite('test');
            spritePool.returnSprite('test', sprite);
            
            const stats = spritePool.getStats();
            
            Assert.equal(stats.created, 0, 'Should track created sprites');
            Assert.equal(stats.reused, 2, 'Should track reused sprites');
            Assert.equal(stats.returned, 1, 'Should track returned sprites');
            Assert.greaterThan(stats.efficiency, 0, 'Should calculate efficiency');
        });
    });

    describe('getAllPoolsInfo', () => {
        it('should return information for all pools', () => {
            const createFunction = () => MockPIXI.createMockSprite();
            spritePool.createPool('pool1', createFunction, 3);
            spritePool.createPool('pool2', createFunction, 5);
            
            const allInfo = spritePool.getAllPoolsInfo();
            
            Assert.equal(allInfo.length, 2, 'Should return info for 2 pools');
            Assert.true(allInfo.some(info => info.name === 'pool1'), 'Should include pool1');
            Assert.true(allInfo.some(info => info.name === 'pool2'), 'Should include pool2');
        });
    });

    describe('clearPool', () => {
        it('should clear and destroy all sprites in pool', () => {
            const createFunction = () => MockPIXI.createMockSprite();
            spritePool.createPool('test', createFunction, 3);
            
            const sprite = spritePool.getSprite('test');
            spritePool.clearPool('test');
            
            Assert.throws(() => {
                spritePool.getPoolInfo('test');
            }, Error, 'Pool should no longer exist');
        });
    });

    describe('optimizePool', () => {
        it('should optimize pool size based on usage', () => {
            const createFunction = () => MockPIXI.createMockSprite();
            spritePool.createPool('test', createFunction, 10);
            
            spritePool.getSprite('test');
            spritePool.optimizePool('test');
            
            const poolInfo = spritePool.getPoolInfo('test');
            Assert.lessThan(poolInfo.available, 10, 'Should reduce available sprites');
        });
    });
});

export { framework };