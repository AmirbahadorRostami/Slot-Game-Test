export class SpritePool {
    constructor() {
        this.pools = new Map();
        this.activeSprites = new Map();
        this.poolStats = {
            created: 0,
            reused: 0,
            returned: 0
        };
    }

    createPool(poolName, createFunction, initialSize = 10) {
        if (this.pools.has(poolName)) {
            console.warn(`Pool '${poolName}' already exists`);
            return;
        }

        const pool = {
            available: [],
            createFunction,
            totalCreated: 0,
            maxSize: initialSize * 2
        };

        for (let i = 0; i < initialSize; i++) {
            const sprite = createFunction();
            sprite.visible = false;
            pool.available.push(sprite);
            pool.totalCreated++;
        }

        this.pools.set(poolName, pool);
        this.activeSprites.set(poolName, new Set());
        
        console.log(`Created sprite pool '${poolName}' with ${initialSize} sprites`);
    }

    getSprite(poolName) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            throw new Error(`Pool '${poolName}' does not exist`);
        }

        let sprite;
        if (pool.available.length > 0) {
            sprite = pool.available.pop();
            this.poolStats.reused++;
        } else {
            if (pool.totalCreated >= pool.maxSize) {
                console.warn(`Pool '${poolName}' has reached maximum size (${pool.maxSize})`);
                sprite = pool.available.length > 0 ? pool.available.pop() : pool.createFunction();
            } else {
                sprite = pool.createFunction();
                pool.totalCreated++;
            }
            this.poolStats.created++;
        }

        sprite.visible = true;
        this.activeSprites.get(poolName).add(sprite);
        
        return sprite;
    }

    returnSprite(poolName, sprite) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            throw new Error(`Pool '${poolName}' does not exist`);
        }

        const activeSet = this.activeSprites.get(poolName);
        if (!activeSet.has(sprite)) {
            console.warn(`Sprite not found in active set for pool '${poolName}'`);
            return;
        }

        sprite.visible = false;
        sprite.x = 0;
        sprite.y = 0;
        sprite.rotation = 0;
        sprite.scale.set(1);
        sprite.alpha = 1;
        sprite.tint = 0xffffff;

        if (sprite.texture) {
            sprite.texture = PIXI.Texture.EMPTY;
        }

        activeSet.delete(sprite);
        pool.available.push(sprite);
        this.poolStats.returned++;
    }

    returnAllSprites(poolName) {
        const activeSet = this.activeSprites.get(poolName);
        if (!activeSet) {
            throw new Error(`Pool '${poolName}' does not exist`);
        }

        const spritesToReturn = Array.from(activeSet);
        spritesToReturn.forEach(sprite => {
            this.returnSprite(poolName, sprite);
        });
    }

    getPoolInfo(poolName) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            throw new Error(`Pool '${poolName}' does not exist`);
        }

        const activeSet = this.activeSprites.get(poolName);
        return {
            name: poolName,
            available: pool.available.length,
            active: activeSet.size,
            totalCreated: pool.totalCreated,
            maxSize: pool.maxSize
        };
    }

    getAllPoolsInfo() {
        const info = [];
        for (const poolName of this.pools.keys()) {
            info.push(this.getPoolInfo(poolName));
        }
        return info;
    }

    getStats() {
        return {
            ...this.poolStats,
            efficiency: this.poolStats.created > 0 ? 
                (this.poolStats.reused / (this.poolStats.created + this.poolStats.reused)) * 100 : 0
        };
    }

    clearPool(poolName) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            throw new Error(`Pool '${poolName}' does not exist`);
        }

        this.returnAllSprites(poolName);
        
        pool.available.forEach(sprite => {
            if (sprite.destroy) {
                sprite.destroy();
            }
        });

        this.pools.delete(poolName);
        this.activeSprites.delete(poolName);
        
        console.log(`Cleared sprite pool '${poolName}'`);
    }

    clearAllPools() {
        const poolNames = Array.from(this.pools.keys());
        poolNames.forEach(poolName => {
            this.clearPool(poolName);
        });
    }

    optimizePool(poolName) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            throw new Error(`Pool '${poolName}' does not exist`);
        }

        const activeSet = this.activeSprites.get(poolName);
        const targetSize = Math.max(5, Math.ceil(activeSet.size * 1.5));
        
        if (pool.available.length > targetSize) {
            const toRemove = pool.available.splice(targetSize);
            toRemove.forEach(sprite => {
                if (sprite.destroy) {
                    sprite.destroy();
                }
            });
            pool.totalCreated -= toRemove.length;
            console.log(`Optimized pool '${poolName}': removed ${toRemove.length} unused sprites`);
        }
    }
}