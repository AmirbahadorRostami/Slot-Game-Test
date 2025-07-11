import { GameConfig } from './config/GameConfig.js';
import { AssetLoader } from './services/AssetLoader.js';
import { WinningLogic } from './services/WinningLogic.js';
import { ReelManager } from './services/ReelManager.js';
import { SpritePool } from './services/SpritePool.js';
import { RenderOptimizer } from './services/RenderOptimizer.js';
import { PerformanceMonitor } from './services/PerformanceMonitor.js';

class SlotMachine {
    constructor() {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: GameConfig.DISPLAY.BACKGROUND_COLOR,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        document.getElementById('gameContainer').appendChild(this.app.view);

        this.assetLoader = new AssetLoader();
        this.winningLogic = new WinningLogic();
        this.reelManager = new ReelManager();
        this.spritePool = new SpritePool();
        this.renderOptimizer = new RenderOptimizer(this.app);
        this.performanceMonitor = new PerformanceMonitor();

        this.symbolSprites = [];
        this.gameContainer = new PIXI.Container();
        this.app.stage.addChild(this.gameContainer);

        this.loadAssets();
        this.setupResize();
    }

    async loadAssets() {
        this.loadingText = new PIXI.Text('Loading: 0%', {
            fontFamily: GameConfig.UI.LOADING_TEXT.FONT_FAMILY,
            fontSize: GameConfig.UI.LOADING_TEXT.FONT_SIZE,
            fill: GameConfig.UI.LOADING_TEXT.FILL,
            align: GameConfig.UI.LOADING_TEXT.ALIGN
        });
        this.loadingText.anchor.set(0.5);
        this.loadingText.x = this.app.screen.width / 2;
        this.loadingText.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.loadingText);

        this.assetLoader.setProgressCallback((progress) => {
            this.loadingText.text = `Loading: ${progress}%`;
        });

        try {
            this.textures = await this.assetLoader.loadAssets();
            await this.renderOptimizer.preloadTextures(Object.values(this.textures));
            this.app.stage.removeChild(this.loadingText);
            this.initGame();
        } catch (error) {
            console.error('Failed to load assets:', error);
            this.loadingText.text = 'Loading failed!';
        }
    }

    initGame() {
        this.setupSpritePool();
        this.setupRenderOptimization();
        this.setupPerformanceMonitoring();
        this.createReels();
        this.createSpinButton();
        this.createWinDisplay();
        this.updateSymbols();
        this.resize();
    }

    createReels() {
        this.reelsContainer = new PIXI.Container();
        this.gameContainer.addChild(this.reelsContainer);

        this.symbolSprites = [];
        const symbolSize = GameConfig.SYMBOLS.SIZE;
        const symbolSpacing = GameConfig.SYMBOLS.SPACING;

        for (let col = 0; col < GameConfig.REELS.COLUMNS; col++) {
            this.symbolSprites[col] = [];
            for (let row = 0; row < GameConfig.REELS.ROWS; row++) {
                const sprite = this.spritePool.getSprite('symbols');
                sprite.width = symbolSize;
                sprite.height = symbolSize;
                sprite.x = col * symbolSpacing;
                sprite.y = row * symbolSpacing;
                this.reelsContainer.addChild(sprite);
                this.symbolSprites[col][row] = sprite;
                this.renderOptimizer.addSpriteToGroup('reels', sprite);
            }
        }
    }

    createSpinButton() {
        this.spinButton = new PIXI.Sprite(this.assetLoader.getTexture('spin_button'));
        this.spinButton.anchor.set(0.5);
        this.spinButton.width = GameConfig.UI.SPIN_BUTTON.WIDTH;
        this.spinButton.height = GameConfig.UI.SPIN_BUTTON.HEIGHT;
        this.spinButton.interactive = true;
        // PIXI.js 7.x compatibility
        if ('buttonMode' in this.spinButton) {
            this.spinButton.buttonMode = true;
        } else if ('cursor' in this.spinButton) {
            this.spinButton.cursor = 'pointer';
        }
        this.spinButton.on('pointerdown', () => this.spin());
        this.gameContainer.addChild(this.spinButton);
    }

    createWinDisplay() {
        this.winText = new PIXI.Text('Total wins: 0', {
            fontFamily: GameConfig.UI.WIN_TEXT.FONT_FAMILY,
            fontSize: GameConfig.UI.WIN_TEXT.FONT_SIZE,
            fill: GameConfig.UI.WIN_TEXT.FILL,
            align: GameConfig.UI.WIN_TEXT.ALIGN,
            wordWrap: true,
            wordWrapWidth: 600
        });
        this.gameContainer.addChild(this.winText);
    }

    updateSymbols() {
        let symbolCount = 0;
        for (let col = 0; col < GameConfig.REELS.COLUMNS; col++) {
            for (let row = 0; row < GameConfig.REELS.ROWS; row++) {
                const symbolId = this.reelManager.getSymbolAt(col, row);
                const texture = this.assetLoader.getTexture(`${symbolId}_symbol`);
                this.symbolSprites[col][row].texture = texture;
                symbolCount++;
            }
        }
        this.performanceMonitor.recordGameEvent('symbolUpdate', { count: symbolCount });
        this.renderOptimizer.markGroupDirty('reels');
    }

    spin() {
        this.performanceMonitor.recordGameEvent('spin');
        this.reelManager.spin();
        this.updateSymbols();
        this.calculateWins();
    }

    getVisibleSymbols() {
        return this.reelManager.getVisibleSymbols();
    }

    calculateWins() {
        const symbols = this.getVisibleSymbols();
        const winResult = this.winningLogic.calculateWins(symbols);
        this.displayWins(winResult.totalWins, winResult.winDetails);
        this.performanceMonitor.recordGameEvent('winCalculation');
    }

    displayWins(totalWins, winDetails) {
        const winString = this.winningLogic.formatWinDisplay(totalWins, winDetails);
        this.winText.text = winString;
    }

    resize() {
        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;

        const gameWidth = GameConfig.DISPLAY.GAME_WIDTH;
        const gameHeight = GameConfig.DISPLAY.GAME_HEIGHT;

        const scale = Math.min(screenWidth / gameWidth, screenHeight / gameHeight) * GameConfig.DISPLAY.SCALE_FACTOR;
        this.gameContainer.scale.set(scale);

        this.gameContainer.x = (screenWidth - gameWidth * scale) / 2;
        this.gameContainer.y = (screenHeight - gameHeight * scale) / 2;

        this.reelsContainer.x = 0;
        this.reelsContainer.y = 0;

        this.spinButton.x = gameWidth / 2;
        this.spinButton.y = GameConfig.UI.SPIN_BUTTON.Y;

        this.winText.x = GameConfig.UI.WIN_TEXT.X;
        this.winText.y = GameConfig.UI.WIN_TEXT.Y;
        this.winText.style.wordWrapWidth = gameWidth;

        const availableHeight = gameHeight - GameConfig.UI.WIN_TEXT.Y;
        const maxFontSize = Math.min(GameConfig.UI.WIN_TEXT.MAX_FONT_SIZE, availableHeight / 10);
        this.winText.style.fontSize = maxFontSize;
    }

    setupResize() {
        window.addEventListener('resize', () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
            this.resize();
        });
    }

    setupSpritePool() {
        this.spritePool.createPool('symbols', () => {
            const sprite = new PIXI.Sprite();
            sprite.anchor.set(0);
            return sprite;
        }, GameConfig.REELS.COLUMNS * GameConfig.REELS.ROWS);

        this.spritePool.createPool('effects', () => {
            const sprite = new PIXI.Sprite();
            sprite.anchor.set(0.5);
            return sprite;
        }, 10);
    }

    setupRenderOptimization() {
        this.renderOptimizer.createRenderGroup('reels', this.reelsContainer, {
            enableCulling: true,
            enableBatching: true,
            updateFrequency: 1
        });

        this.renderOptimizer.createRenderGroup('ui', this.gameContainer, {
            enableCulling: false,
            enableBatching: true,
            updateFrequency: 2,
            staticContent: true
        });

        this.renderOptimizer.enableAutoOptimization();
    }

    setupPerformanceMonitoring() {
        this.performanceMonitor.startMonitoring(1000);
        
        if (window.location.search.includes('debug') || __DEV__) {
            this.performanceMonitor.createDebugPanel();
        }
    }

    getPerformanceStats() {
        return {
            spritePool: this.spritePool.getStats(),
            renderOptimizer: this.renderOptimizer.getPerformanceMetrics(),
            poolInfo: this.spritePool.getAllPoolsInfo(),
            monitor: this.performanceMonitor.getMetrics()
        };
    }

    logPerformanceStats() {
        const stats = this.getPerformanceStats();
        console.log('Performance Stats:', stats);
        this.performanceMonitor.logMetrics();
        
        const warnings = this.performanceMonitor.getPerformanceWarnings();
        if (warnings.length > 0) {
            console.warn('Performance Warnings:', warnings);
        }
    }
}

// Application initialization
function initializeGame() {
    const game = new SlotMachine();
    
    // Global access for debugging
    if (__DEV__ || window.location.search.includes('debug')) {
        window.game = game;
        window.getPerformanceStats = () => game.getPerformanceStats();
        window.logPerformanceStats = () => game.logPerformanceStats();
        window.exportPerformanceMetrics = () => game.performanceMonitor.exportMetrics();
        
        setInterval(() => {
            game.logPerformanceStats();
        }, 10000);
        
        console.log('🎮 Game loaded in development mode');
        console.log('Available debug commands:');
        console.log('- window.getPerformanceStats()');
        console.log('- window.logPerformanceStats()');
        console.log('- window.exportPerformanceMetrics()');
    }

    return game;
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

// Export for potential module usage
export { SlotMachine };