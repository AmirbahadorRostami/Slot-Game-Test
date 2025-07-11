export class RenderOptimizer {
    constructor(app) {
        this.app = app;
        this.renderGroups = new Map();
        this.cullingBounds = new PIXI.Rectangle();
        this.dirtyRegions = new Set();
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.averageFPS = 60;
        this.performanceMetrics = {
            drawCalls: 0,
            textureSwaps: 0,
            verticesDrawn: 0,
            culledSprites: 0
        };
        
        this.setupOptimizations();
    }

    setupOptimizations() {
        // Modern PIXI.js 7.x optimizations
        try {
            // Try to set batch size if available
            if (this.app.renderer.batch && this.app.renderer.batch.setMaxTextures) {
                this.app.renderer.batch.setMaxTextures(16);
            }
            
            // Setup prepare plugin if available
            if (this.app.renderer.plugins && this.app.renderer.plugins.prepare) {
                this.app.renderer.plugins.prepare.uploadHook = (helper, item) => {
                    if (item.texture && item.texture.baseTexture) {
                        helper.register(item.texture.baseTexture);
                    }
                };
            }
        } catch (error) {
            console.warn('Some PIXI.js optimizations not available:', error.message);
        }

        this.updateCullingBounds();
        window.addEventListener('resize', () => this.updateCullingBounds());
    }

    updateCullingBounds() {
        const padding = 100;
        this.cullingBounds.x = -padding;
        this.cullingBounds.y = -padding;
        this.cullingBounds.width = this.app.screen.width + (padding * 2);
        this.cullingBounds.height = this.app.screen.height + (padding * 2);
    }

    createRenderGroup(groupName, container, options = {}) {
        const group = {
            container: container,
            sprites: new Set(),
            lastUpdate: 0,
            updateFrequency: options.updateFrequency || 1,
            enableCulling: options.enableCulling !== false,
            enableBatching: options.enableBatching !== false,
            staticContent: options.staticContent || false,
            isDirty: true
        };

        if (group.enableBatching && container) {
            try {
                // PIXI.js 7.x compatibility - these properties may not exist
                if ('cacheAsBitmap' in container) {
                    container.cacheAsBitmap = false;
                }
                if ('interactiveChildren' in container) {
                    container.interactiveChildren = true;
                }
                // Alternative for PIXI.js 7.x
                if ('eventMode' in container) {
                    container.eventMode = 'auto';
                }
            } catch (error) {
                console.warn('Container optimization not available:', error.message);
            }
        }

        this.renderGroups.set(groupName, group);
        return group;
    }

    addSpriteToGroup(groupName, sprite) {
        const group = this.renderGroups.get(groupName);
        if (!group) {
            throw new Error(`Render group '${groupName}' does not exist`);
        }

        group.sprites.add(sprite);
        group.isDirty = true;

        if (group.enableCulling) {
            this.setupSpriteCulling(sprite);
        }
    }

    removeSpriteFromGroup(groupName, sprite) {
        const group = this.renderGroups.get(groupName);
        if (!group) {
            throw new Error(`Render group '${groupName}' does not exist`);
        }

        group.sprites.delete(sprite);
        group.isDirty = true;
    }

    setupSpriteCulling(sprite) {
        const renderOptimizer = this;
        const originalUpdateTransform = sprite.updateTransform;
        
        sprite.updateTransform = function() {
            originalUpdateTransform.call(this);
            
            if (this.parent && this.parent.worldVisible) {
                try {
                    const bounds = this.getBounds();
                    this.renderable = renderOptimizer.cullingBounds.intersects(bounds);
                    
                    if (!this.renderable) {
                        renderOptimizer.performanceMetrics.culledSprites++;
                    }
                } catch (error) {
                    // Fallback: keep sprite visible if bounds calculation fails
                    this.renderable = true;
                }
            }
        };
    }

    optimizeRenderGroup(groupName) {
        const group = this.renderGroups.get(groupName);
        if (!group || !group.isDirty) {
            return;
        }

        this.frameCount++;
        const shouldUpdate = this.frameCount % group.updateFrequency === 0;
        
        if (!shouldUpdate && !group.staticContent) {
            return;
        }

        if (group.enableCulling) {
            this.performCulling(group);
        }

        if (group.enableBatching) {
            this.optimizeBatching(group);
        }

        group.isDirty = false;
        group.lastUpdate = Date.now();
    }

    performCulling(group) {
        let culledCount = 0;
        
        for (const sprite of group.sprites) {
            if (!sprite.parent || !sprite.parent.worldVisible) {
                continue;
            }

            const bounds = sprite.getBounds();
            const isVisible = this.cullingBounds.intersects(bounds);
            
            if (sprite.renderable !== isVisible) {
                sprite.renderable = isVisible;
                if (!isVisible) {
                    culledCount++;
                }
            }
        }

        this.performanceMetrics.culledSprites += culledCount;
    }

    optimizeBatching(group) {
        const sprites = Array.from(group.sprites);
        
        sprites.sort((a, b) => {
            if (a.texture && b.texture) {
                if (a.texture.baseTexture.uid !== b.texture.baseTexture.uid) {
                    return a.texture.baseTexture.uid - b.texture.baseTexture.uid;
                }
            }
            return a.zIndex - b.zIndex;
        });

        sprites.forEach((sprite, index) => {
            if (sprite.parent) {
                const currentIndex = sprite.parent.getChildIndex(sprite);
                if (currentIndex !== index) {
                    sprite.parent.setChildIndex(sprite, index);
                }
            }
        });
    }

    markGroupDirty(groupName) {
        const group = this.renderGroups.get(groupName);
        if (group) {
            group.isDirty = true;
        }
    }

    preloadTextures(textures) {
        const textureArray = Array.isArray(textures) ? textures : [textures];
        
        return new Promise((resolve) => {
            try {
                if (this.app.renderer.plugins && this.app.renderer.plugins.prepare) {
                    this.app.renderer.plugins.prepare.add(textureArray);
                    this.app.renderer.plugins.prepare.upload(resolve);
                } else {
                    // Fallback: resolve immediately if prepare plugin not available
                    setTimeout(resolve, 0);
                }
            } catch (error) {
                console.warn('Texture preloading not available:', error.message);
                setTimeout(resolve, 0);
            }
        });
    }

    optimizeTextures(textures) {
        const textureMap = new Map();
        
        for (const [key, texture] of Object.entries(textures)) {
            if (texture && texture.baseTexture) {
                const baseTexture = texture.baseTexture;
                
                if (!textureMap.has(baseTexture.uid)) {
                    textureMap.set(baseTexture.uid, []);
                }
                textureMap.get(baseTexture.uid).push({ key, texture });
            }
        }

        return textureMap;
    }

    updatePerformanceMetrics() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        if (deltaTime > 0) {
            const fps = 1000 / deltaTime;
            this.averageFPS = (this.averageFPS * 0.9) + (fps * 0.1);
        }
        
        this.lastFrameTime = currentTime;

        try {
            if (this.app.renderer.gl) {
                const gl = this.app.renderer.gl;
                const ext = gl.getExtension('WEBGL_debug_renderer_info');
                if (ext && this.app.renderer.batch && this.app.renderer.batch.currentBatchSize) {
                    this.performanceMetrics.drawCalls = this.app.renderer.batch.currentBatchSize;
                }
            }
        } catch (error) {
            // Silently handle API changes
        }
    }

    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            averageFPS: Math.round(this.averageFPS),
            frameCount: this.frameCount,
            renderGroups: this.renderGroups.size,
            activeSprites: Array.from(this.renderGroups.values())
                .reduce((total, group) => total + group.sprites.size, 0)
        };
    }

    enableAutoOptimization() {
        this.app.ticker.add(() => {
            this.updatePerformanceMetrics();
            
            for (const [groupName] of this.renderGroups) {
                this.optimizeRenderGroup(groupName);
            }

            if (this.frameCount % 300 === 0) {
                this.performGarbageCollection();
            }
        });
    }

    performGarbageCollection() {
        for (const group of this.renderGroups.values()) {
            const spritesToRemove = [];
            
            for (const sprite of group.sprites) {
                if (!sprite.parent || sprite.destroyed) {
                    spritesToRemove.push(sprite);
                }
            }
            
            spritesToRemove.forEach(sprite => {
                group.sprites.delete(sprite);
            });
        }
    }

    destroy() {
        this.renderGroups.clear();
        this.dirtyRegions.clear();
    }
}