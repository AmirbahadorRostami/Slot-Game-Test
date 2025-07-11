export const GameConfig = {
    DISPLAY: {
        BACKGROUND_COLOR: 0x1a1a1a,
        GAME_WIDTH: 550,
        GAME_HEIGHT: 600,
        SCALE_FACTOR: 0.9
    },

    REELS: {
        COLUMNS: 5,
        ROWS: 3,
        BANDS: [
            ["hv2", "lv3", "lv3", "hv1", "hv1", "lv1", "hv1", "hv4", "lv1", "hv3", "hv2", "hv3", "lv4", "hv4", "lv1", "hv2", "lv4", "lv1", "lv3", "hv2"],
            ["hv1", "lv2", "lv3", "lv2", "lv1", "lv1", "lv4", "lv1", "lv1", "hv4", "lv3", "hv2", "lv1", "lv3", "hv1", "lv1", "lv2", "lv4", "lv3", "lv2"],
            ["lv1", "hv2", "lv3", "lv4", "hv3", "hv2", "lv2", "hv2", "hv2", "lv1", "hv3", "lv1", "hv1", "lv2", "hv3", "hv2", "hv4", "hv1", "lv2", "lv4"],
            ["hv2", "lv2", "hv3", "lv2", "lv4", "lv4", "hv3", "lv2", "lv4", "hv1", "lv1", "hv1", "lv2", "hv3", "lv2", "lv3", "hv2", "lv1", "hv3", "lv2"],
            ["lv3", "lv4", "hv2", "hv3", "hv4", "hv1", "hv3", "hv2", "hv2", "hv4", "hv4", "hv2", "lv2", "hv4", "hv1", "lv2", "hv1", "lv2", "hv4", "lv4"]
        ],
        INITIAL_POSITIONS: [0, 0, 0, 0, 0]
    },

    SYMBOLS: {
        SIZE: 100,
        SPACING: 110,
        TYPES: ['hv1', 'hv2', 'hv3', 'hv4', 'lv1', 'lv2', 'lv3', 'lv4']
    },

    ASSETS: {
        SYMBOL_PATHS: [
            '/assets/hv1_symbol.png',
            '/assets/hv2_symbol.png',
            '/assets/hv3_symbol.png',
            '/assets/hv4_symbol.png',
            '/assets/lv1_symbol.png',
            '/assets/lv2_symbol.png',
            '/assets/lv3_symbol.png',
            '/assets/lv4_symbol.png',
            '/assets/spin_button.png'
        ]
    },

    PAY_TABLE: {
        hv1: { 3: 10, 4: 20, 5: 50 },
        hv2: { 3: 5, 4: 10, 5: 20 },
        hv3: { 3: 5, 4: 10, 5: 15 },
        hv4: { 3: 5, 4: 10, 5: 15 },
        lv1: { 3: 2, 4: 5, 5: 10 },
        lv2: { 3: 1, 4: 2, 5: 5 },
        lv3: { 3: 1, 4: 2, 5: 3 },
        lv4: { 3: 1, 4: 2, 5: 3 }
    },

    PAY_LINES: [
        [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]],
        [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
        [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]],
        [[0, 0], [0, 1], [1, 2], [2, 3], [2, 4]],
        [[2, 0], [2, 1], [1, 2], [0, 3], [0, 4]],
        [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4]],
        [[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]]
    ],

    UI: {
        SPIN_BUTTON: {
            WIDTH: 120,
            HEIGHT: 120,
            X: 275,
            Y: 380
        },
        WIN_TEXT: {
            FONT_FAMILY: 'Arial',
            FONT_SIZE: 24,
            FILL: 0xffffff,
            ALIGN: 'left',
            X: 0,
            Y: 450,
            MAX_FONT_SIZE: 24
        },
        LOADING_TEXT: {
            FONT_FAMILY: 'Arial',
            FONT_SIZE: 36,
            FILL: 0xffffff,
            ALIGN: 'center'
        }
    },

    GAME_RULES: {
        MIN_MATCH_COUNT: 3,
        MAX_MATCH_COUNT: 5,
        WIN_DIRECTION: 'LEFT_TO_RIGHT'
    }
};