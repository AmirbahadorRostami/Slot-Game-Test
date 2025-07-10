class SlotMachine {
    constructor() {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x1a1a1a,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        document.getElementById('gameContainer').appendChild(this.app.view);

        this.reelBands = [
            ["hv2", "lv3", "lv3", "hv1", "hv1", "lv1", "hv1", "hv4", "lv1", "hv3", "hv2", "hv3", "lv4", "hv4", "lv1", "hv2", "lv4", "lv1", "lv3", "hv2"],
            ["hv1", "lv2", "lv3", "lv2", "lv1", "lv1", "lv4", "lv1", "lv1", "hv4", "lv3", "hv2", "lv1", "lv3", "hv1", "lv1", "lv2", "lv4", "lv3", "lv2"],
            ["lv1", "hv2", "lv3", "lv4", "hv3", "hv2", "lv2", "hv2", "hv2", "lv1", "hv3", "lv1", "hv1", "lv2", "hv3", "hv2", "hv4", "hv1", "lv2", "lv4"],
            ["hv2", "lv2", "hv3", "lv2", "lv4", "lv4", "hv3", "lv2", "lv4", "hv1", "lv1", "hv1", "lv2", "hv3", "lv2", "lv3", "hv2", "lv1", "hv3", "lv2"],
            ["lv3", "lv4", "hv2", "hv3", "hv4", "hv1", "hv3", "hv2", "hv2", "hv4", "hv4", "hv2", "lv2", "hv4", "hv1", "lv2", "hv1", "lv2", "hv4", "lv4"]
        ];

        this.reelPositions = [0, 0, 0, 0, 0];

        this.payTable = {
            hv1: { 3: 10, 4: 20, 5: 50 },
            hv2: { 3: 5, 4: 10, 5: 20 },
            hv3: { 3: 5, 4: 10, 5: 15 },
            hv4: { 3: 5, 4: 10, 5: 15 },
            lv1: { 3: 2, 4: 5, 5: 10 },
            lv2: { 3: 1, 4: 2, 5: 5 },
            lv3: { 3: 1, 4: 2, 5: 3 },
            lv4: { 3: 1, 4: 2, 5: 3 }
        };

        this.payLines = [
            [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]],
            [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
            [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]],
            [[0, 0], [0, 1], [1, 2], [2, 3], [2, 4]],
            [[2, 0], [2, 1], [1, 2], [0, 3], [0, 4]],
            [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4]],
            [[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]]
        ];

        this.symbolSprites = [];
        this.gameContainer = new PIXI.Container();
        this.app.stage.addChild(this.gameContainer);

        this.loadAssets();
        this.setupResize();
    }

    async loadAssets() {
        this.loadingText = new PIXI.Text('Loading: 0%', {
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xffffff,
            align: 'center'
        });
        this.loadingText.anchor.set(0.5);
        this.loadingText.x = this.app.screen.width / 2;
        this.loadingText.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.loadingText);

        const assets = [
            'assets/hv1_symbol.png',
            'assets/hv2_symbol.png',
            'assets/hv3_symbol.png',
            'assets/hv4_symbol.png',
            'assets/lv1_symbol.png',
            'assets/lv2_symbol.png',
            'assets/lv3_symbol.png',
            'assets/lv4_symbol.png',
            'assets/spin_button.png'
        ];

        this.textures = {};
        let loadedCount = 0;
        const totalAssets = assets.length;

        for (const asset of assets) {
            try {
                const texture = await PIXI.Texture.from(asset);
                const key = asset.split('/').pop().replace('.png', '');
                this.textures[key] = texture;
                loadedCount++;
                this.loadingText.text = `Loading: ${Math.round((loadedCount / totalAssets) * 100)}%`;
            } catch (error) {
                console.error(`Failed to load ${asset}:`, error);
            }
        }

        this.app.stage.removeChild(this.loadingText);
        this.initGame();
    }

    initGame() {
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
        const symbolSize = 100;
        const symbolSpacing = 110;

        for (let col = 0; col < 5; col++) {
            this.symbolSprites[col] = [];
            for (let row = 0; row < 3; row++) {
                const sprite = new PIXI.Sprite();
                sprite.width = symbolSize;
                sprite.height = symbolSize;
                sprite.x = col * symbolSpacing;
                sprite.y = row * symbolSpacing;
                this.reelsContainer.addChild(sprite);
                this.symbolSprites[col][row] = sprite;
            }
        }
    }

    createSpinButton() {
        this.spinButton = new PIXI.Sprite(this.textures['spin_button']);
        this.spinButton.anchor.set(0.5);
        this.spinButton.width = 120;
        this.spinButton.height = 120;
        this.spinButton.interactive = true;
        this.spinButton.buttonMode = true;
        this.spinButton.on('pointerdown', () => this.spin());
        this.gameContainer.addChild(this.spinButton);
    }

    createWinDisplay() {
        this.winText = new PIXI.Text('Total wins: 0', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            align: 'left',
            wordWrap: true,
            wordWrapWidth: 600
        });
        this.gameContainer.addChild(this.winText);
    }

    updateSymbols() {
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const bandIndex = (this.reelPositions[col] + row) % this.reelBands[col].length;
                const symbolId = this.reelBands[col][bandIndex];
                const texture = this.textures[`${symbolId}_symbol`];
                this.symbolSprites[col][row].texture = texture;
            }
        }
    }

    spin() {
        for (let i = 0; i < 5; i++) {
            this.reelPositions[i] = Math.floor(Math.random() * this.reelBands[i].length);
        }
        this.updateSymbols();
        this.calculateWins();
    }

    getVisibleSymbols() {
        const symbols = [];
        for (let row = 0; row < 3; row++) {
            symbols[row] = [];
            for (let col = 0; col < 5; col++) {
                const bandIndex = (this.reelPositions[col] + row) % this.reelBands[col].length;
                symbols[row][col] = this.reelBands[col][bandIndex];
            }
        }
        return symbols;
    }

    calculateWins() {
        const symbols = this.getVisibleSymbols();
        let totalWins = 0;
        const winDetails = [];

        this.payLines.forEach((payLine, payLineIndex) => {
            const lineSymbols = payLine.map(([row, col]) => symbols[row][col]);
            const firstSymbol = lineSymbols[0];
            
            let matchCount = 1;
            for (let i = 1; i < lineSymbols.length; i++) {
                if (lineSymbols[i] === firstSymbol) {
                    matchCount++;
                } else {
                    break;
                }
            }

            if (matchCount >= 3 && this.payTable[firstSymbol]) {
                const payout = this.payTable[firstSymbol][matchCount] || 0;
                if (payout > 0) {
                    totalWins += payout;
                    winDetails.push({
                        payLine: payLineIndex + 1,
                        symbol: firstSymbol,
                        count: matchCount,
                        payout: payout
                    });
                }
            }
        });

        this.displayWins(totalWins, winDetails);
    }

    displayWins(totalWins, winDetails) {
        let winString = `Total wins: ${totalWins}`;
        
        if (winDetails.length > 0) {
            winString += '\n';
            winDetails.forEach(win => {
                winString += `- payline ${win.payLine}, ${win.symbol} x${win.count}, ${win.payout}\n`;
            });
        }

        this.winText.text = winString;
    }

    resize() {
        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;

        const gameWidth = 550;
        const gameHeight = 600;

        const scale = Math.min(screenWidth / gameWidth, screenHeight / gameHeight) * 0.9;
        this.gameContainer.scale.set(scale);

        this.gameContainer.x = (screenWidth - gameWidth * scale) / 2;
        this.gameContainer.y = (screenHeight - gameHeight * scale) / 2;

        this.reelsContainer.x = 0;
        this.reelsContainer.y = 0;

        this.spinButton.x = gameWidth / 2;
        this.spinButton.y = 380;

        this.winText.x = 0;
        this.winText.y = 450;
        this.winText.style.wordWrapWidth = gameWidth;

        const availableHeight = gameHeight - 450;
        const maxFontSize = Math.min(24, availableHeight / 10);
        this.winText.style.fontSize = maxFontSize;
    }

    setupResize() {
        window.addEventListener('resize', () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
            this.resize();
        });
    }
}

window.addEventListener('load', () => {
    new SlotMachine();
});