import { GameConfig } from '../config/GameConfig.js';

export class AssetLoader {
    constructor() {
        this.textures = {};
        this.loadingProgress = 0;
        this.onProgressUpdate = null;
    }

    setProgressCallback(callback) {
        this.onProgressUpdate = callback;
    }

    updateProgress(loadedCount, totalAssets) {
        this.loadingProgress = Math.round((loadedCount / totalAssets) * 100);
        if (this.onProgressUpdate) {
            this.onProgressUpdate(this.loadingProgress);
        }
    }

    async loadAssets() {
        const assets = GameConfig.ASSETS.SYMBOL_PATHS;
        let loadedCount = 0;
        const totalAssets = assets.length;

        for (const asset of assets) {
            try {
                const texture = await PIXI.Texture.from(asset);
                const key = asset.split('/').pop().replace('.png', '');
                this.textures[key] = texture;
                loadedCount++;
                this.updateProgress(loadedCount, totalAssets);
            } catch (error) {
                console.error(`Failed to load ${asset}:`, error);
                throw new Error(`Asset loading failed: ${asset}`);
            }
        }

        return this.textures;
    }

    getTexture(key) {
        return this.textures[key];
    }

    getAllTextures() {
        return this.textures;
    }

    isLoaded() {
        return this.loadingProgress === 100;
    }
}