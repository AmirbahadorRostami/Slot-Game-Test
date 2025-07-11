export class MockPIXI {
    static createMockApp() {
        return {
            renderer: {
                plugins: {
                    batch: { setMaxTextures: () => {} },
                    prepare: { 
                        add: () => {},
                        upload: (callback) => callback && callback(),
                        uploadHook: null
                    }
                },
                resize: () => {},
                gl: null
            },
            screen: { width: 800, height: 600 },
            stage: {
                addChild: () => {},
                removeChild: () => {}
            },
            ticker: {
                add: () => {},
                remove: () => {}
            },
            view: document.createElement('canvas')
        };
    }

    static createMockTexture(name = 'mock-texture') {
        return {
            baseTexture: {
                uid: Math.random(),
                source: { src: `mock-${name}.png` }
            },
            width: 100,
            height: 100,
            valid: true
        };
    }

    static createMockSprite(texture) {
        return {
            texture: texture || MockPIXI.createMockTexture(),
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            visible: true,
            alpha: 1,
            rotation: 0,
            scale: { set: () => {}, x: 1, y: 1 },
            anchor: { set: () => {} },
            tint: 0xffffff,
            parent: null,
            destroyed: false,
            renderable: true,
            interactive: false,
            buttonMode: false,
            on: () => {},
            getBounds: () => ({ x: 0, y: 0, width: 100, height: 100 }),
            updateTransform: () => {},
            destroy: () => { this.destroyed = true; }
        };
    }

    static createMockContainer() {
        return {
            children: [],
            addChild(child) { 
                this.children.push(child); 
                child.parent = this;
            },
            removeChild(child) { 
                const index = this.children.indexOf(child);
                if (index > -1) {
                    this.children.splice(index, 1);
                    child.parent = null;
                }
            },
            getChildIndex(child) {
                return this.children.indexOf(child);
            },
            setChildIndex(child, index) {
                this.removeChild(child);
                this.children.splice(index, 0, child);
            },
            x: 0,
            y: 0,
            visible: true,
            worldVisible: true,
            scale: { set: () => {}, x: 1, y: 1 },
            cacheAsBitmap: false,
            interactiveChildren: true
        };
    }

    static createMockText(text = 'Mock Text') {
        return {
            text,
            x: 0,
            y: 0,
            anchor: { set: () => {} },
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                wordWrapWidth: 600
            }
        };
    }

    static createMockRectangle() {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            intersects(other) {
                return !(this.x > other.x + other.width || 
                        this.x + this.width < other.x || 
                        this.y > other.y + other.height || 
                        this.y + this.height < other.y);
            }
        };
    }

    static setupGlobalMocks() {
        if (typeof global !== 'undefined') {
            global.PIXI = {
                Application(options) { return MockPIXI.createMockApp(); },
                Sprite(texture) { return MockPIXI.createMockSprite(texture); },
                Container() { return MockPIXI.createMockContainer(); },
                Text(text, style) { return MockPIXI.createMockText(text); },
                Rectangle() { return MockPIXI.createMockRectangle(); },
                Texture: {
                    from: async (url) => MockPIXI.createMockTexture(url),
                    EMPTY: MockPIXI.createMockTexture('empty')
                }
            };
        }

        if (typeof window !== 'undefined') {
            window.PIXI = global.PIXI;
        }
    }
}

export class MockAssetLoader {
    constructor() {
        this.textures = {};
        this.loadingProgress = 0;
        this.onProgressUpdate = null;
    }

    async loadAssets() {
        const assets = ['hv1_symbol', 'hv2_symbol', 'lv1_symbol', 'spin_button'];
        
        for (let i = 0; i < assets.length; i++) {
            await new Promise((resolve) => {
                setTimeout(resolve, 10);
            });
            this.textures[assets[i]] = MockPIXI.createMockTexture(assets[i]);
            this.loadingProgress = Math.round(((i + 1) / assets.length) * 100);
            if (this.onProgressUpdate) {
                this.onProgressUpdate(this.loadingProgress);
            }
        }

        return this.textures;
    }

    getTexture(key) {
        return this.textures[key] || MockPIXI.createMockTexture(key);
    }

    setProgressCallback(callback) {
        this.onProgressUpdate = callback;
    }
}

export class MockPerformance {
    static now() {
        return Date.now();
    }

    static setupGlobalMocks() {
        if (typeof global !== 'undefined' && !global.performance) {
            global.performance = {
                now: MockPerformance.now,
                memory: {
                    usedJSHeapSize: 1024 * 1024 * 50,
                    totalJSHeapSize: 1024 * 1024 * 100
                }
            };
        }

        if (typeof window !== 'undefined' && !window.performance) {
            window.performance = global.performance;
        }
    }
}

export class TestData {
    static getValidSymbols() {
        return [
            ['hv1', 'hv1', 'hv1', 'hv1', 'hv1'],
            ['lv2', 'lv2', 'lv2', 'hv2', 'hv3'],
            ['lv3', 'lv4', 'hv4', 'hv4', 'hv4']
        ];
    }

    static getWinningSymbols() {
        return [
            ['hv1', 'hv1', 'hv1', 'hv1', 'hv1'],
            ['hv2', 'hv2', 'hv2', 'hv2', 'lv1'],
            ['lv3', 'lv3', 'lv3', 'lv4', 'lv4']
        ];
    }

    static getNoWinSymbols() {
        return [
            ['hv1', 'hv2', 'hv3', 'hv4', 'lv1'],
            ['lv2', 'lv3', 'lv4', 'hv1', 'hv2'],
            ['hv3', 'hv4', 'lv1', 'lv2', 'lv3']
        ];
    }

    static getMockGameConfig() {
        return {
            REELS: {
                COLUMNS: 5,
                ROWS: 3,
                BANDS: [
                    ['hv1', 'hv2', 'hv3', 'hv4', 'lv1'],
                    ['lv2', 'lv3', 'lv4', 'hv1', 'hv2'],
                    ['hv3', 'hv4', 'lv1', 'lv2', 'lv3'],
                    ['lv4', 'hv1', 'hv2', 'hv3', 'hv4'],
                    ['lv1', 'lv2', 'lv3', 'lv4', 'hv1']
                ],
                INITIAL_POSITIONS: [0, 0, 0, 0, 0]
            },
            PAY_TABLE: {
                hv1: { 3: 10, 4: 20, 5: 50 },
                hv2: { 3: 5, 4: 10, 5: 20 },
                lv1: { 3: 2, 4: 5, 5: 10 },
                lv2: { 3: 1, 4: 2, 5: 5 }
            },
            PAY_LINES: [
                [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]],
                [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
                [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]]
            ],
            GAME_RULES: {
                MIN_MATCH_COUNT: 3
            },
            ASSETS: {
                SYMBOL_PATHS: [
                    'assets/hv1_symbol.png',
                    'assets/hv2_symbol.png',
                    'assets/lv1_symbol.png',
                    'assets/spin_button.png'
                ]
            }
        };
    }
}

export function setupTestEnvironment() {
    MockPIXI.setupGlobalMocks();
    MockPerformance.setupGlobalMocks();
    
    if (typeof document === 'undefined') {
        global.document = {
            createElement: (tag) => {
                if (tag === 'canvas') {
                    return { getContext: () => ({}) };
                }
                return {
                    style: {},
                    appendChild: () => {},
                    innerHTML: '',
                    click: () => {}
                };
            },
            body: { appendChild: () => {} },
            getElementById: () => ({ appendChild: () => {} })
        };
    }

    if (typeof window === 'undefined') {
        global.window = {
            innerWidth: 800,
            innerHeight: 600,
            devicePixelRatio: 1,
            addEventListener: () => {},
            location: { search: '' }
        };
    }
}