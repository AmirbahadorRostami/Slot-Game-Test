import { TestFramework, Assert } from '../TestFramework.js';
import { AssetLoader } from '../../src/services/AssetLoader.js';
import { TestData, setupTestEnvironment, MockPIXI } from '../utils/TestMocks.js';

setupTestEnvironment();

const framework = new TestFramework();
const { describe, it, beforeEach, afterEach } = framework;

describe('AssetLoader', () => {
    let assetLoader;
    let mockConfig;

    beforeEach(() => {
        mockConfig = TestData.getMockGameConfig();
        global.GameConfig = mockConfig;
        assetLoader = new AssetLoader();
    });

    afterEach(() => {
        // Reset PIXI mock to default behavior
        global.PIXI.Texture.from = async (url) => MockPIXI.createMockTexture(url);
    });

    describe('initialization', () => {
        it('should initialize with empty textures and zero progress', () => {
            Assert.equal(assetLoader.loadingProgress, 0, 'Should start with 0% progress');
            Assert.deepEqual(assetLoader.getAllTextures(), {}, 'Should start with empty textures');
            Assert.false(assetLoader.isLoaded(), 'Should not be loaded initially');
        });
    });

    describe('setProgressCallback', () => {
        it('should set progress callback function', () => {
            let callbackCalled = false;
            const callback = () => { callbackCalled = true; };
            
            assetLoader.setProgressCallback(callback);
            assetLoader.updateProgress(1, 2);
            
            Assert.true(callbackCalled, 'Callback should be called');
        });
    });

    describe('updateProgress', () => {
        it('should calculate progress percentage correctly', () => {
            assetLoader.updateProgress(2, 4);
            Assert.equal(assetLoader.loadingProgress, 50, 'Should calculate 50% progress');
            
            assetLoader.updateProgress(4, 4);
            Assert.equal(assetLoader.loadingProgress, 100, 'Should calculate 100% progress');
        });

        it('should call progress callback with correct value', () => {
            let receivedProgress = 0;
            assetLoader.setProgressCallback((progress) => {
                receivedProgress = progress;
            });
            
            assetLoader.updateProgress(3, 4);
            Assert.equal(receivedProgress, 75, 'Callback should receive correct progress');
        });
    });

    describe('loadAssets', () => {
        it('should load all assets successfully', async () => {
            const textures = await assetLoader.loadAssets();
            
            Assert.notNull(textures, 'Should return textures object');
            Assert.equal(assetLoader.loadingProgress, 100, 'Should reach 100% progress');
            Assert.true(assetLoader.isLoaded(), 'Should be marked as loaded');
        });

        it('should store textures with correct keys', async () => {
            await assetLoader.loadAssets();
            
            const texture = assetLoader.getTexture('hv1_symbol');
            Assert.notNull(texture, 'Should store hv1_symbol texture');
            
            const spinButton = assetLoader.getTexture('spin_button');
            Assert.notNull(spinButton, 'Should store spin_button texture');
        });

        it('should update progress during loading', async () => {
            const progressUpdates = [];
            assetLoader.setProgressCallback((progress) => {
                progressUpdates.push(progress);
            });
            
            await assetLoader.loadAssets();
            
            Assert.greaterThan(progressUpdates.length, 0, 'Should have progress updates');
            Assert.equal(progressUpdates[progressUpdates.length - 1], 100, 'Final progress should be 100%');
        });

        it('should handle loading errors gracefully', async () => {
            global.PIXI.Texture.from = async () => {
                throw new Error('Loading failed');
            };
            
            try {
                await assetLoader.loadAssets();
                Assert.true(false, 'Should have thrown an error');
            } catch (error) {
                Assert.contains(error.message, 'Asset loading failed', 'Should throw meaningful error');
            }
        });
    });

    describe('getTexture', () => {
        it('should return loaded texture', async () => {
            await assetLoader.loadAssets();
            const texture = assetLoader.getTexture('hv1_symbol');
            
            Assert.notNull(texture, 'Should return texture');
        });

        it('should return undefined for non-existent texture', () => {
            const texture = assetLoader.getTexture('non_existent');
            Assert.equal(texture, undefined, 'Should return undefined');
        });
    });

    describe('getAllTextures', () => {
        it('should return all loaded textures', async () => {
            await assetLoader.loadAssets();
            const allTextures = assetLoader.getAllTextures();
            
            Assert.notNull(allTextures, 'Should return textures object');
            Assert.greaterThan(Object.keys(allTextures).length, 0, 'Should have loaded textures');
        });

        it('should return empty object before loading', () => {
            const textures = assetLoader.getAllTextures();
            Assert.deepEqual(textures, {}, 'Should return empty object');
        });
    });

    describe('isLoaded', () => {
        it('should return false before loading', () => {
            Assert.false(assetLoader.isLoaded(), 'Should not be loaded initially');
        });

        it('should return true after successful loading', async () => {
            await assetLoader.loadAssets();
            Assert.true(assetLoader.isLoaded(), 'Should be loaded after successful load');
        });

        it('should return false if loading is partial', () => {
            assetLoader.loadingProgress = 50;
            Assert.false(assetLoader.isLoaded(), 'Should not be loaded at 50%');
        });
    });
});

export { framework };